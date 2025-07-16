import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

/**
 * 支出項目の型定義
 */
interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

/**
 * 支出フォームコンポーネントのプロパティ
 * 
 * @param expense - 編集対象の支出（新規作成時はnull）
 * @param categories - カテゴリリスト
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface ExpenseFormProps {
  expense: Expense | null;
  categories: string[];
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

/**
 * 支出フォームコンポーネント
 * 支出の追加・編集フォームを提供
 */
const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  expense, 
  categories, 
  onSave, 
  onCancel 
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: categories[0] || 'その他',
    title: '',
    amount: 0,
    type: 'expense'
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        title: expense.title,
        amount: expense.amount,
        type: expense.type
      });
    }
  }, [expense]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof Expense, value: string | number) => {
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
      formData.title?.trim() !== '' &&
      formData.amount > 0 &&
      formData.category
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      const newExpense: Expense = {
        id: expense?.id || Date.now().toString(),
        date: formData.date!,
        category: formData.category!,
        title: formData.title!,
        amount: formData.amount!,
        type: formData.type!
      };
      onSave(newExpense);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {expense ? '支出を編集' : '新しい支出を追加'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <Input
            label="タイトル"
            value={formData.title || ''}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="例: 羽田-那覇往復航空券"
            required
          />
          
          <Input
            label="金額"
            type="number"
            value={formData.amount || ''}
            onChange={(value) => handleInputChange('amount', parseInt(value) || 0)}
            placeholder="0"
            min={0}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              タイプ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>支出</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>収入</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* 詳細情報 */}
        <div className="space-y-4">
          <Input
            label="日付"
            type="date"
            value={formData.date || ''}
            onChange={(value) => handleInputChange('date', value)}
            required
          />
          
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
          {expense ? '更新' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default ExpenseForm; 