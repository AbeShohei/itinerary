import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

/**
 * パッキングアイテムの型定義
 */
interface PackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  is_essential: boolean;
}

/**
 * パッキングアイテムフォームコンポーネントのプロパティ
 * 
 * @param item - 編集対象のアイテム（新規作成時はnull）
 * @param categories - カテゴリリスト
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface PackingItemFormProps {
  item: PackingItem | null;
  categories: string[];
  onSave: (item: PackingItem) => void;
  onCancel: () => void;
}

/**
 * パッキングアイテムフォームコンポーネント
 * パッキングアイテムの追加・編集フォームを提供
 */
const PackingItemForm: React.FC<PackingItemFormProps> = ({ 
  item, 
  categories, 
  onSave, 
  onCancel 
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<PackingItem>>({
    name: '',
    category: categories[0] || 'その他',
    quantity: 1,
    is_packed: false,
    is_essential: false
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        is_packed: item.is_packed,
        is_essential: item.is_essential
      });
    }
  }, [item]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof PackingItem, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.category &&
      formData.quantity > 0
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      const newItem: PackingItem = {
        id: item?.id || Date.now().toString(),
        name: formData.name!,
        category: formData.category!,
        quantity: formData.quantity!,
        is_packed: formData.is_packed || false,
        is_essential: formData.is_essential || false
      };
      onSave(newItem);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {item ? 'アイテムを編集' : '新しいアイテムを追加'}
      </h3>
      
      <div className="space-y-4">
        {/* アイテム名 */}
        <Input
          label="アイテム名"
          value={formData.name || ''}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="例: パスポート"
          required
        />
        
        {/* カテゴリ */}
        <div className="space-y-1">
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
            カテゴリ
          </label>
          <select
            id="category-select"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* 数量 */}
        <Input
          label="数量"
          type="number"
          value={formData.quantity || ''}
          onChange={(value) => handleInputChange('quantity', parseInt(value) || 1)}
          placeholder="1"
          min={1}
          max={99}
          required
        />
        
        {/* 必須アイテム */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-essential"
            checked={formData.is_essential || false}
            onChange={(e) => handleInputChange('is_essential', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is-essential" className="text-sm font-medium text-gray-700">
            必須アイテム
          </label>
        </div>
        
        {/* パッキング済み */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-packed"
            checked={formData.is_packed || false}
            onChange={(e) => handleInputChange('is_packed', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="is-packed" className="text-sm font-medium text-gray-700">
            パッキング済み
          </label>
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
          {item ? '更新' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default PackingItemForm; 