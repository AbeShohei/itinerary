import React, { useState } from 'react';
import { Users, UserCheck, ChevronDown } from 'lucide-react';

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
 * 部屋の型定義
 */
interface Room {
  id: string;
  room_number: string;
  room_name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}

/**
 * メンバーカードコンポーネントのプロパティ
 * 
 * @param member - メンバーデータ
 * @param isAssigned - 割り当て済みかどうか
 * @param rooms - 利用可能な部屋リスト
 * @param currentAssignments - 現在の割り当て状況
 * @param onAssign - 割り当て時のコールバック
 */
interface MemberCardProps {
  member: Member;
  isAssigned: boolean;
  rooms: Room[];
  currentAssignments: { [roomId: string]: string[] };
  onAssign: (memberId: string, roomId: string) => void;
}

/**
 * メンバーカードコンポーネント
 * 個別のメンバーを表示し、部屋割り当て機能を提供
 */
const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isAssigned,
  rooms,
  currentAssignments,
  onAssign
}) => {
  const [showRoomSelect, setShowRoomSelect] = useState(false);

  /**
   * 利用可能な部屋を取得
   */
  const getAvailableRooms = () => {
    return rooms.filter(room => {
      if (!room.isAvailable) return false;
      const currentMembers = currentAssignments[room.room_number] || [];
      return currentMembers.length < room.capacity;
    });
  };

  /**
   * 部屋に割り当て
   */
  const handleAssignToRoom = (roomNumber: string) => {
    onAssign(member.id, roomNumber);
    setShowRoomSelect(false);
  };

  const availableRooms = getAvailableRooms();

  return (
    <div className={`bg-white p-4 rounded-lg border transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 ${
      isAssigned 
        ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-blue-600'
    }`}>
      <div className="flex items-center justify-between">
        {/* メンバー情報 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* アバター */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            member.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
          }`}>
            <Users className="h-5 w-5" />
          </div>
          
          {/* メンバー詳細 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                member.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
              }`}>
                {member.gender === 'male' ? '男性' : '女性'}
              </span>
              {isAssigned && (
                <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
            
            {/* 希望条件 */}
            {member.preferences.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {member.preferences.map((preference, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300"
                  >
                    {preference}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 部屋選択ドロップダウン */}
        {!isAssigned && (
          <div className="relative">
            <button
              onClick={() => setShowRoomSelect(!showRoomSelect)}
              disabled={availableRooms.length === 0}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                availableRooms.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              部屋を選択
              <ChevronDown className={`h-3 w-3 transition-transform ${
                showRoomSelect ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* ドロップダウンメニュー */}
            {showRoomSelect && availableRooms.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2 dark:text-gray-400">利用可能な部屋</div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableRooms.map((room) => {
                      const currentMembers = currentAssignments[room.room_number] || [];
                      const remainingCapacity = room.capacity - currentMembers.length;
                      
                      return (
                        <button
                          key={room.room_number}
                          onClick={() => handleAssignToRoom(room.room_number)}
                          className="w-full text-left p-2 hover:bg-blue-50 rounded-md transition-colors dark:hover:bg-blue-900"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold dark:bg-blue-900 dark:text-blue-300">
                              {room.room_number}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{room.room_name}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{room.type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">¥{room.pricePerNight.toLocaleString()}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{remainingCapacity}人空き</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 利用可能な部屋がない場合のメッセージ */}
      {!isAssigned && availableRooms.length === 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700 text-center">
            利用可能な部屋がありません
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberCard; 