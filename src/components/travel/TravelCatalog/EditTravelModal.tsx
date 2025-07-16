import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { Travel } from '../../../types/Travel';

/**
 * 旅行編集モーダルコンポーネントのプロパティ
 * 
 * @param isOpen - モーダルの表示状態
 * @param travel - 編集対象の旅行データ
 * @param onClose - モーダルを閉じる関数
 * @param onSave - 保存時のコールバック
 */
interface EditTravelModalProps {
  isOpen: boolean;
  travel: Travel | null;
  onClose: () => void;
  onSave: (travel: Travel) => void;
}

/**
 * 旅行編集モーダルコンポーネント
 * 旅行の基本情報を編集するためのモーダル
 */
const EditTravelModal: React.FC<EditTravelModalProps> = ({
  isOpen,
  travel,
  onClose,
  onSave
}) => {
  // 編集用の状態
  const [editData, setEditData] = useState<Partial<Travel>>({});

  /**
   * モーダルが開かれた時に編集データを初期化
   */
  React.useEffect(() => {
    if (travel) {
      setEditData({
        title: travel.title,
        destination: travel.destination,
        description: travel.description,
        budget: travel.budget,
        memberCount: travel.memberCount ?? travel.member_count,
        startDate: travel.startDate,
        endDate: travel.endDate,
        status: travel.status || 'planning',
      });
    }
  }, [travel]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof Travel, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (travel && editData.title && editData.destination) {
      const updatedTravel: Travel = {
        ...travel,
        ...editData,
        member_count: editData.memberCount, // memberCountをmember_countとして保存
        updatedAt: new Date().toISOString().split('T')[0],
        status: editData.status || 'planning',
      };
      onSave(updatedTravel);
      onClose();
    }
  };

  /**
   * キャンセル処理
   */
  const handleCancel = () => {
    setEditData({});
    onClose();
  };

  if (!travel) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="旅行を編集"
      size="lg"
    >
      <div className="space-y-6">
        {/* タイトル */}
        <Input
          label="旅行タイトル"
          value={editData.title || ''}
          onChange={(value) => handleInputChange('title', value)}
          placeholder="旅行のタイトルを入力"
          required
        />

        {/* 目的地 */}
        <Input
          label="目的地"
          value={editData.destination || ''}
          onChange={(value) => handleInputChange('destination', value)}
          placeholder="目的地を入力"
          required
        />

        {/* 開始日・終了日 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">開始日</label>
            <input
              type="date"
              value={editData.startDate || ''}
              onChange={e => handleInputChange('startDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              title="開始日"
              placeholder="開始日を選択"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">終了日</label>
            <input
              type="date"
              value={editData.endDate || ''}
              onChange={e => handleInputChange('endDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              title="終了日"
              placeholder="終了日を選択"
            />
          </div>
        </div>

        {/* 説明 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            value={editData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="旅行の説明を入力"
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 予算 */}
        <Input
          label="予算"
          type="number"
          value={editData.budget || ''}
          onChange={(value) => handleInputChange('budget', parseInt(value) || 0)}
          placeholder="予算を入力"
        />

        {/* 参加人数 */}
        <Input
          label="参加人数"
          type="number"
          value={editData.memberCount || ''}
          onChange={(value) => handleInputChange('memberCount', parseInt(value) || 1)}
          placeholder="参加人数を入力"
        />

        {/* ステータスタグ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-3 py-1 rounded-full border text-sm font-medium ${editData.status === 'planning' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-300'}`}
              onClick={() => handleInputChange('status', 'planning')}
            >計画中</button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full border text-sm font-medium ${editData.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-300'}`}
              onClick={() => handleInputChange('status', 'confirmed')}
            >確定</button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full border text-sm font-medium ${editData.status === 'completed' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300'}`}
              onClick={() => handleInputChange('status', 'completed')}
            >完了</button>
          </div>
        </div>

        {/* ボタン群 */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!editData.title || !editData.destination}
          >
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditTravelModal; 