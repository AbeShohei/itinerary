import { supabase } from './supabase'

export interface Travel {
  id?: string
  title: string
  destination: string
  start_date?: string
  end_date?: string
  duration: string
  dates: string
  description?: string
  image?: string
  status: 'planning' | 'confirmed' | 'completed'
  member_count: number
  budget: number
  interests?: string[]
  travel_style?: string
  travelType?: 'domestic' | 'international'
  travel_type?: 'domestic' | 'international'
  created_at?: string
  updated_at?: string
}

export interface Schedule {
  id?: string
  travel_id: string
  date: string
  day?: string
  items?: any[]
  created_at?: string
  updated_at?: string
}

export interface Place {
  id?: string
  travel_id: string
  schedule_id?: string
  name: string
  category?: string
  rating?: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Budget {
  id?: string
  travel_id: string
  schedule_id?: string
  amount: number
  breakdown?: any
  created_at?: string
  updated_at?: string
}

export interface RoomAssignment {
  id?: string
  travel_id: string
  schedule_id?: string
  room_name: string
  members?: string[]
  created_at?: string
  updated_at?: string
}

// Travel API
export const travelApi = {
  // 旅行一覧取得
  async getTravels(): Promise<Travel[]> {
    const { data, error } = await supabase
      .from('travel')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map((t: any) => ({
      ...t,
      travelType: t.travel_type || 'domestic',
    }))
  },

  // 特定の旅行取得
  async getTravel(id: string): Promise<Travel> {
    const { data, error } = await supabase
      .from('travel')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...data,
      travelType: data.travel_type || 'domestic',
    }
  },

  // 旅行作成
  async createTravel(travel: Omit<Travel, 'id' | 'created_at' | 'updated_at'>): Promise<Travel> {
    // 日付からdurationを計算
    const startDate = new Date(travel.start_date || travel.startDate || '');
    const endDate = new Date(travel.end_date || travel.endDate || '');
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const days = nights + 1;
    
    const travelData = {
      title: travel.title,
      destination: travel.destination,
      start_date: travel.start_date || travel.startDate,
      end_date: travel.end_date || travel.endDate,
      duration: `${nights}泊${days}日`,
      dates: `${travel.start_date || travel.startDate} - ${travel.end_date || travel.endDate}`,
      description: travel.description,
      image: travel.image,
      status: travel.status || 'planning',
      member_count: travel.member_count || travel.memberCount || 2,
      budget: travel.budget || 0,
      interests: travel.interests || [],
      travel_style: travel.travel_style || travel.travelStyle,
      schedule: travel.schedule || [],
      places: travel.places || [],
      budget_breakdown: travel.budgetBreakdown || {},
      travel_type: travel.travelType || travel.travel_type || 'domestic',
      user_id: travel.user_id, // ← 追加
    }

    const { data, error } = await supabase
      .from('travel')
      .insert([travelData])
      .select()
      .single()

    if (error) throw error
    return {
      ...data,
      travelType: data.travel_type || 'domestic',
    }
  },

  // 旅行更新
  async updateTravel(id: string, updates: Partial<Travel>): Promise<Travel> {
    // 日付が更新された場合、durationも再計算
    if (updates.start_date || updates.end_date || updates.startDate || updates.endDate) {
      const startDate = new Date(updates.start_date || updates.startDate || '');
      const endDate = new Date(updates.end_date || updates.endDate || '');
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      
      updates.duration = `${nights}泊${days}日`;
      updates.dates = `${updates.start_date || updates.startDate} - ${updates.end_date || updates.endDate}`;
    }

    const { data, error } = await supabase
      .from('travel')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 旅行削除
  async deleteTravel(id: string): Promise<void> {
    const { error } = await supabase
      .from('travel')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // AIプラン生成
  async generatePlan(planData: {
    destination: string;
    startDate: string;
    endDate: string;
    memberCount: number;
    budget: number;
    interests: string[];
    travelStyle: string;
    travelType: 'domestic' | 'international';
  }): Promise<any> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-app/api/travels/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(planData)
      })

