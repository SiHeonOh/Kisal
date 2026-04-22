import { supabase } from './supabase';
import type { Sheet } from './types';

export async function fetchSheets(userId: string): Promise<Sheet[]> {
  const { data, error } = await supabase
    .from('sheets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Sheet[];
}

export async function createSheet(userId: string, title: string): Promise<Sheet> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('sheets')
    .insert({ user_id: userId, title, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) throw error;
  return data as Sheet;
}

export async function updateSheetTitle(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('sheets')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSheet(id: string): Promise<void> {
  const { error } = await supabase.from('sheets').delete().eq('id', id);
  if (error) throw error;
}
