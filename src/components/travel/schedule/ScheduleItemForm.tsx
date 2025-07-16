import React, { useState, useEffect } from 'react';
import { MapPin, Utensils, Bus, Bed, ExternalLink } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';

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
 * スケジュールアイテムフォームコンポーネントのプロパティ
 * 
 * @param item - 編集対象のアイテム（新規作成時はnull）
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 * @param places - 観光スポット一覧
 * @param rooms - 部屋割り一覧
 */
interface ScheduleItemFormProps {
  item: ScheduleItem | null;
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
  places?: Array<{ id: string; name: string; type: string }>;
  rooms?: Array<{ id: string; roomName: string }>;
}

/**
 * カテゴリオプションの定義
 */
const categoryOptions = [
  {
    value: 'sightseeing' as const,
    label: '観光',
    icon: MapPin,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    activeColor: 'bg-blue-500 text-white border-blue-500'
  },
  {
    value: 'food' as const,
    label: '食事',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    activeColor: 'bg-orange-500 text-white border-orange-500'
  },
  {
    value: 'transport' as const,
    label: '移動',
    icon: Bus,
    color: 'bg-green-100 text-green-800 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500'
  },
  {
    value: 'accommodation' as const,
    label: '宿泊',
    icon: Bed,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    activeColor: 'bg-purple-500 text-white border-purple-500'
  }
];

/**
 * スケジュールアイテムフォームコンポーネント
 * スケジュールアイテムの追加・編集フォームを提供
 */
const ScheduleItemForm: React.FC<ScheduleItemFormProps> = ({ 
  item, 
  onSave, 
  onCancel,
  places = [],
  rooms = []
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    time: '',
    endTime: '',
    title: '',
    location: '',
    description: '',
    category: 'sightseeing',
    linkType: undefined,
    linkId: undefined
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (item) {
      setFormData({
        time: item.time,
        endTime: item.endTime || '',
        title: item.title,
        location: item.location,
        description: item.description,
        category: item.category,
        linkType: item.linkType,
        linkId: item.linkId
      });
    }
  }, [item]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof ScheduleItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * リンク設定をクリア
   */
  const clearLink = () => {
    setFormData(prev => ({
      ...prev,
      linkType: undefined,
      linkId: undefined
    }));
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    return (
      formData.title?.trim() !== ''
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      const newItem: ScheduleItem = {
        id: item?.id || Date.now().toString(),
        time: formData.time || '',
        endTime: formData.endTime || undefined,
        title: formData.title!,
        location: formData.location || '',
        description: formData.description || '',
        category: formData.category as ScheduleItem['category'],
        linkType: formData.linkType,
        linkId: formData.linkId
      };
      onSave(newItem);
    }
  };

  // 観光スポットとレストランのリスト
  const placeOptions = places.filter(place => 
    place.type === 'sightseeing' || place.type === 'restaurant'
  );

  // 部屋のリスト
  const roomOptions = rooms;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {item ? '予定を編集' : '新しい予定を追加'}
      </h3>
      
      <div className="space-y-4">
        {/* 開始時間 */}
        <div className="space-y-1">
          <label htmlFor="time-input" className="block text-sm font-medium text-gray-700">
            開始時間（任意）
          </label>
          <input 
            id="time-input"
            type="time"
            value={formData.time || ''}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 終了時間 */}
        <div className="space-y-1">
          <label htmlFor="end-time-input" className="block text-sm font-medium text-gray-700">
            終了時間（任意）
          </label>
          <input 
            id="end-time-input"
            type="time"
            value={formData.endTime || ''}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* タイトル */}
        <Input
          label="タイトル"
          value={formData.title || ''}
          onChange={(value) => handleInputChange('title', value)}
          placeholder="予定のタイトル"
          required
        />
        
        {/* 場所 */}
        <Input
          label="場所"
          value={formData.location || ''}
          onChange={(value) => handleInputChange('location', value)}
          placeholder="場所"
        />
        
        {/* カテゴリー */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            カテゴリー
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((option) => {
              const Icon = option.icon;
              const isActive = formData.category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('category', option.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    isActive 
                      ? option.activeColor 
                      : `${option.color} hover:bg-opacity-80`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* リンク設定 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            詳細情報へのリンク（任意）
          </label>
          
          {/* 観光スポット・レストランリンク */}
          {(formData.category === 'sightseeing' || formData.category === 'food') && placeOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                観光スポット・レストラン
              </label>
              <select
                value={formData.linkType === 'place' ? formData.linkId || '' : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData(prev => ({
                      ...prev,
                      linkType: 'place' as const,
                      linkId: e.target.value
                    }));
                  } else {
                    clearLink();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">リンクしない</option>
                {placeOptions.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 部屋リンク */}
          {formData.category === 'accommodation' && roomOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                部屋割り
              </label>
              <select
                value={formData.linkType === 'room' ? formData.linkId || '' : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData(prev => ({
                      ...prev,
                      linkType: 'room' as const,
                      linkId: e.target.value
                    }));
                  } else {
                    clearLink();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">リンクしない</option>
                {roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* リンククリアボタン */}
          {(formData.linkType && formData.linkId) && (
            <button
              type="button"
              onClick={clearLink}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              リンクを削除
            </button>
          )}
        </div>
        
        {/* 説明 */}
        <div className="space-y-1">
          <label htmlFor="description-textarea" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea 
            id="description-textarea"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="詳細説明"
          />
        </div>
      </div>
      
      {/* ボタン群 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isFormValid()}
        >
          {item ? '保存' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleItemForm; 