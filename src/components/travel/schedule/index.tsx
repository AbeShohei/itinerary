import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Tag, Edit3, Check } from 'lucide-react';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import ScheduleItemForm from './ScheduleItemForm';
import DayEditForm from './DayEditForm';
import { Travel } from '../../../types/Travel';
import DayScheduleComponent from './DaySchedule';
import DeleteConfirmModal from '../TravelCatalog/DeleteConfirmModal';
import { travelApi } from '../../../services/travelApi';

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
}

/**
 * 日別スケジュールの型定義
 */
interface DaySchedule {
  date: string;
  day: string;
  dayTitle?: string;
  daySubtitle?: string;
  items: ScheduleItem[];
}

/**
 * 旅行の基本情報
 */
interface TravelInfo {
  startDate: string;
  endDate: string;
  destination: string;
}

/**
 * スケジュールタブコンポーネントのプロパティ
 */
interface ScheduleTabProps {
  travelInfo?: Travel;
  onNavigate?: (tab: string, id?: string) => void;
  places: any[];
  setPlaces: (places: any[]) => void;
  activeTab?: string; // 追加
  onTravelInfoUpdate?: (travel: Travel) => void; // 追加
}

/**
 * 日付からDayスケジュールを生成する関数
 */
const generateDaySchedules = (startDate: string, endDate: string, destination: string): DaySchedule[] => {
  const schedules: DaySchedule[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let currentDate = new Date(start);
  let dayNumber = 1;
  
  while (currentDate <= end) {
    const dateStr = currentDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
    
    let dayTitle = '';
    let daySubtitle = '';
    
    // 日数に応じてデフォルトのタイトルを設定
    if (dayNumber === 1) {
      dayTitle = `${destination}到着`;
      daySubtitle = '旅行の始まり';
    } else if (dayNumber === 2) {
      dayTitle = `${destination}観光`;
      daySubtitle = 'メインの観光日';
    } else if (dayNumber === 3) {
      dayTitle = `${destination}体験`;
      daySubtitle = 'アクティビティ';
    } else if (dayNumber === 4) {
      dayTitle = `${destination}巡り`;
      daySubtitle = 'お気に入りスポット';
    } else {
      dayTitle = `${destination}最終日`;
      daySubtitle = 'お土産・お買い物';
    }
    
    schedules.push({
      date: dateStr,
      day: `Day ${dayNumber}`,
      dayTitle: dayTitle,
      daySubtitle: daySubtitle,
      items: []
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }
  
  return schedules;
};

/**
 * スケジュールタブコンポーネント
 * スケジュールの管理、アイテムの追加・編集・削除機能を提供
 */
const ScheduleTab: React.FC<ScheduleTabProps> = ({ travelInfo, onNavigate, places, setPlaces, activeTab, onTravelInfoUpdate }) => {
  // スケジュールデータの状態
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  // 旅行情報からスケジュールを初期化
  useEffect(() => {
    if (travelInfo) {
      if (travelInfo.schedule && travelInfo.schedule.length > 0) {
        const convertedSchedules: DaySchedule[] = travelInfo.schedule.map((day: any, index: number) => {
          let dateStr = '';
          let dayStr = '';
          if (day.date) {
            const date = new Date(day.date);
            dateStr = date.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '/');
            dayStr = `Day ${day.dayNumber || index + 1}`;
          } else {
            dateStr = day.date || `Day ${index + 1}`;
            dayStr = day.day || `Day ${index + 1}`;
          }
          return {
            date: dateStr,
            day: dayStr,
            dayTitle: day.dayTitle,
            daySubtitle: day.daySubtitle,
            items: day.items.map((item: any, itemIndex: number) => ({
              id: item.id || `${index}-${itemIndex}`,
              time: item.time || '',
              endTime: item.endTime || '',
              title: item.title || '',
              location: item.location || '',
              description: item.description || '',
              category: item.category || 'sightseeing',
              linkType: item.linkType,
              linkId: item.linkId
            }))
          };
        });
        setSchedule(convertedSchedules);
      } else {
        const generatedSchedules = generateDaySchedules(
          travelInfo.startDate,
          travelInfo.endDate,
          travelInfo.destination
        );
        setSchedule(generatedSchedules);
      }
    } else {
      setSchedule([]);
    }
  }, [travelInfo]);

  // activeTabがscheduleになったタイミングで再セット
  useEffect(() => {
    if (activeTab === 'schedule' && travelInfo) {
      if (travelInfo.schedule && travelInfo.schedule.length > 0) {
        const convertedSchedules: DaySchedule[] = travelInfo.schedule.map((day: any, index: number) => {
          let dateStr = '';
          let dayStr = '';
          if (day.date) {
            const date = new Date(day.date);
            dateStr = date.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '/');
            dayStr = `Day ${day.dayNumber || index + 1}`;
          } else {
            dateStr = day.date || `Day ${index + 1}`;
            dayStr = day.day || `Day ${index + 1}`;
          }
          return {
            date: dateStr,
            day: dayStr,
            dayTitle: day.dayTitle,
            daySubtitle: day.daySubtitle,
            items: day.items.map((item: any, itemIndex: number) => ({
              id: item.id || `${index}-${itemIndex}`,
              time: item.time || '',
              endTime: item.endTime || '',
              title: item.title || '',
              location: item.location || '',
              description: item.description || '',
              category: item.category || 'sightseeing',
              linkType: item.linkType,
              linkId: item.linkId
            }))
          };
        });
        setSchedule(convertedSchedules);
      } else {
        const generatedSchedules = generateDaySchedules(
          travelInfo.startDate,
          travelInfo.endDate,
          travelInfo.destination
        );
        setSchedule(generatedSchedules);
      }
    }
  }, [activeTab, travelInfo]);

  // モーダルの状態
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDayEditModal, setShowDayEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<DaySchedule | null>(null);

  // 編集モードをScheduleTabで一元管理
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * アイテム追加
   */
  const handleAddItem = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowAddModal(true);
  };

  /**
   * アイテム編集
   */
  const handleEditItem = (item: ScheduleItem, dayIndex: number) => {
    setEditingItem(item);
    setSelectedDayIndex(dayIndex);
    setShowEditModal(true);
  };

  /**
   * 日付編集
   */
  const handleEditDay = (day: DaySchedule, dayIndex: number) => {
    setEditingDay(day);
    setSelectedDayIndex(dayIndex);
    setShowDayEditModal(true);
  };

  /**
   * アイテム削除
   */
  const handleDeleteClick = (itemId: string, dayIndex: number) => {
    setDeletingItemId(itemId);
    setSelectedDayIndex(dayIndex);
    setShowDeleteConfirm(true);
  };

  /**
   * 削除確認
   */
  const confirmDelete = () => {
    if (selectedDayIndex !== null && deletingItemId) {
      setSchedule(prev => {
        const newSchedule = prev.map((day, index) => 
          index === selectedDayIndex 
            ? { ...day, items: day.items.filter(item => item.id !== deletingItemId) }
            : day
        );
        saveScheduleToDB(newSchedule);
        return newSchedule;
      });
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
    }
  };

  /**
   * 新しいアイテムを保存
   */
  const saveNewItem = (item: ScheduleItem) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => {
        const newSchedule = prev.map((day, index) => 
          index === selectedDayIndex 
            ? { ...day, items: [...day.items, item].sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
              }) }
            : day
        );
        saveScheduleToDB(newSchedule);
        return newSchedule;
      });
      // --- ここから観光スポットにも追加 ---
      if (setPlaces && places && ['sightseeing', 'food', 'accommodation'].includes(item.category)) {
        // 既存スポットと重複しない場合のみ追加
        const exists = places.some(p => p.name === item.title && p.category === item.category && p.address === item.location);
        if (!exists) {
          const newPlace = {
            id: item.linkId || item.id || Date.now().toString(),
            name: item.title,
            category: item.category === 'sightseeing' ? '観光' : item.category === 'food' ? 'グルメ' : item.category === 'accommodation' ? '宿泊' : '',
            rating: 4.0,
            image: '',
            description: item.description || '',
            address: item.location || '',
            openingHours: '',
            priceRange: '',
            isFavorite: false
          };
          setPlaces([...places, newPlace]);
        }
      }
      setShowAddModal(false);
    }
  };

  /**
   * 編集したアイテムを保存
   */
  const saveEditedItem = (item: ScheduleItem) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => {
        const newSchedule = prev.map((day, index) => 
          index === selectedDayIndex 
            ? { 
                ...day, 
                items: day.items.map(i => 
                  i.id === item.id ? item : i
                ).sort((a, b) => {
                  if (!a.time && !b.time) return 0;
                  if (!a.time) return 1;
                  if (!b.time) return -1;
                  return a.time.localeCompare(b.time);
                })
              }
            : day
        );
        saveScheduleToDB(newSchedule);
        return newSchedule;
      });
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  /**
   * 日付編集を保存
   */
  const saveDayEdit = (dayData: Partial<DaySchedule>) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => {
        const newSchedule = prev.map((day, index) => 
          index === selectedDayIndex 
            ? { 
                ...day, 
                dayTitle: dayData.dayTitle,
                daySubtitle: dayData.daySubtitle
              }
            : day
        );
        saveScheduleToDB(newSchedule);
        return newSchedule;
      });
      setShowDayEditModal(false);
      setEditingDay(null);
    }
  };

  /**
   * 削除対象のアイテム名を取得
   */
  const getDeletingItemName = () => {
    if (selectedDayIndex !== null && deletingItemId) {
      const day = schedule[selectedDayIndex];
      const item = day?.items.find(i => i.id === deletingItemId);
      return item?.title || '';
    }
    return '';
  };

  /**
   * 予定の並び替え
   */
  const handleReorderItems = (newItems: ScheduleItem[], dayIndex: number) => {
    setSchedule(prev => {
      const newSchedule = prev.map((day, idx) =>
        idx === dayIndex ? { ...day, items: newItems } : day
      );
      saveScheduleToDB(newSchedule);
      return newSchedule;
    });
  };

  // スケジュールをDBに保存
  const saveScheduleToDB = async (newSchedule: DaySchedule[]) => {
    if (travelInfo && travelInfo.id) {
      try {
        const updated = await travelApi.updateTravel(travelInfo.id, { schedule: newSchedule });
        if (onTravelInfoUpdate) {
          onTravelInfoUpdate(updated); // 親stateも更新
        }
      } catch (e) {
        // 必要ならエラー通知
        console.error('スケジュールの保存に失敗しました', e);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* 右下追従の丸編集ボタン（全日共通） */}
      <button
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-colors ${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
        onClick={() => setIsEditMode(!isEditMode)}
        aria-label={isEditMode ? '編集完了' : '編集モード'}
      >
        {isEditMode ? <Check className="w-7 h-7" /> : <Edit3 className="w-7 h-7" />}
      </button>
      {/* 日別スケジュール一覧 */}
      {schedule.length > 0 ? (
        <div className="space-y-8">
          {schedule.map((day, idx) => (
            <DayScheduleComponent
              key={day.date}
              day={day}
              dayIndex={idx}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteClick}
              onEditDay={handleEditDay}
              onReorderItems={handleReorderItems}
              onNavigate={onNavigate}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            まだ予定がありません。新しい予定を追加してください。
          </p>
        </div>
      )}

      {/* アイテム追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新しい予定を追加"
        size="md"
      >
        <ScheduleItemForm
          item={null}
          onSave={saveNewItem}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* アイテム編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        title="予定を編集"
        size="md"
      >
        <ScheduleItemForm
          item={editingItem}
          onSave={saveEditedItem}
          onCancel={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* 日付編集モーダル */}
      <Modal
        isOpen={showDayEditModal}
        onClose={() => {
          setShowDayEditModal(false);
          setEditingDay(null);
        }}
        title="日程タイトルを編集"
        size="md"
      >
        <DayEditForm
          day={editingDay!}
          onSave={saveDayEdit}
          onCancel={() => {
            setShowDayEditModal(false);
            setEditingDay(null);
          }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={getDeletingItemName()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingItemId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ScheduleTab; 