      if (!response.ok) {
        // 500エラーの場合はダミーデータを返す
        if (response.status === 500) {
          console.warn('AI API エラー、ダミーデータを返します');
          // return this.generateDummyPlan(planData);
          throw new Error(`AIプラン生成に失敗しました: ${response.status}`);
        }
        throw new Error(`AIプラン生成に失敗しました: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AI生成エラー:', error);
      // エラー時はダミーデータを返す
      // return this.generateDummyPlan(planData);
      throw error;
    }
  },

  // ダミープラン生成（AI APIが利用できない場合）
  /*
  generateDummyPlan(planData: any): any {
    const { destination, startDate, endDate, memberCount, budget, interests, travelStyle, travelType } = planData;
    
    return {
      success: true,
      data: {
        title: `${destination}旅行`,
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        memberCount: memberCount,
        budget: budget,
        duration: `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}泊${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}日`,
        schedule: [
          {
            date: startDate,
            day: '1日目',
            items: [
              {
                time: '09:00',
                title: '到着・チェックイン',
                category: 'accommodation',
                description: 'ホテルにチェックイン'
              },
              {
                time: '12:00',
                title: '昼食',
                category: 'food',
                description: '地元のレストランで昼食'
              },
              {
                time: '14:00',
                title: '観光スポット1',
                category: 'sightseeing',
                description: '主要観光地を訪問'
              }
            ]
          }
        ],
        places: [
          {
            name: '観光スポット1',
            category: 'sightseeing',
            description: '人気の観光スポット',
            address: `${destination}の主要観光地`,
            openingHours: '09:00-17:00',
            priceRange: '¥1000-3000'
          },
          {
            name: 'レストラン1',
            category: 'food',
            description: '地元の美味しい料理',
            address: `${destination}の中心部`,
            openingHours: '11:00-22:00',
            priceRange: '¥2000-5000'
          }
        ],
        roomAssignments: [
          {
            roomName: '部屋1',
            members: [`メンバー1`, `メンバー2`]
          }
        ],
        packingList: [
          { item: 'パスポート', category: 'important' },
          { item: '現金・クレジットカード', category: 'important' },
          { item: '着替え', category: 'clothing' },
          { item: '歯ブラシ', category: 'toiletries' }
        ]
      }
    };
  }
  */
}

// Schedule API
export const scheduleApi = {
  // 旅行のスケジュール一覧取得
  async getSchedules(travelId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('travel_id', travelId)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // スケジュール作成
  async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedule')
      .insert([schedule])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // スケジュール更新
  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedule')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // スケジュール削除
  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Place API
export const placeApi = {
  // 旅行の観光スポット一覧取得
  async getPlaces(travelId: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('place')
      .select('id, travel_id, schedule_id, name, category, main_category, rating, image, description, address, phone, website, opening_hours, price_range, is_favorite, created_at, updated_at')
      .eq('travel_id', travelId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 観光スポット作成
  async createPlace(place: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Promise<Place> {
    const { data, error } = await supabase
      .from('place')
      .insert([place])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 観光スポット更新
  async updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
    const { data, error } = await supabase
      .from('place')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 観光スポット削除
  async deletePlace(id: string): Promise<void> {
    const { error } = await supabase
      .from('place')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Budget API
export const budgetApi = {
  // 旅行の予算一覧取得
  async getBudgets(travelId: string, userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budget')
      .select('*')
      .eq('travel_id', travelId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 予算作成
  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budget')
      .insert([budget])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 予算更新
  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budget')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 予算削除
  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// RoomAssignment API
export const roomAssignmentApi = {
  // 旅行の部屋割り一覧取得
  async getRoomAssignments(travelId: string): Promise<RoomAssignment[]> {
    const { data, error } = await supabase
      .from('room_assignment')
      .select('*')
      .eq('travel_id', travelId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 部屋割り作成
  async createRoomAssignment(roomAssignment: Omit<RoomAssignment, 'id' | 'created_at' | 'updated_at'>): Promise<RoomAssignment> {
    const { data, error } = await supabase
      .from('room_assignment')
      .insert([roomAssignment])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 部屋割り更新
  async updateRoomAssignment(id: string, updates: Partial<RoomAssignment>): Promise<RoomAssignment> {
    const { data, error } = await supabase
      .from('room_assignment')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 部屋割り削除
  async deleteRoomAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('room_assignment')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 