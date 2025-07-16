import { supabase } from './supabase';

export interface PackingItem {
  id?: string;
  travel_id: string;
  name: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  is_essential: boolean;
  created_at?: string;
  updated_at?: string;
}

export const packingApi = {
  // 持ち物リスト取得
  async getPackingItems(travelId: string): Promise<PackingItem[]> {
    const { data, error } = await supabase
      .from('packing_item')
      .select('*')
      .eq('travel_id', travelId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // 持ち物追加
  async createPackingItem(item: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>): Promise<PackingItem> {
    const { data, error } = await supabase
      .from('packing_item')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 持ち物更新
  async updatePackingItem(id: string, updates: Partial<PackingItem>): Promise<PackingItem> {
    const { data, error } = await supabase
      .from('packing_item')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 持ち物削除
  async deletePackingItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('packing_item')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}; 