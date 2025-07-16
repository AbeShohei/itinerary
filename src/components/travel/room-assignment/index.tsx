import React, { useState, useEffect } from 'react';
import { Users, Bed, Plus, Shuffle, Calendar, ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Layers, UserPlus } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import MemberCard from './MemberCard';
import RoomCard from './RoomCard';
import MemberForm from './MemberForm';
import RoomForm from './RoomForm';
import ResetConfirmModal from './ResetConfirmModal';
import DeleteRoomModal from './DeleteRoomModal';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { roomAssignmentApi } from '../../../services/travelApi';
import { memberApi, Member } from '../../../services/memberApi';

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
  id?: string; // 部屋ID
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
  stay_dates?: string[]; // 部屋が泊まれる日付の配列
  check_in?: string; // チェックイン日
  check_out?: string; // チェックアウト日
}

/**
 * 日別割り当ての型定義
 */
interface DayAssignment {
  date: string;
  day: string;
  roomAssignments: { [roomId: string]: string[] }; // roomId -> memberIds
}

interface TravelInfo {
  startDate: string;
  endDate: string;
  destination: string;
  memberCount?: number; // グループ人数を追加
  id?: string; // 旅行ID
}

interface RoomAssignmentTabProps {
  travelInfo?: TravelInfo;
}

/**
 * 部屋割り当てタブコンポーネント
 * 部屋割り当ての管理、メンバーの追加、自動割り当て機能を提供
 */
