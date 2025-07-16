import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

/**
 * リセット確認モーダルのプロパティ
 */
interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberCount: number;
}

/**
 * リセット確認モーダルコンポーネント
 * 部屋割りの全解除を確認する
 */
const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberCount
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="割り当てをリセット"
      size="md"
    >
      <div className="space-y-6">
        {/* ヘッダーアイコン */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">この操作は取り消せません</p>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <RotateCcw className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-900 dark:text-gray-100 mb-2">
                現在割り当てられている <span className="font-semibold">{memberCount}人</span> のメンバーを全て未割り当てにします。
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                この操作により、全ての部屋割りが解除され、メンバーは未割り当て状態に戻ります。
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 dark:bg-yellow-900 dark:border-yellow-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">注意</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  この操作は元に戻すことができません。本当に全ての割り当てを解除しますか？
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* ボタン群 */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            リセット実行
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetConfirmModal; 