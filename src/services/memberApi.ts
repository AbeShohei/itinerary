import { supabase } from './supabase';

export interface Member {
  id: string;
  travel_id: string;
  name: string;
  gender: 'male' | 'female';
  preferences: string[];
  created_at?: string;
}

export const memberApi = {
  // メンバー一覧取得
  async getMembers(travelId: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('member')
      .select('*')
      .eq('travel_id', travelId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // メンバー追加
  async createMember(member: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
    const { data, error } = await supabase
      .from('member')
      .insert([member])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // メンバー更新
  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    const { data, error } = await supabase
      .from('member')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // メンバー削除
  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('member')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // 指定メールアドレスで参加している全旅行のmemberレコードを取得
  async getMembersByEmail(email: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('member')
      .select('*')
      .eq('name', email); // nameにメールアドレスを格納しているため
    if (error) throw error;
    return data || [];
  },
}; 