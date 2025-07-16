/**
 * 旅行テンプレート生成ユーティリティ
 */

export interface RoomAssignment {
  id: string;
  roomName: string;
  members: string[];
}

export interface ScheduleDay {
  id: string;
  date: string;
  dayNumber: number;
  items: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation';
  linkType?: 'room' | 'place';
  linkId?: string;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
  shopping?: number;
  other?: number;
}

export interface PackingItem {
  id: string;
  category: string;
  name: string;
  isRequired: boolean;
  isPacked: boolean;
}

/**
 * 部屋割りテンプレートを生成
 */
export const generateRoomAssignments = (memberCount: number): RoomAssignment[] => {
  const rooms: RoomAssignment[] = [];
  
  if (memberCount <= 2) {
    // 2名以下は1部屋
    rooms.push({
      id: 'room-1',
      roomName: 'メインルーム',
      members: Array.from({ length: memberCount }, (_, i) => `メンバー${i + 1}`)
    });
  } else if (memberCount <= 4) {
    // 3-4名は2部屋
    const half = Math.ceil(memberCount / 2);
    rooms.push({
      id: 'room-1',
      roomName: 'ルームA',
      members: Array.from({ length: half }, (_, i) => `メンバー${i + 1}`)
    });
    rooms.push({
      id: 'room-2',
      roomName: 'ルームB',
      members: Array.from({ length: memberCount - half }, (_, i) => `メンバー${half + i + 1}`)
    });
  } else {
    // 5名以上は3部屋以上
    const roomsCount = Math.ceil(memberCount / 2);
    for (let i = 0; i < roomsCount; i++) {
      const startMember = i * 2 + 1;
      const endMember = Math.min(startMember + 1, memberCount);
      rooms.push({
        id: `room-${i + 1}`,
        roomName: `ルーム${String.fromCharCode(65 + i)}`, // A, B, C...
        members: Array.from({ length: endMember - startMember + 1 }, (_, j) => `メンバー${startMember + j}`)
      });
    }
  }
  
  return rooms;
};

/**
 * スケジュールテンプレートを生成
 */
export const generateScheduleTemplate = (startDate: string, endDate: string): ScheduleDay[] => {
  const schedule: ScheduleDay[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentDate = new Date(start);
  let dayNumber = 1;
  while (currentDate <= end) {
    schedule.push({
      id: `day-${dayNumber}`,
      date: currentDate.toISOString().split('T')[0],
      dayNumber,
      items: [
        { id: `item-${dayNumber}-1`, time: '08:00', title: '朝食', category: 'food', location: 'ホテル' },
        { id: `item-${dayNumber}-2`, time: '10:00', title: '観光地A', category: 'sightseeing', location: '観光地A' },
        { id: `item-${dayNumber}-3`, time: '12:00', title: '昼食', category: 'food', location: 'レストラン' },
        { id: `item-${dayNumber}-4`, time: '14:00', title: '観光地B', category: 'sightseeing', location: '観光地B' },
        { id: `item-${dayNumber}-5`, time: '18:00', title: '夕食', category: 'food', location: 'レストラン' },
        { id: `item-${dayNumber}-6`, time: '20:00', title: 'ホテルで休憩', category: 'accommodation', location: 'ホテル' }
      ]
    });
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }
  return schedule;
};

/**
 * 予算配分を推測
 */
export const estimateBudgetBreakdown = (totalBudget: number, travelType: 'domestic' | 'international'): BudgetBreakdown => {
  if (travelType === 'international') {
    // 海外旅行の予算配分
    return {
      transportation: Math.round(totalBudget * 0.35), // 航空券、現地交通費
      accommodation: Math.round(totalBudget * 0.30), // ホテル代
      food: Math.round(totalBudget * 0.20), // 食事代
      activities: Math.round(totalBudget * 0.10), // 観光・アクティビティ
      shopping: Math.round(totalBudget * 0.05) // ショッピング
    };
  } else {
    // 国内旅行の予算配分
    return {
      transportation: Math.round(totalBudget * 0.25), // 交通費
      accommodation: Math.round(totalBudget * 0.40), // 宿泊費
      food: Math.round(totalBudget * 0.20), // 食事代
      activities: Math.round(totalBudget * 0.15) // 観光・アクティビティ
    };
  }
};

/**
 * 持ち物リストテンプレートを生成
 */
export const generatePackingList = (travelType: 'domestic' | 'international', days: number): PackingItem[] => {
  const baseItems: PackingItem[] = [
    // 基本アイテム
    { id: 'passport', category: '重要書類', name: 'パスポート', isRequired: true, isPacked: false },
    { id: 'wallet', category: '重要書類', name: '財布', isRequired: true, isPacked: false },
    { id: 'phone', category: '電子機器', name: 'スマートフォン', isRequired: true, isPacked: false },
    { id: 'charger', category: '電子機器', name: '充電器', isRequired: true, isPacked: false },
    { id: 'clothes', category: '衣類', name: '着替え', isRequired: true, isPacked: false },
    { id: 'toothbrush', category: '衛生用品', name: '歯ブラシ', isRequired: true, isPacked: false },
    { id: 'toothpaste', category: '衛生用品', name: '歯磨き粉', isRequired: true, isPacked: false },
    { id: 'shampoo', category: '衛生用品', name: 'シャンプー', isRequired: false, isPacked: false },
    { id: 'conditioner', category: '衛生用品', name: 'コンディショナー', isRequired: false, isPacked: false },
    { id: 'towel', category: '衛生用品', name: 'タオル', isRequired: true, isPacked: false },
    { id: 'medicine', category: '医薬品', name: '常備薬', isRequired: false, isPacked: false },
    { id: 'camera', category: '電子機器', name: 'カメラ', isRequired: false, isPacked: false },
    { id: 'book', category: '娯楽', name: '本・雑誌', isRequired: false, isPacked: false },
    { id: 'snacks', category: '食品', name: 'おやつ', isRequired: false, isPacked: false },
    { id: 'water', category: '食品', name: '水', isRequired: false, isPacked: false }
  ];

  if (travelType === 'international') {
    // 海外旅行特有のアイテム
    baseItems.push(
      { id: 'visa', category: '重要書類', name: 'ビザ', isRequired: false, isPacked: false },
      { id: 'insurance', category: '重要書類', name: '旅行保険証書', isRequired: false, isPacked: false },
      { id: 'adapter', category: '電子機器', name: '変換プラグ', isRequired: true, isPacked: false },
      { id: 'powerbank', category: '電子機器', name: 'モバイルバッテリー', isRequired: true, isPacked: false },
      { id: 'sunscreen', category: '衛生用品', name: '日焼け止め', isRequired: false, isPacked: false },
      { id: 'sunglasses', category: 'アクセサリー', name: 'サングラス', isRequired: false, isPacked: false },
      { id: 'hat', category: 'アクセサリー', name: '帽子', isRequired: false, isPacked: false },
      { id: 'umbrella', category: 'アクセサリー', name: '傘', isRequired: false, isPacked: false },
      { id: 'guidebook', category: '娯楽', name: 'ガイドブック', isRequired: false, isPacked: false },
      { id: 'phrasebook', category: '娯楽', name: '会話集', isRequired: false, isPacked: false }
    );
  } else {
    // 国内旅行特有のアイテム
    baseItems.push(
      { id: 'iccard', category: '重要書類', name: 'ICカード（Suica/PASMO）', isRequired: true, isPacked: false },
      { id: 'hotspring', category: '衛生用品', name: '温泉セット', isRequired: false, isPacked: false },
      { id: 'raincoat', category: 'アクセサリー', name: 'レインコート', isRequired: false, isPacked: false },
      { id: 'map', category: '娯楽', name: '地図', isRequired: false, isPacked: false }
    );
  }

  // 日数に応じてアイテムを追加
  if (days > 3) {
    baseItems.push(
      { id: 'laundry', category: '衛生用品', name: '洗濯用品', isRequired: false, isPacked: false },
      { id: 'extra_clothes', category: '衣類', name: '予備の着替え', isRequired: false, isPacked: false }
    );
  }

  return baseItems;
};

/**
 * 旅行テンプレートを一括生成
 */
export const generateTravelTemplates = (
  memberCount: number,
  startDate: string,
  endDate: string,
  totalBudget: number,
  travelType: 'domestic' | 'international'
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    roomAssignments: generateRoomAssignments(memberCount),
    schedule: generateScheduleTemplate(startDate, endDate),
    budgetBreakdown: estimateBudgetBreakdown(totalBudget, travelType),
    packingList: generatePackingList(travelType, days)
  };
}; 

