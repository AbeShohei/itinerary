import React from 'react';
import { Check, Edit3, Trash2 } from 'lucide-react';

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
 * パッキングアイテムコンポーネントのプロパティ
 * 
 * @param item - パッキングアイテムデータ
 * @param onTogglePacked - パッキング状態切り替え時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface PackingItemProps {
  item: PackingItem;
  onTogglePacked: (id: string) => void;
  onEdit: (item: PackingItem) => void;
  onDelete: (itemId: string) => void;
}

/**
 * パッキングアイテムコンポーネント
 * 個別のパッキングアイテムを表示し、パッキング状態・編集・削除機能を提供
 */
const PackingItemComponent: React.FC<PackingItemProps> = ({
  item,
  onTogglePacked,
  onEdit,
  onDelete
}) => {
  /**
   * カテゴリに応じたアイコンを取得
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '書類': return '📄';
      case '衣類': return '👕';
      case '美容・健康': return '🧴';
      case 'アクセサリー': return '👓';
      case '電子機器': return '🔌';
      default: return '📦';
    }
  };

  /**
   * カテゴリに応じた色を取得
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      '書類': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      '衣類': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      '美容・健康': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'アクセサリー': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      '電子機器': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'その他': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category] || colors['その他'];
  };

  return (
    <div className={`bg-white p-4 rounded-lg border transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 ${
      item.is_packed 
        ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900' 
        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
    }`}>
      <div className="flex items-center justify-between">
        {/* アイテム情報 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* パッキング状態ボタン */}
          <button
            onClick={() => onTogglePacked(item.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              item.is_packed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
            aria-label={item.is_packed ? 'パッキング済み' : '未パッキング'}
          >
            {item.is_packed && <Check className="h-3 w-3" />}
          </button>
          
          {/* アイテム詳細 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCategoryIcon(item.category)}</span>
              <h3 className={`font-medium truncate ${item.is_packed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {item.name}
              </h3>
              {item.is_essential && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium dark:bg-red-900 dark:text-red-300">
                  必須
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <span>数量: {item.quantity}</span>
            </div>
          </div>
        </div>
        
        {/* 操作ボタン */}
        <div className="flex gap-1 ml-3">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-900"
            aria-label="アイテムを編集"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900"
            aria-label="アイテムを削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackingItemComponent; 