const RoomAssignmentTab: React.FC<RoomAssignmentTabProps> = ({ travelInfo }) => {
  // メンバーデータの状態
  const [members, setMembers] = useState<Member[]>([]);

  // 部屋データの状態
  const [rooms, setRooms] = useState<Room[]>([]);

  // 日別割り当ての状態
  const [dayAssignments, setDayAssignments] = useState<DayAssignment[]>([]);

  // UI状態
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showBulkAddRoom, setShowBulkAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkEditMembers, setBulkEditMembers] = useState<Member[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    '静か', '景色重視', 'コスト重視', 'アクセス重視', '禁煙', 'Wi-Fi重視'
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // メンバー名のサンプル配列
  const sampleNames = [
    '田中太郎', '佐藤花子', '山田次郎', '鈴木美咲', '高橋健太',
    '伊藤雅子', '渡辺雄一', '中村恵子', '小林正男', '加藤美香',
    '吉田健二', '山口智子', '松本大輔', '井上由美', '木村和也',
    '林美穂', '斎藤隆', '清水恵美', '森田一郎', '池田真由美'
  ];

  // 旅行情報からメンバーを自動生成
  const generateMembersFromTravelInfo = (memberCount: number): Member[] => {
    const generatedMembers: Member[] = [];
    
    for (let i = 0; i < memberCount; i++) {
      // 性別をランダムに決定
      const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
      
      // 希望条件をランダムに選択（1-3個）
      const preferenceCount = Math.floor(Math.random() * 3) + 1;
      const shuffledPreferences = [...availableTags].sort(() => 0.5 - Math.random());
      const preferences = shuffledPreferences.slice(0, preferenceCount);
      
      generatedMembers.push({
        id: `member-${i + 1}`,
        name: `メンバー${i + 1}`,
        gender,
        preferences
      });
    }
    
    return generatedMembers;
  };

  // 旅行情報が変更された時にメンバーと日付を自動生成
  useEffect(() => {
    console.log('RoomAssignmentTab: travelInfo received:', travelInfo);
    if (travelInfo && travelInfo.startDate && travelInfo.endDate) {
      // メンバーの自動生成は行わない
      // 日付の自動生成のみ
      const start = new Date(travelInfo.startDate);
      const end = new Date(travelInfo.endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      console.log('RoomAssignmentTab: Generating dates for nights:', nights);
      if (nights <= 0) {
        setDayAssignments([]);
        setCurrentDayIndex(0);
        return;
      }
      const days: DayAssignment[] = [];
      let current = new Date(start);
      for (let dayCount = 1; dayCount <= nights; dayCount++) {
        const dateStr = current.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const dayOfWeek = current.toLocaleDateString('ja-JP', { weekday: 'short' });
        const fullDateStr = `${dateStr} (${dayOfWeek})`;
        days.push({
          date: fullDateStr,
          day: `${dayCount}日目`,
          roomAssignments: {}
        });
        current.setDate(current.getDate() + 1);
      }
      setDayAssignments(days);
      setCurrentDayIndex(0);
      console.log('RoomAssignmentTab: Generated days:', days);
    }
  }, [travelInfo]);

  // 部屋データをSupabaseから取得
  useEffect(() => {
    if (travelInfo?.id) {
      roomAssignmentApi.getRoomAssignments(travelInfo.id).then((data) => {
        setRooms(data.map((r: any) => ({
          id: r.id,
          room_number: r.room_number,
          name: r.room_name, // ←ここで必ずnameにマッピング
          type: r.type,
          capacity: r.capacity,
          pricePerNight: r.pricePerNight,
          amenities: r.amenities,
          isAvailable: r.isAvailable !== false, // undefinedならtrue
          stay_dates: r.stay_dates, // stay_datesを追加
          check_in: r.check_in,
          check_out: r.check_out,
        })));
      });
    }
  }, [travelInfo?.id]);

  // メンバー一覧取得
  useEffect(() => {
    if (travelInfo?.id) {
      memberApi.getMembers(travelInfo.id).then(async (members) => {
        setMembers(members); // 0件でも空のまま
      });
    }
  }, [travelInfo?.id, travelInfo?.memberCount]);

  // 宿泊日数を取得
  const getStayNights = () => {
    if (!travelInfo?.startDate || !travelInfo?.endDate) return 0;
    const start = new Date(travelInfo.startDate);
    const end = new Date(travelInfo.endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, nights); // 負の値は0に
  };

  // 旅程の総日数を取得
  const getTotalDays = () => {
    const nights = getStayNights();
    return nights + 1; // 宿泊日数 + 1 = 旅程日数
  };

  // 連泊情報を取得
  const getConsecutiveStayInfo = () => {
    const nights = getStayNights();
    if (nights <= 1) return null;
    
    return {
      nights,
      totalDays: nights + 1,
      isConsecutive: nights > 1,
      message: `${nights}泊${nights + 1}日の旅程`,
      startDate: travelInfo?.startDate,
      endDate: travelInfo?.endDate
    };
  };

  // 現在の日付情報を取得
  const getCurrentDateInfo = () => {
    if (!currentDay) return null;
    
    const nights = getStayNights();
    const currentDayNumber = currentDayIndex + 1;
    
    return {
      currentDay: currentDayNumber,
      totalDays: nights,
      isLastDay: currentDayNumber === nights,
      isFirstDay: currentDayNumber === 1,
      date: currentDay.date,
      dayLabel: currentDay.day
    };
  };

  // 現在の日と割り当てを取得
  const currentDay = dayAssignments[currentDayIndex];
  const currentAssignments = currentDay?.roomAssignments || {};
  const currentDateStr = currentDay?.date?.split(' ')[0]?.replace(/\(|\)/g, '').replaceAll('/', '-'); // 例: "2025-07-20"

  // 部屋ごとにcheck_in, check_outでその日泊まる部屋だけを抽出（Date型で厳密比較）
  const roomsForCurrentDay = rooms.filter(room => {
    if (!room.check_in || !room.check_out || !currentDateStr) return false;
    const checkIn = new Date(room.check_in);
    const checkOut = new Date(room.check_out);
    const current = new Date(currentDateStr);
    return checkIn <= current && current < checkOut;
  });

  /**
   * 未割り当てメンバーを取得
   */
  const getUnassignedMembers = () => {
    const assignedMemberIds = Object.values(currentAssignments).flat();
    return members.filter(member => !assignedMemberIds.includes(member.id));
  };

  /**
   * 1日の総コストを計算
   */
  const getTotalCostForDay = () => {
    return Object.keys(currentAssignments).reduce((total, roomId) => {
      const room = rooms.find(r => r.room_number === roomId);
      return total + (room?.pricePerNight || 0);
    }, 0);
  };

  /**
   * 1人あたりのコストを計算
   */
  const getCostPerPerson = () => {
    const totalCost = getTotalCostForDay();
    return totalCost / members.length;
  };

  /**
   * メンバーを部屋に割り当て
   */
  const assignMemberToRoom = async (memberId: string, roomNumber: string) => {
    const room = rooms.find(r => r.room_number === roomNumber);
    const currentRoomMembers = currentAssignments[roomNumber] || [];
    if (room && currentRoomMembers.length < room.capacity) {
      // 他の部屋からメンバーを削除
      const newAssignments = { ...currentAssignments };
      Object.keys(newAssignments).forEach(rId => {
        newAssignments[rId] = (newAssignments[rId] || []).filter(id => id !== memberId);
      });
      // 新しい部屋に追加
      newAssignments[roomNumber] = [...(newAssignments[roomNumber] || []), memberId];
      // 日別割り当てを更新
      const updatedDayAssignments = dayAssignments.map((day, index) =>
        index === currentDayIndex
          ? { ...day, roomAssignments: newAssignments }
          : day
      );
      setDayAssignments(updatedDayAssignments);
      // DBにも反映
      if (room.id) {
        await roomAssignmentApi.updateRoomAssignment(room.id, { members: newAssignments[roomNumber] });
      }
    }
  };

  /**
   * 部屋からメンバーを削除
   */
  const removeMemberFromRoom = async (memberId: string, roomNumber: string) => {
    const current = currentAssignments[roomNumber] || [];
    const newMembers = current.filter(id => id !== memberId);
    const newAssignments = { ...currentAssignments, [roomNumber]: newMembers };
    const updatedDayAssignments = dayAssignments.map((day, index) =>
      index === currentDayIndex
        ? { ...day, roomAssignments: newAssignments }
        : day
    );
    setDayAssignments(updatedDayAssignments);
    // DBにも反映
    const room = rooms.find(r => r.room_number === roomNumber);
    if (room && room.id) {
      await roomAssignmentApi.updateRoomAssignment(room.id, { members: newMembers });
    }
  };

  /**
   * 前日の割り当てをコピー
   */
  const copyFromPreviousDay = () => {
    if (currentDayIndex > 0) {
      const previousAssignments = dayAssignments[currentDayIndex - 1].roomAssignments;
      const updatedDayAssignments = dayAssignments.map((day, index) => 
        index === currentDayIndex 
          ? { ...day, roomAssignments: { ...previousAssignments } }
          : day
      );
      setDayAssignments(updatedDayAssignments);
    }
  };

  /**
   * 連泊時の自動コピー
   */
  const autoCopyForConsecutiveStay = () => {
    if (getConsecutiveStayInfo()?.isConsecutive && currentDayIndex > 0) {
      copyFromPreviousDay();
    }
  };

  /**
   * 全期間の自動割り当て（連泊対応）
   */
  const autoAssignAllDays = () => {
    // 1日目の割り当てを生成
    const unassignedMembers = getUnassignedMembers();
    const availableRooms = rooms.filter(room => room.isAvailable);
    if (unassignedMembers.length === 0 || availableRooms.length === 0) return;

    // 1日目の割り当てロジック
    let newAssignments: { [roomId: string]: string[] } = {};
    let memberIndex = 0;
    for (const room of availableRooms) {
      const remainingCapacity = room.capacity;
      newAssignments[room.room_number] = [];
      for (let i = 0; i < remainingCapacity && memberIndex < unassignedMembers.length; i++) {
        newAssignments[room.room_number].push(unassignedMembers[memberIndex].id);
        memberIndex++;
      }
    }

    // 全日分にコピー
    const updatedDayAssignments = dayAssignments.map((day) => ({
      ...day,
      roomAssignments: { ...newAssignments }
    }));
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 自動割り当て
   */
  const autoAssignRooms = () => {
    const unassignedMembers = getUnassignedMembers();
    const availableRooms = rooms.filter(room => room.isAvailable);
    
    let newAssignments = { ...currentAssignments };
    let memberIndex = 0;
    
    // 各部屋に順番に割り当て
    for (const room of availableRooms) {
      const currentRoomMembers = newAssignments[room.room_number] || [];
      const remainingCapacity = room.capacity - currentRoomMembers.length;
      
      for (let i = 0; i < remainingCapacity && memberIndex < unassignedMembers.length; i++) {
        newAssignments[room.room_number] = [...(newAssignments[room.room_number] || []), unassignedMembers[memberIndex].id];
        memberIndex++;
      }
    }
    
    // 日別割り当てを更新
    const updatedDayAssignments = dayAssignments.map((day, index) => 
      index === currentDayIndex 
        ? { ...day, roomAssignments: newAssignments }
        : day
    );
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * メンバーをIDで取得
   */
  const getMemberById = (id: string) => members.find(m => m.id === id);

  /**
   * 新しいメンバーを追加
   */
  const addMember = async (member: Omit<Member, 'id' | 'created_at'>) => {
    if (travelInfo?.id) {
      await memberApi.createMember({ ...member, travel_id: travelInfo.id });
      // 追加後はDBから再取得
      const members = await memberApi.getMembers(travelInfo.id);
      setMembers(members);
    }
    setShowAddMember(false);
  };

  /**
   * 新しい部屋を追加
   */
  const addRoom = async (room: Room) => {
    if (travelInfo?.id) {
      const { room_name, ...rest } = room;
      await roomAssignmentApi.createRoomAssignment({ ...rest, room_name, travel_id: travelInfo.id, check_in: room.check_in, check_out: room.check_out });
      const data = await roomAssignmentApi.getRoomAssignments(travelInfo.id);
      setRooms(data.map((r: any) => ({
        id: r.id,
        room_number: r.room_number,
        name: r.room_name,
        type: r.type,
        capacity: r.capacity,
        pricePerNight: r.pricePerNight,
        amenities: r.amenities,
        isAvailable: r.isAvailable !== false, // undefinedならtrue
        stay_dates: r.stay_dates, // stay_datesを追加
        check_in: r.check_in,
        check_out: r.check_out,
      })));
    }
    setShowAddRoom(false);
  };

  /**
   * 複数の部屋を一括追加
   */
  const addBulkRooms = async (newRooms: Room[]) => {
    if (travelInfo?.id) {
      for (const room of newRooms) {
        const { room_name, ...rest } = room;
        await roomAssignmentApi.createRoomAssignment({ ...rest, room_name, travel_id: travelInfo.id });
      }
      const data = await roomAssignmentApi.getRoomAssignments(travelInfo.id);
      setRooms(data.map((r: any) => ({
        id: r.id,
        room_number: r.room_number,
        name: r.room_name,
        type: r.type,
        capacity: r.capacity,
        pricePerNight: r.pricePerNight,
        amenities: r.amenities,
        isAvailable: r.isAvailable !== false, // undefinedならtrue
        stay_dates: r.stay_dates, // stay_datesを追加
      })));
    }
    setShowBulkAddRoom(false);
  };

  /**
   * 部屋を編集
   */
  const editRoom = async (room: any) => {
    const roomId = room.id || room['id'];
    if (roomId) {
      await roomAssignmentApi.updateRoomAssignment(roomId, {
        room_number: room.room_number,
        room_name: room.room_name || room.name,
        type: room.type,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities,
        isavailable: room.isavailable !== undefined ? room.isavailable : room.isAvailable,
        stay_dates: room.stay_dates,
        check_in: room.check_in,
        check_out: room.check_out,
      });
      if (travelInfo?.id) {
        const data = await roomAssignmentApi.getRoomAssignments(travelInfo.id);
        setRooms(data.map((r: any) => ({
          id: r.id,
          room_number: r.room_number,
          name: r.room_name,
          type: r.type,
          capacity: r.capacity,
          pricePerNight: r.pricePerNight,
          amenities: r.amenities,
          isAvailable: r.isAvailable !== false,
          stay_dates: r.stay_dates,
          check_in: r.check_in,
          check_out: r.check_out,
        })));
      }
    }
    setEditingRoom(null);
  };

  /**
   * 部屋を削除
   */
  const deleteRoom = async (roomId: string) => {
    await roomAssignmentApi.deleteRoomAssignment(roomId);
    if (travelInfo?.id) {
      const data = await roomAssignmentApi.getRoomAssignments(travelInfo.id);
      setRooms(data.map((r: any) => ({
        id: r.id,
        room_number: r.room_number,
        name: r.room_name,
        type: r.type,
        capacity: r.capacity,
        pricePerNight: r.pricePerNight,
        amenities: r.amenities,
        isAvailable: r.isAvailable !== false, // undefinedならtrue
        stay_dates: r.stay_dates, // stay_datesを追加
      })));
    }
    // 日別割り当てからも削除（既存ロジック）
    const updatedDayAssignments = dayAssignments.map(day => {
      const newRoomAssignments = { ...day.roomAssignments };
      delete newRoomAssignments[roomId];
      return {
        ...day,
        roomAssignments: newRoomAssignments
      };
    });
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 割り当てを全解除
   */
  const resetAllAssignments = () => {
    // 現在の日の割り当てを全てクリア
    const updatedDayAssignments = dayAssignments.map((day, index) => 
      index === currentDayIndex 
        ? { ...day, roomAssignments: {} }
        : day
    );
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 現在割り当てられているメンバー数を取得
   */
  const getAssignedMemberCount = () => {
    return Object.values(currentAssignments).flat().length;
  };

  // 編集モード開始
  const startEditMode = () => {
    setEditMode(true);
    setBulkEditMembers([...members]);
    setSelectedMemberIds([]);
  };

  // 編集モード終了
  const cancelEditMode = () => {
    setEditMode(false);
    setBulkEditMembers([]);
    setSelectedMemberIds([]);
  };

  // 編集内容保存
  const saveBulkEdit = () => {
    setMembers([...bulkEditMembers]);
    setEditMode(false);
    setSelectedMemberIds([]);
  };

  // メンバー選択切り替え
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };

  // 一括削除
  const deleteSelectedMembers = () => {
    setBulkEditMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
    setSelectedMemberIds([]);
  };

  // メンバー編集（インライン）
  const updateBulkEditMember = (id: string, updates: Partial<Member>) => {
    setBulkEditMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // タグ追加
  const addTag = () => {
    if (newTagInput.trim() && !availableTags.includes(newTagInput.trim())) {
      setAvailableTags(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  // タグ削除
  const removeTag = (tagToRemove: string) => {
    // 使用中のタグは削除できない
    const isTagInUse = members.some(member => member.preferences.includes(tagToRemove));
    if (isTagInUse) {
      alert(`${tagToRemove}は使用中のため削除できません`);
      return;
    }
    
    setAvailableTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // タグ入力のキーハンドリング
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  // メンバー編集
  const editMember = async (id: string, updates: Partial<Member>) => {
    if (travelInfo?.id) {
      await memberApi.updateMember(id, updates);
      // 編集後はDBから再取得
      const members = await memberApi.getMembers(travelInfo.id);
      setMembers(members);
    }
  };

  // メンバー削除
  const deleteMember = async (id: string) => {
    if (travelInfo?.id) {
      await memberApi.deleteMember(id);
      // 削除後はDBから再取得
      const members = await memberApi.getMembers(travelInfo.id);
      setMembers(members);
    }
  };

  return (
    <div className="space-y-6">
      {/* 日付・操作ボタンエリア */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col gap-2">
        {/* 1段目: 日付・旅程情報を中央寄せ（常に中央） */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))} disabled={currentDayIndex === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40" title="前の日付に移動">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900">{currentDay?.day}</span>
            <button onClick={() => setCurrentDayIndex(Math.min(dayAssignments.length - 1, currentDayIndex + 1))} disabled={currentDayIndex === dayAssignments.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40" title="次の日付に移動">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <span className="text-xs text-gray-500">{currentDay?.date}</span>
          <span className="text-xs text-blue-600 font-medium">{getConsecutiveStayInfo()?.message}</span>
          <span className="text-xs text-green-600 font-medium">{getCurrentDateInfo()?.isFirstDay && '初日'}{getCurrentDateInfo()?.isLastDay && '最終日'}</span>
        </div>
        {/* 2段目: ボタン群を現代的に横並び・wrap対応 */}
        <div className="flex flex-wrap justify-center items-center gap-3 w-full mt-2">
          <button onClick={autoAssignAllDays} className="flex items-center gap-2 px-5 py-2 min-w-[140px] bg-blue-600 text-white rounded-full shadow font-semibold hover:bg-blue-700 transition">
            <Shuffle className="h-5 w-5" /> 全期間自動割り当て
          </button>
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 px-5 py-2 min-w-[120px] bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-semibold">
              <Plus className="h-5 w-5" /> 追加 <ChevronDown className="h-4 w-4" />
            </Menu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button onClick={() => setShowAddMember(true)} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                        <UserPlus className="h-4 w-4" /> メンバー追加
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button onClick={() => setShowAddRoom(true)} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                        <Bed className="h-4 w-4" /> 部屋追加
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button onClick={() => setShowBulkAddRoom(true)} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                        <Layers className="h-4 w-4" /> 一括追加
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-4 py-2 min-w-[100px] bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition text-sm ml-auto">
            <RotateCcw className="h-4 w-4" /> 全リセット
          </button>
        </div>
      </div>

      {/* コスト概要 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">1日あたり</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">¥{getTotalCostForDay().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">1人あたり</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">¥{getCostPerPerson().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">使用部屋数</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{Object.keys(currentAssignments).length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
              <Bed className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">宿泊日数</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getStayNights()}泊</p>
              {getConsecutiveStayInfo() && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  連泊
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                旅程: {getTotalDays()}日
              </p>
              {currentDay && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  現在: {currentDay.date}
                </p>
              )}
            </div>
            <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-900">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 全体進捗状況 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">全体割り当て進捗</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">割り当て済み</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">未割り当て</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 全体進捗バー */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>全体進捗</span>
              <span className="font-semibold">
                {Math.round((members.length - getUnassignedMembers().length) / members.length * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-700 ease-out ${
                  (members.length - getUnassignedMembers().length) / members.length >= 1 ? 'bg-green-500' : 
                  (members.length - getUnassignedMembers().length) / members.length >= 0.8 ? 'bg-blue-500' : 
                  (members.length - getUnassignedMembers().length) / members.length >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${Math.min((members.length - getUnassignedMembers().length) / members.length * 100, 100)}%` 
                }}
              />
              {/* 進捗アニメーション効果 */}
              {(members.length - getUnassignedMembers().length) / members.length > 0 && 
               (members.length - getUnassignedMembers().length) / members.length < 1 && (
                <div 
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                  style={{ 
                    width: `${Math.min((members.length - getUnassignedMembers().length) / members.length * 100, 100)}%` 
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{members.length - getUnassignedMembers().length}人割り当て済み</span>
              <span>{getUnassignedMembers().length}人未割り当て</span>
            </div>
          </div>

          {/* 部屋別進捗 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomsForCurrentDay.map((room) => {
              const assignedMembers = (currentAssignments[room.room_number] || [])
                .map(id => getMemberById(id))
                .filter(Boolean) as Member[];
              const occupancyRate = (assignedMembers.length / room.capacity) * 100;
              
                             return (
                 <div key={room.room_number} className="bg-gray-50 p-3 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center gap-2">
                       <div className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                         {room.room_number}
                       </div>
                       <span className="text-sm font-medium text-gray-900 truncate">{room.name}</span>
                     </div>
                     <span className="text-xs text-gray-500">{Math.round(occupancyRate)}%</span>
                   </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        occupancyRate >= 100 ? 'bg-red-500' : 
                        occupancyRate >= 80 ? 'bg-yellow-500' : 
                        occupancyRate >= 50 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{assignedMembers.length}/{room.capacity}人</span>
                    <span>{room.capacity - assignedMembers.length}人空き</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 未割り当てメンバー */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">未割り当てメンバー</h3>
            <div className="text-sm text-gray-600">
              全{members.length}人中 {getUnassignedMembers().length}人未割り当て
            </div>
          </div>
          
          {/* 編集モード切替ボタン */}
          <div className="flex justify-end mb-2">
            {!editMode ? (
              <Button variant="secondary" onClick={startEditMode} size="sm">編集モード</Button>
            ) : (
              <>
                <Button variant="primary" onClick={saveBulkEdit} size="sm" className="mr-2">保存</Button>
                <Button variant="secondary" onClick={cancelEditMode} size="sm">キャンセル</Button>
              </>
            )}
          </div>

          {/* タグ管理（編集モード時のみ表示） */}
          {editMode && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 dark:bg-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">タグ管理</h4>
                {!showTagInput && (
                  <Button variant="secondary" onClick={() => setShowTagInput(true)} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    タグ追加
                  </Button>
                )}
              </div>
              
              {/* タグ追加入力 */}
              {showTagInput && (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTagInput}
                    onChange={setNewTagInput}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="新しいタグ名"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={addTag} size="sm">追加</Button>
                  <Button variant="secondary" onClick={() => {
                    setNewTagInput('');
                    setShowTagInput(false);
                  }} size="sm">キャンセル</Button>
                </div>
              )}
              
              {/* タグ一覧 */}
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => {
                  const isTagInUse = members.some(member => member.preferences.includes(tag));
                  return (
                    <div key={tag} className="flex items-center gap-1 bg-white px-2 py-1 rounded border text-xs dark:bg-gray-600 dark:border-gray-500">
                      <span className={isTagInUse ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                        {tag}
                      </span>
                      {!isTagInUse && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`${tag}を削除`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* メンバーリスト */}
          {editMode ? (
            <div className="space-y-2">
              {bulkEditMembers.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded border dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <input type="checkbox" checked={selectedMemberIds.includes(member.id)} onChange={() => toggleSelectMember(member.id)} aria-label="メンバー選択" />
                    <label className="sr-only" htmlFor={`name-input-${member.id}`}>名前</label>
                    <Input id={`name-input-${member.id}`} value={member.name} onChange={v => updateBulkEditMember(member.id, { name: v })} className="w-full sm:w-32" title="名前" placeholder="名前" />
                  </div>
                  <label className="sr-only" htmlFor={`gender-select-${member.id}`}>性別</label>
                  <select id={`gender-select-${member.id}`} value={member.gender} onChange={e => updateBulkEditMember(member.id, { gender: e.target.value as 'male' | 'female' })} className="border rounded px-2 py-1 w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" title="性別">
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                  {/* タグ編集（希望条件） */}
                  <div className="flex flex-wrap gap-1 w-full">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={member.preferences.includes(tag)} onChange={() => {
                          const prefs = member.preferences.includes(tag)
                            ? member.preferences.filter(p => p !== tag)
                            : [...member.preferences, tag];
                          updateBulkEditMember(member.id, { preferences: prefs });
                        }} aria-label={tag} />
                        <span className="dark:text-gray-300">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="danger" onClick={deleteSelectedMembers} disabled={selectedMemberIds.length === 0} className="mt-2 w-full sm:w-auto">選択したメンバーを削除</Button>
            </div>
          ) : (
            // 従来のメンバーカード表示
            <div className="space-y-3">
              {getUnassignedMembers().map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAssigned={false}
                  rooms={rooms}
                  currentAssignments={currentAssignments}
                  onAssign={assignMemberToRoom}
                />
              ))}
              {getUnassignedMembers().length === 0 && (
                <p className="text-center text-gray-500 py-8">全メンバーが割り当てられています</p>
              )}
            </div>
          )}
        </div>

        {/* 部屋一覧 */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">部屋一覧</h3>
            <div className="text-sm text-gray-600">
              全{rooms.length}部屋
            </div>
          </div>
          <div className="space-y-4">
            {roomsForCurrentDay.map((room) => {
              const assignedMembers = (currentAssignments[room.room_number] || [])
                .map(id => getMemberById(id))
                .filter(Boolean) as Member[];
              
              return (
                <RoomCard
                  key={room.room_number}
                  room={room}
                  assignedMembers={assignedMembers}
                  allMembers={members}
                  onRemoveMember={removeMemberFromRoom}
                  onEditRoom={setEditingRoom}
                  onAssignMember={assignMemberToRoom}
                  onDeleteRoom={(roomId) => {
                    const roomToDelete = rooms.find(r => r.id === roomId); // ←ここをidで探す
                    if (roomToDelete) {
                      setDeletingRoom(roomToDelete);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* メンバー追加モーダル */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="新しいメンバーを追加"
        size="md"
      >
        <MemberForm
          onSave={addMember}
          onCancel={() => setShowAddMember(false)}
        />
      </Modal>

      {/* 部屋追加モーダル */}
      <Modal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        title="新しい部屋を追加"
        size="lg"
      >
        <RoomForm
          onSave={addRoom}
          onCancel={() => setShowAddRoom(false)}
          travelStartDate={travelInfo?.startDate}
          travelEndDate={travelInfo?.endDate}
        />
      </Modal>

      {/* 部屋編集モーダル */}
      <Modal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title="部屋を編集"
        size="lg"
      >
        <RoomForm
          room={editingRoom || undefined}
          onSave={editRoom}
          onCancel={() => setEditingRoom(null)}
          travelStartDate={travelInfo?.startDate}
          travelEndDate={travelInfo?.endDate}
        />
      </Modal>

      {/* リセット確認モーダル */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAllAssignments}
        memberCount={getAssignedMemberCount()}
      />

      {/* 部屋削除確認モーダル */}
      <DeleteRoomModal
        isOpen={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        onConfirm={() => {
          if (deletingRoom) {
            deleteRoom(deletingRoom.id || ''); // idがある場合はidを使用
            setDeletingRoom(null);
          }
        }}
        room={deletingRoom}
        assignedMemberCount={deletingRoom ? (currentAssignments[deletingRoom.room_number] || []).length : 0}
      />

      {/* 部屋一括追加モーダル */}
      <Modal
        isOpen={showBulkAddRoom}
        onClose={() => setShowBulkAddRoom(false)}
        title="部屋を一括追加"
        size="lg"
      >
        <RoomForm
          existingRooms={rooms}
          isBulkAdd={true}
          onBulkSave={addBulkRooms}
          onCancel={() => setShowBulkAddRoom(false)}
          travelStartDate={travelInfo?.startDate}
          travelEndDate={travelInfo?.endDate}
        />
      </Modal>
    </div>
  );
};

export default RoomAssignmentTab; 