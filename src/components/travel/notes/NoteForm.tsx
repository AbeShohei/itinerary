import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

/**
 * メモの型定義
 */
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isPinned: boolean;
}

/**
 * メモフォームコンポーネントのプロパティ
 * 
 * @param note - 編集対象のメモ（新規作成時はnull）
 * @param categories - カテゴリリスト
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface NoteFormProps {
  note: Note | null;
  categories: string[];
  onSave: (note: Note) => void;
  onCancel: () => void;
}

/**
 * メモフォームコンポーネント
 * メモの追加・編集フォームを提供
 */
const NoteForm: React.FC<NoteFormProps> = ({ 
  note, 
  categories, 
  onSave, 
  onCancel 
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<Note>>({
    title: '',
    content: '',
    category: categories[0] || 'その他',
    isPinned: false
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        isPinned: note.isPinned
      });
    }
  }, [note]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof Note, value: string | boolean) => {
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
      formData.content?.trim() !== '' &&
      formData.category
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      const newNote: Note = {
        id: note?.id || Date.now().toString(),
        title: formData.title!,
        content: formData.content!,
        category: formData.category!,
        createdAt: note?.createdAt || new Date().toISOString().split('T')[0],
        isPinned: formData.isPinned || false
      };
      onSave(newNote);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {note ? 'メモを編集' : '新しいメモを追加'}
      </h3>
      
      <div className="space-y-4">
        {/* タイトル */}
        <Input
          label="タイトル"
          value={formData.title || ''}
          onChange={(value) => handleInputChange('title', value)}
          placeholder="メモのタイトルを入力"
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
        
        {/* 内容 */}
        <div className="space-y-1">
          <label htmlFor="content-textarea" className="block text-sm font-medium text-gray-700">
            内容
          </label>
          <textarea
            id="content-textarea"
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="メモの内容を入力"
            rows={8}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        {/* ピン留め */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-pinned"
            checked={formData.isPinned || false}
            onChange={(e) => handleInputChange('isPinned', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is-pinned" className="text-sm font-medium text-gray-700">
            ピン留めする
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
          {note ? '更新' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default NoteForm; 