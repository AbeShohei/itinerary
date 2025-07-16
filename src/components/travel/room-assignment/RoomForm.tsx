import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '../../common/Button';

/**
 * 部屋の型定義
 */
interface Room {
  // id: string; // ←削除
  room_number: string; // ←追加
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
  stay_dates: string[]; // 泊まる日付配列を追加
}

/**
 * 部屋フォームコンポーネントのプロパティ
 */
interface RoomFormProps {
  room?: Room;
  onSave: (room: Room) => void;
  onCancel: () => void;
  existingRooms?: Room[]; // 既存の部屋リスト（部屋タイプ選択用）
  isBulkAdd?: boolean; // 一括追加モード
  onBulkSave?: (rooms: Room[]) => void; // 一括保存用
  travelDates?: string[]; // 旅行日付の配列をpropsで受け取る
  travelStartDate?: string;
  travelEndDate?: string;
}

/**
 * 部屋フォームコンポーネント
 * 部屋の追加・編集を行う
 */
const RoomForm: React.FC<RoomFormProps> = ({ 
  room, 
  onSave, 
  onCancel, 
  existingRooms = [], 
  isBulkAdd = false,
  onBulkSave,
  travelDates = [], // 旅行日付の配列をpropsで受け取る
  travelStartDate = '',
  travelEndDate = '',
}) => {
  const [formData, setFormData] = useState<Omit<Room, 'room_number'> & { roomNumber: string, checkIn: string, checkOut: string }>({
    name: '',
    type: '',
    capacity: 2,
    pricePerNight: 0,
    amenities: [],
    isAvailable: true,
    roomNumber: '',
    checkIn: travelStartDate,
    checkOut: travelEndDate,
    stayDates: []
  });
  const [newAmenity, setNewAmenity] = useState('');
  
  // 一括追加用の状態
  const [bulkData, setBulkData] = useState({
    selectedRoomType: '',
    roomCount: 1,
    startRoomNumber: '',
    baseName: '',
    nights: 1 // 一括追加用にも泊数
  });

  // 既存の部屋タイプを取得
  const existingRoomTypes = Array.from(new Set(existingRooms.map(r => r.type)));

  // 選択された部屋タイプの情報を取得
  const selectedRoomInfo = existingRooms.find(r => r.type === bulkData.selectedRoomType);

  // 編集時は既存データを設定
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: [...room.amenities],
        isAvailable: room.isAvailable,
        roomNumber: room.room_number,
        checkIn: room.check_in || '',
        checkOut: room.check_out || '',
      });
    }
  }, [room]);

  /**
   * フォームデータを更新
   */
  const handleInputChange = (field: keyof Omit<Room, 'room_number'> | 'roomNumber' | 'checkIn' | 'checkOut', value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 一括追加データを更新
   */
  const handleBulkInputChange = (field: keyof typeof bulkData, value: any) => {
    setBulkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 部屋番号の連番を生成
   */
  const generateRoomNumbers = (startNumber: string, count: number): string[] => {
    const start = parseInt(startNumber) || 101;
    return Array.from({ length: count }, (_, i) => (start + i).toString());
  };

  // デフォルトの開始部屋番号を101に
  useEffect(() => {
    if (isBulkAdd && !bulkData.startRoomNumber) {
      handleBulkInputChange('startRoomNumber', '101');
    }
    // eslint-disable-next-line
  }, [isBulkAdd]);

  /**
   * 部屋名の連番を生成
   */
  const generateRoomNames = (baseName: string, count: number): string[] => {
    return Array.from({ length: count }, (_, i) => 
      count === 1 ? baseName : `部屋${i + 1}`
    );
  };

  /**
   * 一括追加の実行
   */
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomInfo || !bulkData.startRoomNumber || !bulkData.baseName) return;

    const roomNumbers = generateRoomNumbers(bulkData.startRoomNumber, bulkData.roomCount);
    const roomNames = generateRoomNames(bulkData.baseName, bulkData.roomCount);

    const newRooms: Room[] = roomNumbers.map((roomNumber, index) => ({
      room_number: roomNumber, // ←id→room_number
      room_name: roomNames[index], // ←name→room_name
      type: selectedRoomInfo.type,
      capacity: selectedRoomInfo.capacity,
      pricePerNight: selectedRoomInfo.pricePerNight,
      amenities: [...selectedRoomInfo.amenities],
      isavailable: true, // ←小文字で送信
      stay_dates: Array.from({ length: bulkData.nights }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      }) // 泊数を反映
    }));

    if (onBulkSave) {
      onBulkSave(newRooms);
    }
  };

  /**
   * アメニティを追加
   */
  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  /**
   * アメニティを削除
   */
  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  // チェックイン・チェックアウト日からstay_datesを自動生成
  const getStayDates = (checkIn: string, checkOut: string): string[] => {
    if (!checkIn || !checkOut) return [];
    const dates = [];
    let current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  /**
   * フォームを送信
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // stay_datesの生成・セットを削除
    if (formData.name.trim() && formData.type.trim() && formData.pricePerNight > 0 && formData.roomNumber.trim() && formData.checkIn && formData.checkOut) {
      const roomData: any = {
        room_number: formData.roomNumber.trim(),
        room_name: formData.name,
        type: formData.type,
        capacity: formData.capacity,
        pricePerNight: formData.pricePerNight,
        amenities: formData.amenities,
        isavailable: formData.isAvailable,
        check_in: formData.checkIn,
        check_out: formData.checkOut
      };
      // 編集時はidも渡す
      if (room && (room as any).id) {
        roomData.id = (room as any).id;
      }
      onSave(roomData);
    }
  };

  return (
    <form onSubmit={isBulkAdd ? handleBulkSubmit : handleSubmit} className="space-y-6">
      {isBulkAdd ? (
        // 一括追加モード
        <>
          {/* 部屋タイプ選択 */}
          <div>
            <label htmlFor="roomTypeSelect" className="block text-sm font-medium text-gray-700 mb-2">
              部屋タイプを選択 *
            </label>
            <select
              id="roomTypeSelect"
              value={bulkData.selectedRoomType}
              onChange={(e) => handleBulkInputChange('selectedRoomType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">既存の部屋タイプを選択</option>
              {existingRoomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {selectedRoomInfo && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>選択された部屋タイプ:</strong> {selectedRoomInfo.type}<br/>
                  <strong>定員:</strong> {selectedRoomInfo.capacity}人<br/>
                  <strong>料金:</strong> ¥{selectedRoomInfo.pricePerNight.toLocaleString()}<br/>
                  <strong>アメニティ:</strong> {selectedRoomInfo.amenities.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* 部屋数 */}
          <div>
            <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700 mb-2">
              追加する部屋数 *
            </label>
            <input
              type="number"
              id="roomCount"
              value={bulkData.roomCount}
              onChange={(e) => handleBulkInputChange('roomCount', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="20"
              required
            />
          </div>

          {/* 開始部屋番号 */}
          <div>
            <label htmlFor="startRoomNumber" className="block text-sm font-medium text-gray-700 mb-2">
              開始部屋番号 *
            </label>
            <input
              type="text"
              id="startRoomNumber"
              value={bulkData.startRoomNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleBulkInputChange('startRoomNumber', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 201"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              連番で自動生成されます（例: 201, 202, 203...）
            </p>
          </div>

          {/* 部屋名のベース */}
          <div>
            <label htmlFor="baseName" className="block text-sm font-medium text-gray-700 mb-2">
              部屋名のベース *
            </label>
            <input
              type="text"
              id="baseName"
              value={bulkData.baseName}
              onChange={(e) => handleBulkInputChange('baseName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: オーシャンビュー ツイン"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {bulkData.roomCount > 1 ? `複数部屋の場合: "部屋1", "部屋2"...` : 'そのまま使用されます'}
            </p>
          </div>

          {/* 泊数 */}
          <div>
            <label htmlFor="bulkNights" className="block text-sm font-medium text-gray-700 mb-2">
              泊数 *
            </label>
            <input
              type="number"
              id="bulkNights"
              value={bulkData.nights}
              onChange={e => handleBulkInputChange('nights', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">1泊以上で入力してください</p>
          </div>

          {/* プレビュー */}
          {bulkData.selectedRoomType && bulkData.startRoomNumber && bulkData.baseName && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">追加される部屋のプレビュー:</h4>
              <div className="space-y-1">
                {generateRoomNumbers(bulkData.startRoomNumber, bulkData.roomCount).map((roomNumber, index) => (
                  <div key={roomNumber} className="text-sm text-blue-700">
                    <strong>部屋{index + 1}:</strong> {generateRoomNames(bulkData.baseName, bulkData.roomCount)[index]} 
                    ({selectedRoomInfo?.type}, {selectedRoomInfo?.capacity}人, ¥{selectedRoomInfo?.pricePerNight.toLocaleString()})
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // 通常の単一追加・編集モード
        <>
          {/* 部屋番号 */}
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
              部屋番号 *
            </label>
            <input
              type="text"
              id="roomNumber"
              value={formData.roomNumber || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleInputChange('roomNumber', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 101"
              required
            />
            <p className="text-xs text-gray-500 mt-1">数字で入力してください</p>
          </div>

          {/* 部屋名 */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              部屋名 *
            </label>
            <input
              type="text"
              id="roomName"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: オーシャンビュー ツイン"
              required
            />
          </div>

          {/* 部屋タイプ */}
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
              部屋タイプ *
            </label>
            <select
              id="roomType"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">部屋タイプを選択</option>
              <option value="シングルルーム">シングルルーム</option>
              <option value="ツインルーム">ツインルーム</option>
              <option value="ダブルルーム">ダブルルーム</option>
              <option value="トリプルルーム">トリプルルーム</option>
              <option value="スイートルーム">スイートルーム</option>
              <option value="ファミリールーム">ファミリールーム</option>
            </select>
          </div>

          {/* 定員 */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              定員 *
            </label>
            <select
              id="capacity"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={1}>1人</option>
              <option value={2}>2人</option>
              <option value={3}>3人</option>
              <option value={4}>4人</option>
              <option value={5}>5人</option>
              <option value={6}>6人</option>
            </select>
          </div>

          {/* 1泊あたりの料金 */}
          <div>
            <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
              1泊あたりの料金 (円) *
            </label>
            <input
              type="number"
              id="pricePerNight"
              value={formData.pricePerNight}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange('pricePerNight', value === '' ? '' : parseInt(value));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 12000"
              min="0"
              required
            />
          </div>

          {/* アメニティ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アメニティ
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: オーシャンビュー"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addAmenity}
                disabled={!newAmenity.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`${amenity}を削除`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 利用可能フラグ */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              利用可能
            </label>
          </div>

          {/* チェックイン・チェックアウト日選択UI */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">チェックイン日 *</label>
              <input
                type="date"
                id="checkIn"
                value={formData.checkIn}
                onChange={e => handleInputChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">チェックアウト日 *</label>
              <input
                type="date"
                id="checkOut"
                value={formData.checkOut}
                onChange={e => handleInputChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">チェックイン日からチェックアウト日の前日までが宿泊日となります</p>
        </>
      )}

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {isBulkAdd ? '一括追加' : (room ? '更新' : '追加')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
};

export default RoomForm; 