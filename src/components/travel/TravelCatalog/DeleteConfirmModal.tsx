import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

/**
 * 削除確認モーダルコンポーネントのプロパティ
 * 
 * @param isOpen - モーダルの表示状態
 * @param title - 削除対象のタイトル
 * @param onClose - モーダルを閉じる関数
 * @param onConfirm - 削除確認時のコールバック
 */
interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 削除確認モーダルコンポーネント
 * 削除操作の確認を求めるモーダル
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="text-center">
        {/* 警告アイコン */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          削除の確認
        </h3>

        {/* メッセージ */}
        <p className="text-sm text-gray-600 mb-6">
          「{title}」を削除しますか？
          <br />
          この操作は取り消すことができません。
        </p>

        {/* ボタン群 */}
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
          >
            削除
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal; 