import { supabase } from './supabase';

export interface Note {
  id: string;
  travel_id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// 旅行ごとのメモ一覧取得
export async function fetchNotes(travelId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('travel_id', travelId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Note[];
}

// メモ追加
export async function addNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

// メモ更新
export async function updateNote(note: Partial<Note> & { id: string }): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', note.id)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

// メモ削除
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export const notesApi = {
  async getNotes(travelId: string, userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('travel_id', travelId)
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },
  async createNote(note) {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateNote(note) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', note.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}; 