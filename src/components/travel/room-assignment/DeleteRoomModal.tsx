import React from 'react';
import { AlertTriangle, Trash2, Users } from 'lucide-react';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

/**
 * 部屋の型定義
 */
interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}

/**
 * 部屋削除確認モーダルのプロパティ
 */
interface DeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: Room | null;
  assignedMemberCount: number;
}

/**
 * 部屋削除確認モーダルコンポーネント
 * 部屋の削除を確認する
 */
const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  room,
  assignedMemberCount
}) => {
  if (!room) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="部屋を削除"
      size="md"
    >
      <div className="space-y-6">
        {/* ヘッダーアイコン */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">この操作は取り消せません</p>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-900 mb-2">
                部屋 <span className="font-semibold">{room.name}</span> (部屋番号: {room.room_number}) を削除します。
              </p>
              {assignedMemberCount > 0 && (
                <p className="text-sm text-red-600 mb-2">
                  ⚠️ この部屋には {assignedMemberCount}人 のメンバーが割り当てられています。
                </p>
              )}
              <p className="text-sm text-gray-600">
                部屋を削除すると、割り当てられたメンバーは未割り当て状態になります。
              </p>
            </div>
          </div>
          
          {/* 部屋情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">部屋番号:</span>
                <span className="ml-2 font-medium">{room.room_number}</span>
              </div>
              <div>
                <span className="text-gray-600">タイプ:</span>
                <span className="ml-2 font-medium">{room.type}</span>
              </div>
              <div>
                <span className="text-gray-600">定員:</span>
                <span className="ml-2 font-medium">{room.capacity}人</span>
              </div>
              <div>
                <span className="text-gray-600">料金:</span>
                <span className="ml-2 font-medium">¥{room.pricePerNight.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">注意</p>
                <p className="text-sm text-yellow-700">
                  この操作は元に戻すことができません。本当にこの部屋を削除しますか？
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
            削除実行
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRoomModal; 