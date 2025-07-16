import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

/**
 * 日別スケジュールの型定義
 */
interface DaySchedule {
  date: string;
  day: string;
  dayTitle?: string;
  daySubtitle?: string;
  items: any[];
}

/**
 * 日別編集フォームコンポーネントのプロパティ
 * 
 * @param day - 編集対象の日別スケジュール
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface DayEditFormProps {
  day: DaySchedule;
  onSave: (dayData: Partial<DaySchedule>) => void;
  onCancel: () => void;
}

/**
 * 日別編集フォームコンポーネント
 * 日別スケジュールのタイトル・サブタイトル編集フォームを提供
 */
const DayEditForm: React.FC<DayEditFormProps> = ({ 
  day, 
  onSave, 
  onCancel 
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<DaySchedule>>({
    dayTitle: '',
    daySubtitle: ''
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    setFormData({
      dayTitle: day.dayTitle || '',
      daySubtitle: day.daySubtitle || ''
    });
  }, [day]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof DaySchedule, value: string) => {
    // 文字数制限をチェック
    if (field === 'dayTitle' && value.length > 12) return;
    if (field === 'daySubtitle' && value.length > 14) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    const titleLength = (formData.dayTitle || '').length;
    const subtitleLength = (formData.daySubtitle || '').length;
    return titleLength <= 12 && subtitleLength <= 14;
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (!isFormValid()) return;
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">日程タイトルを編集</h3>
      
      <div className="space-y-4">
        {/* タイトル */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            value={formData.dayTitle || ''}
            onChange={(e) => handleInputChange('dayTitle', e.target.value)}
            placeholder="例: 沖縄到着・首里城観光"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            maxLength={12}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>12文字以内</span>
            <span>{(formData.dayTitle || '').length}/12</span>
          </div>
        </div>
        
        {/* サブタイトル */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            サブタイトル
          </label>
          <input
            type="text"
            value={formData.daySubtitle || ''}
            onChange={(e) => handleInputChange('daySubtitle', e.target.value)}
            placeholder="例: 歴史と文化に触れる初日"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            maxLength={14}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>14文字以内</span>
            <span>{(formData.daySubtitle || '').length}/14</span>
          </div>
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
          保存
        </Button>
      </div>
    </div>
  );
};

export default DayEditForm; 