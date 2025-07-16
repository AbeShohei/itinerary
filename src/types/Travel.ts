export interface Travel {
  id?: string;
  title: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  startDate?: string; // フロントエンド用の互換性
  endDate?: string; // フロントエンド用の互換性
  duration?: string;
  dates?: string;
  description?: string;
  image?: string;
  status: 'planning' | 'confirmed' | 'completed';
  member_count?: number;
  memberCount?: number;
  budget: number;
  interests?: string[];
  travel_style?: string;
  travelStyle?: string;
  schedule?: any;
  places?: any;
  budgetBreakdown?: any;
  created_at?: string;
  updated_at?: string;
  travelType?: 'domestic' | 'international';
}

export interface TravelFormData {
  title: string;
  departure: string; // 出発地
  arrival: string;   // 到着地
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  travelType: 'domestic' | 'international'; // 国内/海外旅行
  description: string;
  transportation: string; // 記入式
  theme: string; // 記入式
}