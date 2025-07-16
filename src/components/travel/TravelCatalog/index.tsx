import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import TravelCard from './TravelCard';
import TravelFilters from './TravelFilters';
import TravelCatalogHeader from './TravelCatalogHeader';
import { Travel } from '../../../types/Travel';
import { travelApi } from '../../../services/travelApi';
import DeleteConfirmModal from './DeleteConfirmModal';
import AddIcon from '@mui/icons-material/Add';
import { User } from '@supabase/supabase-js';
import EditTravelModal from './EditTravelModal';
import { memberApi } from '../../../services/memberApi';

/**
 * 旅行カタログコンポーネントのプロパティ
 * 
 * @param onSelectTravel - 旅行選択時のコールバック
 * @param onCreateNew - 新しい旅行作成時のコールバック
 */
interface TravelCatalogProps {
  user: { id: string };
  onSelectTravel: (travel: any) => void;
  onCreateNew: () => void;
}

/**
 * 旅行カタログコンポーネント
 * 旅行一覧を表示し、検索・フィルタリング機能を提供
 */
const TravelCatalog: React.FC<TravelCatalogProps> = ({ 
  user,
  onSelectTravel, 
  onCreateNew 
}) => {
  // 旅行データ
  const [travels, setTravels] = useState<Travel[]>([]);
  
  // ローディング状態
  const [loading, setLoading] = useState(true);
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    destination: 'all'
  });

  // フィルター表示状態
  const [showFilters, setShowFilters] = useState(false);

  // 削除確認モーダル用のstate
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 編集モーダル用のstate
  const [editTarget, setEditTarget] = useState<Travel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /**
   * 旅行データを取得
   */
  const fetchTravels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await travelApi.getTravels();
      // user_idが一致するものだけに絞る
      const ownTravels = (data || []).filter(travel => travel.user_id === user.id);
      // 共有された旅行も取得
      let sharedTravels: any[] = [];
      if (user.email) {
        const memberRecords = await memberApi.getMembersByEmail(user.email);
        const sharedTravelIds = memberRecords.map(m => m.travel_id);
        sharedTravels = data.filter(travel => sharedTravelIds.includes(travel.id));
      }
      // 重複を除外して結合
      const allTravels = [...ownTravels, ...sharedTravels.filter(t => !ownTravels.some(o => o.id === t.id))];
      // ダミーデータで詳細情報を補完
      const travelsWithDetails = allTravels.map((travel, index) => {
        // DBから取得したstart_dateとend_dateを使用
        const startDate = travel.start_date ? new Date(travel.start_date) : new Date();
        const endDate = travel.end_date ? new Date(travel.end_date) : new Date();
        // 泊まる日数を正しく計算（終了日は含まない）
        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const days = nights + 1; // 旅行日数（泊数+1）
        const travelWithDetails = {
          ...travel,
          id: travel.id || `travel-${index}`,
          member_count: travel.member_count || travel.memberCount || Math.floor(Math.random() * 6) + 2,
          duration: `${nights}泊${days}日`,
          startDate: travel.start_date || startDate.toISOString().split('T')[0],
          endDate: travel.end_date || endDate.toISOString().split('T')[0],
          destination: travel.destination || '沖縄県那覇市'
        };
        return travelWithDetails;
      });
      setTravels(travelsWithDetails);
    } catch (err) {
      console.error('旅行データ取得エラー:', err);
      setError('旅行データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 旅行を削除
   */
  const handleDeleteTravel = async (id: string) => {
    try {
      await travelApi.deleteTravel(id);
      setTravels(prev => prev.filter(travel => travel.id !== id));
      // 削除成功後にモーダルを閉じる
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetTitle('');
    } catch (err: any) {
      // 404エラー（すでに削除済み）は無視して travels から除外
      if (err?.response?.status === 404) {
        setTravels(prev => prev.filter(travel => travel.id !== id));
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        setDeleteTargetTitle('');
        return;
      }
      console.error('旅行削除エラー:', err);
      setError('旅行の削除に失敗しました');
    }
  };

  /**
   * 旅行を更新
   */
  const handleUpdateTravel = async (updatedTravel: Travel) => {
    try {
      // キャメルケース→スネークケース変換
      const { startDate, endDate, memberCount, travelType, updatedAt, ...rest } = updatedTravel;
      const updates = {
        ...rest,
        start_date: startDate,
        end_date: endDate,
        member_count: memberCount ?? updatedTravel.member_count,
        travel_type: travelType ?? updatedTravel.travel_type,
        updated_at: updatedAt ?? new Date().toISOString().split('T')[0], // ← 追加
      };
      const updated = await travelApi.updateTravel(updatedTravel.id, updates);
      setTravels(prev => prev.map(travel => 
        travel.id === updated.id ? updated : travel
      ));
      setIsEditModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      console.error('旅行更新エラー:', err);
      setError('旅行の更新に失敗しました');
    }
  };

  // 初回読み込み時にデータを取得
  useEffect(() => {
    fetchTravels();
  }, []);

  /**
   * フィルタリングされた旅行を取得
   */
  const filteredTravels = travels.filter(travel => {
    const matchesSearch = travel.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         travel.destination.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || travel.status === filters.status;
    const matchesDestination = filters.destination === 'all' || travel.destination === filters.destination;
    
    return matchesSearch && matchesStatus && matchesDestination;
  });

  /**
   * 検索クエリを更新
   */
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  /**
   * フィルターを更新
   */
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // 削除ボタン押下時
  const handleDeleteClick = (id: string, title: string) => {
    setDeleteTargetId(id);
    setDeleteTargetTitle(title);
    setIsDeleteModalOpen(true);
  };

  // 編集ボタン押下時
  const handleEditClick = (travel: Travel) => {
    setEditTarget(travel);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <TravelCatalogHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索とフィルター */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="旅行を検索..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
            
            {/* フィルターボタン */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4 dark:text-gray-300" />
              <span>フィルター</span>
            </button>
          </div>
          
          {/* フィルターパネル */}
          {showFilters && (
            <div className="mt-4">
              <TravelFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchTravels}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              再試行
            </button>
          </div>
        )}

        {/* ローディング状態 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* 旅行一覧 */}
        {!loading && !error && (
          <>
            {filteredTravels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {filters.search || filters.status !== 'all' || filters.destination !== 'all'
                    ? '条件に一致する旅行が見つかりません'
                    : 'まだ旅行がありません'
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.status !== 'all' || filters.destination !== 'all'
                    ? '検索条件を変更するか、新しい旅行を作成してください'
                    : '最初の旅行を作成して、素晴らしい旅の計画を始めましょう'
                  }
                </p>
                {!filters.search && filters.status === 'all' && filters.destination === 'all' && (
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    新しい旅行を作成
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredTravels.map(travel => (
                  <TravelCard
                    key={travel.id || travel._id}
                    travel={{ ...travel, id: travel.id || travel._id }}
                    onSelect={onSelectTravel}
                    onDelete={() => handleDeleteClick(travel.id, travel.title)}
                    onUpdate={handleEditClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title={deleteTargetTitle}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDeleteTravel(deleteTargetId);
          }
        }}
      />

      {/* 編集モーダル */}
      <EditTravelModal
        isOpen={isEditModalOpen}
        travel={editTarget}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTravel}
      />

      {/* 右下のプラスボタン */}
      <button
        onClick={onCreateNew}
        className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        aria-label="新しい旅行を作成"
      >
        <AddIcon style={{ fontSize: 32 }} />
      </button>
    </div>
  );
};

export default TravelCatalog; 