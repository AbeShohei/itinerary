import React from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';

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
 * 支出項目コンポーネントのプロパティ
 * 
 * @param expense - 支出データ
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

/**
 * 支出項目コンポーネント
 * 個別の支出項目を表示し、編集・削除機能を提供
 */
const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete
}) => {
  /**
   * カテゴリに応じた色を取得
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      '交通費': 'bg-blue-100 text-blue-800',
      '宿泊費': 'bg-purple-100 text-purple-800',
      '食費': 'bg-orange-100 text-orange-800',
      '観光費': 'bg-green-100 text-green-800',
      'ショッピング': 'bg-pink-100 text-pink-800',
      'その他': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['その他'];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* 左側：タイトル・日付 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{expense.title}</h3>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{expense.date}</span>
          </div>
        </div>
        {/* 中央：カテゴリタグ＋金額＋操作アイコン */}
        <div className="flex flex-row items-center gap-2 mt-2 md:mt-0 min-w-[120px] flex-1 md:flex-none justify-between md:justify-start">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
            {expense.category}
          </span>
          <span className={`font-semibold ${expense.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} ml-auto`}>
            {expense.type === 'expense' ? '-' : '+'}¥{expense.amount.toLocaleString()}
          </span>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              aria-label="支出を編集"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900"
              aria-label="支出を削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem; 