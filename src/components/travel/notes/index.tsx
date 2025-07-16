import React, { useState, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { notesApi } from '../../../services/notesApi';

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
 * AI生成メモデータの型定義
 */
interface NoteData {
  title: string;
  content: string;
  category: string;
}

/**
 * メモタブコンポーネントのプロパティ
 */
interface NotesTabProps {
  travelId: string;
  userId: string;
}

/**
 * メモタブコンポーネント
 * メモの一覧表示、追加、編集、削除機能を提供
 */
const NotesTab: React.FC<NotesTabProps> = ({ travelId, userId }) => {
  // メモデータの状態
  const [notes, setNotes] = useState<Note[]>([]);

  // カテゴリの状態
  const [categories, setCategories] = useState<string[]>([
    '旅行準備', '重要な情報', 'ショッピング', 'カメラ・写真', 'その他'
  ]);

  // フィルターとモーダルの状態
  const [selectedCategory, setSelectedCategory] = useState('全てのカテゴリー');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // 削除確認モーダル用state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // DB→UI変換
  function dbNoteToUi(note: any): Note {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      isPinned: note.is_pinned,
    };
  }
  // UI→DB変換
  function uiNoteToDb(note: Note, travelId: string): Omit<any, 'id' | 'created_at' | 'updated_at'> {
    return {
      travel_id: travelId,
      title: note.title,
      content: note.content,
      category: note.category,
      is_pinned: note.isPinned,
    };
  }

  // DBからメモを取得
  useEffect(() => {
    if (!travelId || !userId) return;
    const fetchNotes = async () => {
      try {
        let notes = await notesApi.getNotes(travelId, userId);
        setNotes(notes.map(dbNoteToUi));
      } catch (e) {
        alert('メモの取得に失敗しました');
        console.error(e);
      }
    };
    fetchNotes();
  }, [travelId, userId]);

  /**
   * ピン留め切り替え
   */
  const togglePin = async (id: string) => {
    if (!travelId || !userId) return;
    const note = notes.find(n => n.id === id);
    if (!note) return;
    try {
      await notesApi.updateNote({ ...uiNoteToDb({ ...note, isPinned: !note.isPinned }, travelId), id });
      // 最新リスト再取得
      const notes = await notesApi.getNotes(travelId, userId);
      setNotes(notes.map(dbNoteToUi));
    } catch (e) {
      alert('ピン留めの更新に失敗しました');
      console.error(e);
    }
  };

  /**
   * メモ追加
   */
  const handleAddNote = () => {
    setShowAddModal(true);
  };

  /**
   * メモ編集
   */
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditModal(true);
  };

  /**
   * メモ削除
   */
  const deleteNoteHandler = async (id: string) => {
    setDeletingNoteId(id);
    setShowDeleteConfirm(true);
  };
  // 確認OK時の実処理
  const confirmDelete = async () => {
    if (!deletingNoteId || !travelId || !userId) return;
    try {
      await notesApi.deleteNote(deletingNoteId);
      // 最新リスト再取得
      const notes = await notesApi.getNotes(travelId, userId);
      setNotes(notes.map(dbNoteToUi));
      setDeletingNoteId(null);
      setShowDeleteConfirm(false);
    } catch (e) {
      alert('メモの削除に失敗しました');
      console.error(e);
    }
  };
  // キャンセル時
  const cancelDelete = () => {
    setDeletingNoteId(null);
    setShowDeleteConfirm(false);
  };

  /**
   * 新しいメモを保存
   */
  const saveNewNote = async (note: Note) => {
    if (!travelId || !userId) return;
    try {
      await notesApi.createNote(uiNoteToDb(note, travelId));
      // 最新リスト再取得
      const notes = await notesApi.getNotes(travelId, userId);
      setNotes(notes.map(dbNoteToUi));
      setShowAddModal(false);
    } catch (e) {
      alert('メモの追加に失敗しました');
      console.error(e);
    }
  };

  /**
   * 編集したメモを保存
   */
  const saveEditedNote = async (note: Note) => {
    if (!travelId || !userId) return;
    try {
      await notesApi.updateNote({ ...uiNoteToDb(note, travelId), id: note.id });
      // 最新リスト再取得
      const notes = await notesApi.getNotes(travelId, userId);
      setNotes(notes.map(dbNoteToUi));
      setShowEditModal(false);
      setEditingNote(null);
    } catch (e) {
      alert('メモの更新に失敗しました');
      console.error(e);
    }
  };

  /**
   * フィルタリングされたメモを取得
   */
  const filteredNotes = selectedCategory === '全てのカテゴリー'
    ? notes
    : notes.filter(note => note.category === selectedCategory);

  /**
   * ピン留めされたメモとそうでないメモを分離
   */
  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">メモ・ノート</h2>
        <div className="flex gap-2">
          <label htmlFor="category-filter" className="sr-only">カテゴリでフィルター</label>
          <select 
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="全てのカテゴリー">全てのカテゴリー</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={handleAddNote}
          >
            <Plus className="h-4 w-4 mr-2" />
            新しいメモ
          </Button>
        </div>
      </div>

      {/* ピン留めされたメモ */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            ピン留めされたメモ
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={togglePin}
                onEdit={handleEditNote}
                onDelete={deleteNoteHandler}
              />
            ))}
          </div>
        </div>
      )}

      {/* 通常のメモ */}
      {unpinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            その他のメモ
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={togglePin}
                onEdit={handleEditNote}
                onDelete={deleteNoteHandler}
              />
            ))}
          </div>
        </div>
      )}

      {/* メモが見つからない場合のメッセージ */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedCategory === '全てのカテゴリー'
              ? 'メモがありません。新しいメモを追加してみましょう！'
              : 'このカテゴリーに一致するメモがありません。'
            }
          </p>
        </div>
      )}

      {/* 追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新しいメモを追加"
        size="lg"
      >
        <NoteForm
          note={null}
          categories={categories}
          onSave={saveNewNote}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingNote(null);
        }}
        title="メモを編集"
        size="lg"
      >
        <NoteForm
          note={editingNote}
          categories={categories}
          onSave={saveEditedNote}
          onCancel={() => {
            setShowEditModal(false);
            setEditingNote(null);
          }}
        />
      </Modal>

      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          title="メモの削除確認"
          size="sm"
        >
          <div className="py-4 text-center">
            <p className="mb-4">本当にこのメモを削除しますか？</p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={cancelDelete}>キャンセル</Button>
              <Button variant="danger" onClick={confirmDelete}>削除する</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotesTab; 