/**
 * ダミーの観光スポットデータ
 */
export const generateDummyPlaces = () => [
  { id: 'place-1', name: '観光地A', category: '観光', description: '有名な観光地', address: '', rating: 4.0, image: '', openingHours: '', priceRange: '', isFavorite: false },
  { id: 'place-2', name: '観光地B', category: '観光', description: '人気の観光地', address: '', rating: 4.0, image: '', openingHours: '', priceRange: '', isFavorite: false },
  { id: 'place-3', name: 'レストラン', category: 'グルメ', description: '地元の料理が楽しめる', address: '', rating: 4.0, image: '', openingHours: '', priceRange: '', isFavorite: false },
  { id: 'place-4', name: 'ホテル', category: '宿泊', description: '快適なホテル', address: '', rating: 4.0, image: '', openingHours: '', priceRange: '', isFavorite: false }
];

/**
 * ダミーの部屋割りデータ
 */
export const generateDummyRooms = (memberCount: number) => {
  if (memberCount <= 2) {
    return [
      {
        id: 'room-1',
        roomName: 'メインルーム',
        members: Array.from({ length: memberCount }, (_, i) => `メンバー${i + 1}`)
      }
    ];
  } else if (memberCount <= 4) {
    const half = Math.ceil(memberCount / 2);
    return [
      {
        id: 'room-1',
        roomName: 'ルームA',
        members: Array.from({ length: half }, (_, i) => `メンバー${i + 1}`)
      },
      {
        id: 'room-2',
        roomName: 'ルームB',
        members: Array.from({ length: memberCount - half }, (_, i) => `メンバー${half + i + 1}`)
      }
    ];
  } else {
    const roomsCount = Math.ceil(memberCount / 2);
    const rooms = [];
    for (let i = 0; i < roomsCount; i++) {
      const startMember = i * 2 + 1;
      const endMember = Math.min(startMember + 1, memberCount);
      rooms.push({
        id: `room-${i + 1}`,
        roomName: `ルーム${String.fromCharCode(65 + i)}`,
        members: Array.from({ length: endMember - startMember + 1 }, (_, j) => `メンバー${startMember + j}`)
      });
    }
    return rooms;
  }
}; 