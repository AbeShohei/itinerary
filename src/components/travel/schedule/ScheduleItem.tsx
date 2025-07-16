import React from 'react';
import { MapPin, Edit3, Trash2, Utensils, Bus, Bed, Clock, ExternalLink } from 'lucide-react';

/**
 * スケジュールアイテムの型定義
 */
interface ScheduleItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location: string;
  description: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation';
  linkType?: 'place' | 'room';
  linkId?: string;
}

/**
 * スケジュールアイテムコンポーネントのプロパティ
 * 
 * @param item - スケジュールアイテムデータ
 * @param isFirst - 最初のアイテムかどうか
 * @param isLast - 最後のアイテムかどうか
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 * @param onNavigate - タブ遷移時のコールバック
 */
interface ScheduleItemProps {
  item: ScheduleItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (itemId: string) => void;
  onNavigate?: (tab: string, id?: string) => void;
  isEditMode: boolean; // 編集モードかどうかを示すプロパティを追加
}

/**
 * スケジュールアイテムコンポーネント
 * 個別のスケジュールアイテムを表示し、編集・削除機能を提供
 */
const ScheduleItemComponent: React.FC<ScheduleItemProps> = ({
  item,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onNavigate,
  isEditMode // isEditModeを追加
}) => {
  /**
   * カテゴリに応じたアイコンを返す
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sightseeing': return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'food': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'transport': return <Bus className="w-5 h-5 text-green-500" />;
      case 'accommodation': return <Bed className="w-5 h-5 text-purple-500" />;
      default: return null;
    }
  };

  /**
   * 所要時間を計算
   */
  const calculateDuration = (startTime: string, endTime?: string): string => {
    if (!endTime) return '';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // 終了時間が開始時間より前の場合は翌日として計算
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}時間${diffMinutes > 0 ? `${diffMinutes}分` : ''}`;
    } else {
      return `${diffMinutes}分`;
    }
  };

  /**
   * リンク可能かどうかを判定
   */
  const isLinkable = () => {
    return item.linkType && item.linkId && onNavigate;
  };

  /**
   * リンククリック時の処理
   */
  const handleLinkClick = () => {
    if (isLinkable()) {
      const tab = item.linkType === 'place' ? 'places' : 'room-assignment';
      onNavigate(tab, item.linkId);
    }
  };

  // カード全体クリックで観光スポット詳細へ遷移
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      item.linkType === 'place' &&
      item.linkId &&
      onNavigate &&
      (item.category === 'food' || item.category === 'sightseeing')
    ) {
      onNavigate('places', item.linkId);
    } else if (onNavigate) {
      onNavigate('schedule', item.id);
    }
  };

  // カテゴリごとの丸の色
  const getCircleColor = (category: string) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-500';
      case 'food': return 'bg-orange-500';
      case 'transport': return 'bg-green-500';
      case 'accommodation': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  // アイコンの色（白抜き）
  const getIconColor = () => 'text-white';

  // 所要時間を計算
  const duration = item.time && item.endTime ? calculateDuration(item.time, item.endTime) : '';

  return (
    <div className="flex relative bg-transparent m-0 p-0 cursor-pointer" onClick={handleCardClick}>
      {/* タイムライン（丸＋上下線） */}
      <div className="relative w-12 min-w-[48px] max-w-[48px] flex flex-col items-center m-0 p-0">
        {/* タイムラインの直線 */}
        <div className={`absolute left-1/2 ${isFirst ? 'top-[20px]' : 'top-0'} ${isLast ? 'bottom-[20px]' : 'bottom-0'} w-px bg-gray-200 -translate-x-1/2 z-0`} />
        
        {/* 丸いアイコン */}
        <div className={`relative z-10 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow ring-2 ring-gray-200 ${getCircleColor(item.category)} m-0 p-0`}>
          {item.category === 'sightseeing' && <MapPin className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'food' && <Utensils className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'transport' && <Bus className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'accommodation' && <Bed className={`w-5 h-5 ${getIconColor()}`} />}
        </div>
      </div>
      {/* 内容 */}
      <div className="flex-1 py-2 pl-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              {item.time ? item.time : '時間未定'}
              {item.endTime && (
                <span className="text-gray-400 ml-1">〜 {item.endTime}</span>
              )}
              {/* 所要時間を右側に表示 */}
              {duration && (
                <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              )}
            </span>
            {/* リンクアイコン */}
            {/* {isLinkable() && (
              <button
                onClick={(e) => { e.stopPropagation(); handleLinkClick(); }}
                className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                aria-label="詳細を見る"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )} */}
          </div>
          {/* 操作ボタン（編集モード時のみ表示） */}
          {isEditMode && (
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(item); }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="予定を編集"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(item.id); }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="予定を削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
            {/* 場所 */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="h-3 w-3" />
              {item.location}
            </div>
            {/* 説明 */}
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleItemComponent; 