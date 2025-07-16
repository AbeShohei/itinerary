import React, { useState, useRef, useEffect } from 'react';
import { Plus, Moon, Sun, Settings, LogOut, User } from 'lucide-react';
import Button from '../../common/Button';
import { User as SupabaseUser } from '@supabase/supabase-js';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShareIcon from '@mui/icons-material/Share';
import { supabase } from "../../../services/supabase";
import { travelApi } from '../../../services/travelApi';
import { memberApi } from '../../../services/memberApi';
import { budgetApi } from '../../../services/travelApi';
import { notesApi } from '../../../services/notesApi';
import { packingApi } from '../../../services/packingApi';

/**
 * 旅行カタログヘッダーコンポーネントのプロパティ
 * 
 * @param onCreateNew - 新しい旅行作成ボタンクリック時のコールバック
 */
interface TravelCatalogHeaderProps {
  user: SupabaseUser;
}

/**
 * 旅行カタログヘッダーコンポーネント
 * アプリのタイトルと新しい旅行作成ボタンを表示
 */
const TravelCatalogHeader: React.FC<TravelCatalogHeaderProps> = ({ user }) => {
  const [isDark, setIsDark] = React.useState(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // --- 追加: shareEmailのuseState宣言 ---
  const [shareEmail, setShareEmail] = useState('');
  // useEffectやprofile stateの削除
  // プロフィールメニューの外側をクリックした時にメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const body = document.body;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      body.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      body.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleUserSettings = () => {
    // ユーザー設定画面への遷移（将来的に実装）
    console.log('ユーザー設定画面を開く');
    setIsProfileMenuOpen(false);
  };

  // --- 追加: 旅行リストと選択状態 ---
  const [shareTravels, setShareTravels] = useState<{id: string, title: string}[]>([]);
  const [selectedShareTravelId, setSelectedShareTravelId] = useState('');
  // 旅行ごとに共有ユーザーを分ける（仮実装）
  const [shareUsersMap, setShareUsersMap] = useState<{[travelId: string]: {email: string}[]}>({});
  const shareUsers = shareUsersMap[selectedShareTravelId] || [];
  const handleAddShareUser = () => {
    if (!shareEmail || !shareEmail.includes('@')) return;
    if (shareUsers.some(u => u.email === shareEmail)) return;
    setShareUsersMap(prev => ({
      ...prev,
      [selectedShareTravelId]: [...(prev[selectedShareTravelId] || []), {email: shareEmail}]
    }));
    setShareEmail('');
  };
  const handleRemoveShareUser = (idx: number) => {
    setShareUsersMap(prev => ({
      ...prev,
      [selectedShareTravelId]: (prev[selectedShareTravelId] || []).filter((_, i) => i !== idx)
    }));
  };

  useEffect(() => {
    // ユーザーの旅行データを取得
    const fetchTravels = async () => {
      const allTravels = await travelApi.getTravels();
      const userTravels = allTravels.filter(t => t.user_id === user.id);
      setShareTravels(userTravels.map(t => ({ id: t.id, title: t.title })));
      if (userTravels.length > 0) setSelectedShareTravelId(userTravels[0].id);
    };
    fetchTravels();
  }, [user.id]);

  const handleShare = async () => {
    if (!selectedShareTravelId || !shareUsersMap[selectedShareTravelId] || shareUsersMap[selectedShareTravelId].length === 0) {
      alert('共有したいユーザーを追加してください');
      return;
    }
    try {
      for (const user of shareUsersMap[selectedShareTravelId]) {
        // メンバー追加
        await memberApi.createMember({
          travel_id: selectedShareTravelId,
          name: user.email, // 仮でメールアドレスを名前に
          gender: 'male', // 仮値
          preferences: [], // 仮値
        });
        // 予算コピー
        const budgets = await budgetApi.getBudgets(selectedShareTravelId, user.id);
        for (const b of budgets) {
          await budgetApi.createBudget({
            travel_id: selectedShareTravelId,
            user_id: user.id,
            amount: b.amount,
            breakdown: b.breakdown
          });
        }
        // メモコピー
        const notes = await notesApi.getNotes(selectedShareTravelId, user.id);
        for (const n of notes) {
          await notesApi.createNote({
            travel_id: selectedShareTravelId,
            user_id: user.id,
            title: n.title,
            content: n.content,
            category: n.category,
            is_pinned: n.is_pinned
          });
        }
        // 持ち物コピー
        const items = await packingApi.getPackingItems(selectedShareTravelId, user.id);
        for (const i of items) {
          await packingApi.createPackingItem({
            travel_id: selectedShareTravelId,
            user_id: user.id,
            name: i.name,
            category: i.category,
            quantity: i.quantity || 1,
            is_packed: false,
            is_essential: i.is_essential || false
          });
        }
      }
      alert('共有が完了しました');
      setIsShareModalOpen(false);
    } catch (e) {
      alert('共有に失敗しました');
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        {/* モバイル: 縦並びレイアウト */}
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap min-h-[72px]">
          {/* タイトル・サブタイトル（縦並び）＋プロフィールアイコン（右端＆スペース） */}
          <div className="flex flex-row items-center justify-between min-h-[72px] w-full">
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold truncate">旅のしおり</h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg truncate">あなたの旅行プランを管理しましょう</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pr-4">
              {/* プロフィールアイコン */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="プロフィールメニュー"
                >
                  <AccountCircleIcon style={{ fontSize: '28px', color: '#fff' }} />
                </button>
                {/* ドロップダウンメニュー */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30">
                    {/* ユーザー情報 */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <AccountCircleIcon style={{ fontSize: '32px', color: '#6b7280' }} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[160px] truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ユーザー
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* メニュー項目 */}
                    <div className="py-1">
                      {/* 共有設定 */}
                      <button
                        onClick={() => {
                          setIsShareModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <ShareIcon className="h-4 w-4" />
                        共有設定
                      </button>
                      {/* ユーザー設定 */}
                      <button
                        onClick={handleUserSettings}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        ユーザー設定
                      </button>

                      {/* ダークモード切り替え */}
                      <button
                        onClick={() => {
                          toggleDarkMode();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {isDark ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        {isDark ? 'ライトモード' : 'ダークモード'}
                      </button>

                      {/* ログアウト */}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 共有設定モーダル（仮） */}
      {isShareModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            {/* 閉じる（×）ボタン 右上 */}
            <button
              className="absolute top-3 right-3 text-black hover:text-red-600 text-2xl"
              onClick={() => setIsShareModalOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-black">旅行の共有設定</h2>
            {/* プロジェクト（旅行）選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-black">どの旅行を共有しますか？</label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring bg-white text-black"
                value={selectedShareTravelId}
                onChange={e => setSelectedShareTravelId(e.target.value)}
                title="プロジェクト（旅行）を選択"
              >
                {shareTravels.map(travel => (
                  <option key={travel.id} value={travel.id}>{travel.title}</option>
                ))}
              </select>
            </div>
            {/* メールアドレス入力欄と追加ボタン */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-black">この旅行を共有したいユーザーのメールアドレス</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring text-black placeholder-black"
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddShareUser(); }}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleAddShareUser}
                >
                  追加
                </button>
              </div>
              <p className="text-xs text-black mt-1">メールアドレスを入力して「追加」またはEnterキーで共有できます</p>
            </div>
            {/* 共有済みユーザー一覧 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-black">この旅行を共有しているユーザー</label>
              <ul className="divide-y divide-gray-200 bg-gray-50 rounded p-2">
                {shareUsers.length === 0 && (
                  <li className="text-black text-sm py-2">まだ共有ユーザーはいません</li>
                )}
                {shareUsers.map((user, idx) => (
                  <li key={user.email} className="flex items-center justify-between py-2">
                    <span className="text-sm text-black">{user.email}</span>
                    <button
                      className="text-red-500 hover:underline text-xs"
                      onClick={() => handleRemoveShareUser(idx)}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* 下部に「共有する」ボタンのみ配置 */}
            <button
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
              onClick={handleShare}
            >
              共有する
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TravelCatalogHeader; 