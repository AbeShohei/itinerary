import React from 'react';
import { Bed, Users, Wifi, Eye, X, Edit, Trash2 } from 'lucide-react';

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
  room_number: string; // 部屋番号を追加
}

/**
 * メンバーの型定義
 */
interface Member {
  id: string;
  name: string;
  gender: 'male' | 'female';
  preferences: string[];
}

/**
 * 部屋カードコンポーネントのプロパティ
 * 
 * @param room - 部屋データ
 * @param assignedMembers - 割り当てられたメンバーリスト
 * @param allMembers - 全メンバーリスト
 * @param onRemoveMember - メンバー削除時のコールバック
 */
interface RoomCardProps {
  room: Room;
  assignedMembers: Member[];
  allMembers: Member[];
  onRemoveMember: (memberId: string, roomId: string) => void;
  onEditRoom?: (room: Room) => void;
  onAssignMember?: (memberId: string, roomId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
}

/**
 * 部屋カードコンポーネント
 * 個別の部屋を表示し、割り当てられたメンバーを管理
 */
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  assignedMembers,
  allMembers,
  onRemoveMember,
  onEditRoom,
  onAssignMember,
  onDeleteRoom
}) => {
  const occupancyRate = (assignedMembers.length / room.capacity) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* 部屋ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                {room.room_number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{room.name}</h3>
              <div className="flex items-center gap-1">
                {onEditRoom && (
                  <button
                    onClick={() => onEditRoom(room)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    aria-label="部屋を編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {onDeleteRoom && (
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label="部屋を削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          <p className="text-sm text-gray-600">{room.type}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">¥{room.pricePerNight.toLocaleString()}</p>
          <p className="text-sm text-gray-600">/泊</p>
        </div>
      </div>
      
      {/* 部屋情報 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {assignedMembers.length} / {room.capacity} 人
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{room.type}</span>
        </div>
      </div>
      
      {/* アメニティ */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {room.amenities.map((amenity, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
      
      {/* 進捗状況バー */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">割り当て進捗</span>
          <span className="font-semibold">{Math.round(occupancyRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${
              occupancyRate >= 100 ? 'bg-red-500' : 
              occupancyRate >= 80 ? 'bg-yellow-500' : 
              occupancyRate >= 50 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
          {/* 進捗アニメーション効果 */}
          {occupancyRate > 0 && occupancyRate < 100 && (
            <div 
              className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{assignedMembers.length}人割り当て済み</span>
          <span>{room.capacity - assignedMembers.length}人空き</span>
        </div>
      </div>
      
      {/* 割り当てられたメンバー */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">割り当てメンバー</h4>
          {onAssignMember && assignedMembers.length < room.capacity && (
            <button
              onClick={() => {
                // 未割り当てメンバーを取得
                const unassignedMembers = allMembers.filter(member => 
                  !assignedMembers.some(assigned => assigned.id === member.id)
                );
                if (unassignedMembers.length > 0) {
                  // 最初の未割り当てメンバーを割り当て
                  onAssignMember(unassignedMembers[0].id, room.room_number);
                }
              }}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              メンバー追加
            </button>
          )}
        </div>
        {assignedMembers.length > 0 ? (
          <div className="space-y-2">
            {assignedMembers.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    member.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    <Users className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                </div>
                <button
                  onClick={() => onRemoveMember(member.id, room.room_number)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label="メンバーを削除"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            メンバーが割り当てられていません
          </p>
        )}
      </div>
      
      {/* 満室警告 */}
      {assignedMembers.length >= room.capacity && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center">満室です</p>
        </div>
      )}
    </div>
  );
};

export default RoomCard; 