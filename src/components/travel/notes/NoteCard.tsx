import React from 'react';
import { Star, Edit3, Trash2 } from 'lucide-react';

/**
 * メモの型定義
 */
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
  isPinned: boolean;
}

/**
 * メモカードコンポーネントのプロパティ
 * 
 * @param note - メモデータ
 * @param onTogglePin - ピン留め切り替え時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface NoteCardProps {
  note: Note;
  onTogglePin: (id: string) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

/**
 * メモカードコンポーネント
 * 個別のメモを表示し、ピン留め・編集・削除機能を提供
 */
const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onTogglePin,
  onEdit,
  onDelete
}) => {
  /**
   * カテゴリに応じた色を取得
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      '旅行準備': 'bg-blue-100 text-blue-800',
      '重要な情報': 'bg-red-100 text-red-800',
      'ショッピング': 'bg-green-100 text-green-800',
      'カメラ・写真': 'bg-purple-100 text-purple-800',
      'その他': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['その他'];
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
      {/* 操作ボタン（右上） */}
      <div className="absolute top-4 right-4 flex gap-1 z-10">
        <button
          onClick={() => onTogglePin(note.id)}
          className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
          aria-label={note.isPinned ? 'ピン留めを解除' : 'ピン留めする'}
        >
          <Star className={`h-4 w-4 ${note.isPinned ? 'text-yellow-500 fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => onEdit(note)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="メモを編集"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(note.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          aria-label="メモを削除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {/* ヘッダー（タイトルのみ） */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-gray-900">{note.title}</h3>
      </div>
      {/* カテゴリ */}
      <div className="mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
          {note.category}
        </span>
      </div>
      {/* 内容 */}
      <div className="text-sm text-gray-600 mb-3">
        <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
      </div>
      {/* 更新日 */}
      <div className="text-xs text-gray-400">
        {note.updatedAt ? note.updatedAt : note.createdAt}
      </div>
    </div>
  );
};

export default NoteCard; 