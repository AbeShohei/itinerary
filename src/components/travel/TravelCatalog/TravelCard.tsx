import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Trash2, Eye, Moon } from 'lucide-react';
import { Travel } from '../../../types/Travel';

/**
 * 旅行カードコンポーネントのプロパティ
 * 
 * @param travel - 表示する旅行データ
 * @param onSelect - 旅行選択時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 * @param onUpdate - 更新時のコールバック
 */
interface TravelCardProps {
  travel: Travel;
  onSelect: (travel: Travel) => void;
  onDelete: (travelId: string) => Promise<void>;
  onUpdate: (updatedTravel: Travel) => Promise<void>;
}

/**
 * 旅行カードコンポーネント
 * 旅行の基本情報を表示し、選択・編集・削除の操作を提供
 */
const TravelCard: React.FC<TravelCardProps> = ({ 
  travel, 
  onSelect, 
  onDelete,
  onUpdate
}) => {
  /**
   * 旅行のステータスに応じた色とラベルを取得
   */
  const getStatusInfo = (status: Travel['status']) => {
    switch (status) {
      case 'planning':
        return { color: 'bg-yellow-100 text-yellow-800', label: '計画中' };
      case 'confirmed':
        return { color: 'bg-green-100 text-green-800', label: '確定済み' };
      case 'completed':
        return { color: 'bg-gray-100 text-gray-800', label: '完了' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: '' };
    }
  };

  const statusInfo = getStatusInfo(travel.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full">
      {/* ヘッダーエリア */}
      <div className="p-4 pb-2 relative">
        {/* ステータスバッジ */}
        <div className="mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* 編集・削除アイコンを右上にコンパクト配置 */}
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(travel); }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="編集"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(travel.id); }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
      </div>

        {/* タイトル */}
        <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-gray-100">{travel.title}</h3>
        </div>
        
        {/* 説明 */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2 min-h-[40px] dark:text-gray-200">
          {travel.description?.trim() ? travel.description : "説明未設定"}
        </p>
      </div>
        
      {/* コンテンツエリア */}
      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* 基本情報（コンパクト横並び・等サイズ） */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400 items-center">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{travel.destination && travel.destination.trim() ? travel.destination : '未設定'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{travel.dates}</span>
            {travel.duration && (
              <span className="ml-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-300">
                ／ {travel.duration}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{travel.member_count || travel.memberCount}名</span>
            <span className="ml-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-300">
            <DollarSign className="h-4 w-4" />
              ¥{travel.budget.toLocaleString()}
            </span>
          </div>
        </div>
        {/* フッター */}
        <div className="flex flex-col mt-auto">
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onSelect(travel)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 h-10 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:text-gray-100 dark:hover:bg-blue-900"
              >
                <Eye className="h-4 w-4" />
                詳細を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelCard; 