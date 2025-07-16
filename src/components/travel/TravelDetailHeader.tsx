import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';
import HotelIcon from '@mui/icons-material/Hotel';
import { supabase } from '../../services/supabase';
import TabNavigation from '../TabNavigation';

interface TravelDetailHeaderProps {
  title: string;
  startDate: string;
  endDate: string;
  destination?: string;
  memberCount?: number;
  duration?: string;
  onBack: () => void;
  userEmail: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TravelDetailHeader: React.FC<TravelDetailHeaderProps> = ({
  title,
  startDate,
  endDate,
  destination,
  memberCount,
  duration,
  onBack,
  userEmail,
  activeTab,
  onTabChange
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // ページリロードやリダイレクトは親で制御
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* 左：戻るボタン */}
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
        
        {/* タイトル・日程・目的地・詳細情報 */}
        <div className="flex-1 min-w-0 flex flex-col items-start">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate text-left">
            {title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
            {/* 日付＋宿泊日数 */}
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <CalendarTodayIcon style={{ fontSize: 16 }} />
              {startDate && endDate ? (
                <span>{startDate} 〜 {endDate}</span>
              ) : startDate ? (
                <span>{startDate}</span>
              ) : endDate ? (
                <span>{endDate}</span>
              ) : (
                <span>未設定</span>
              )}
              {duration && (
                <span className="flex items-center gap-1 ml-2 text-purple-600 dark:text-purple-400">
                  <HotelIcon style={{ fontSize: 16 }} />
                  <span>{duration}</span>
                </span>
              )}
            </div>
            {/* 目的地＋グループ人数 */}
            <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
              <LocationOnIcon style={{ fontSize: 16 }} />
              <span>{destination && destination !== '未設定' ? destination : '未設定'}</span>
              {memberCount && memberCount > 0 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 ml-2">
                  <GroupIcon style={{ fontSize: 16 }} />
                  <span>{memberCount}名</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 右：プロフィールアイコン＋メニュー（削除） */}
        {/* <div className="relative"> ... </div> 削除 */}
      </div>
      
      {/* タブナビゲーションをヘッダー下部に追加 */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </header>
  );
};

export default TravelDetailHeader; 