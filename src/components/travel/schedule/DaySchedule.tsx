import React from 'react';
import { Plus, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import ScheduleItemComponent from './ScheduleItem';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

/**
 * スケジュールアイテムの型定義
 */
interface ScheduleItem {
  id: string;
  time: string;
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
 * 日別スケジュールコンポーネントのプロパティ
 * 
 * @param day - 日別スケジュールデータ
 * @param dayIndex - 日付のインデックス
 * @param onAddItem - アイテム追加時のコールバック
 * @param onEditItem - アイテム編集時のコールバック
 * @param onDeleteItem - アイテム削除時のコールバック
 * @param onEditDay - 日付編集時のコールバック
 * @param onReorderItems - アイテム並び替え時のコールバック
 * @param onNavigate - タブ遷移時のコールバック
 */
interface DayScheduleProps {
  day: DaySchedule;
  dayIndex: number;
  onAddItem: (dayIndex: number) => void;
  onEditItem: (item: ScheduleItem, dayIndex: number) => void;
  onDeleteItem: (itemId: string, dayIndex: number) => void;
  onEditDay: (day: DaySchedule, dayIndex: number) => void;
  onReorderItems?: (newItems: ScheduleItem[], dayIndex: number) => void;
  onNavigate?: (tab: string, id?: string) => void;
  isEditMode: boolean; // 追加
}

/**
 * 移動可能なスケジュールアイテムコンポーネント
 */
const MovableScheduleItem: React.FC<{
  item: ScheduleItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (itemId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onNavigate?: (tab: string, id?: string) => void;
  isEditMode: boolean; // 追加
}> = ({ item, isFirst, isLast, onEdit, onDelete, onMoveUp, onMoveDown, onNavigate, isEditMode }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ScheduleItemComponent
        item={item}
        isFirst={isFirst}
        isLast={isLast}
        onEdit={onEdit}
        onDelete={onDelete}
        onNavigate={onNavigate}
        isEditMode={isEditMode} // 追加
      />
      
      {/* 移動ボタン */}
      {isHovered && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          {!isFirst && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
              aria-label="上に移動"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
              aria-label="下に移動"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 日別スケジュールコンポーネント
 * 1日分のスケジュールを表示し、アイテムの管理機能を提供
 */
const DayScheduleComponent: React.FC<DayScheduleProps> = ({
  day,
  dayIndex,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEditDay,
  onReorderItems,
  onNavigate,
  isEditMode // 追加
}) => {
  // 開閉トグル用state
  const [isOpen, setIsOpen] = React.useState(true);

  // アイテムを上に移動
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...day.items];
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      if (onReorderItems) {
        onReorderItems(newItems, dayIndex);
      }
    }
  };

  // アイテムを下に移動
  const handleMoveDown = (index: number) => {
    if (index < day.items.length - 1) {
      const newItems = [...day.items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      if (onReorderItems) {
        onReorderItems(newItems, dayIndex);
      }
    }
  };

  // DnDハンドラ
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(day.items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    if (onReorderItems) {
      onReorderItems(newItems, dayIndex);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200 relative flex items-center justify-between">
        {/* トグルアイコン（左端） */}
        <button
          className="mr-4 flex-shrink-0 p-1 rounded hover:bg-gray-100"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? '折りたたむ' : '展開する'}
        >
          {isOpen ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-row items-center gap-2 md:gap-6">
            <div className="flex flex-col gap-1 min-w-fit">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{day.day}</h3>
                <button 
                  onClick={() => onEditDay(day, dayIndex)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="日程タイトルを編集"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">{day.date}</p>
            </div>
            {day.dayTitle && (
              <div className="flex flex-col">
                <h4 className="text-md font-medium text-gray-800">{day.dayTitle}</h4>
                {day.daySubtitle && (
                  <span className="text-sm text-gray-600">{day.daySubtitle}</span>
                )}
              </div>
            )}
          </div>
        </div>
        {/* 追加ボタン（右端） */}
        <div className="flex items-center ml-2">
          {/* スマホ：丸アイコンボタン */}
          <button
            onClick={() => onAddItem(dayIndex)}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 shadow-md hover:bg-blue-700 transition-colors md:hidden"
            aria-label="予定を追加"
          >
            <Plus className="h-5 w-5" />
          </button>
          {/* PC：従来のボタン */}
          <button 
            onClick={() => onAddItem(dayIndex)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>予定を追加</span>
          </button>
        </div>
      </div>
      {/* スケジュールアイテム一覧（開いているときのみ表示） */}
      {isOpen && (
        <div className="p-6">
          {isEditMode ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`droppable-day-${dayIndex}`}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {day.items.length > 0 ? (
                      day.items.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.7 : 1,
                                marginBottom: 8
                              }}
                            >
                              <MovableScheduleItem
                                item={item}
                                isFirst={idx === 0}
                                isLast={idx === day.items.length - 1}
                                onEdit={(item) => onEditItem(item, dayIndex)}
                                onDelete={(itemId) => onDeleteItem(itemId, dayIndex)}
                                onMoveUp={() => handleMoveUp(idx)}
                                onMoveDown={() => handleMoveDown(idx)}
                                onNavigate={onNavigate}
                                isEditMode={isEditMode}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>予定がありません</p>
                        <p className="text-sm mt-1">「予定を追加」ボタンから予定を追加してください</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div>
              {day.items.length > 0 ? (
                day.items.map((item, idx) => (
                  <MovableScheduleItem
                    key={item.id}
                    item={item}
                    isFirst={idx === 0}
                    isLast={idx === day.items.length - 1}
                    onEdit={() => {}} // 編集モード外では編集不可
                    onDelete={() => {}} // 編集モード外では削除不可
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                    onNavigate={onNavigate}
                    isEditMode={isEditMode}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>予定がありません</p>
                  <p className="text-sm mt-1">「予定を追加」ボタンから予定を追加してください</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayScheduleComponent; 