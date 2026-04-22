import { supabase } from './supabase';
import type { KanbanCard, ColumnId } from './types';

export async function fetchCards(sheetId: string): Promise<KanbanCard[]> {
  const { data, error } = await supabase
    .from('kisal_cards')
    .select('*')
    .eq('sheet_id', sheetId)
    .order('card_order', { ascending: true });
  if (error) throw error;
  return (data as KanbanCard[]).map(c => ({ ...c, tags: c.tags ?? [] }));
}

export async function createCard(
  userId: string,
  sheetId: string,
  columnId: ColumnId,
  title: string,
  order: number,
): Promise<KanbanCard> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('kisal_cards')
    .insert({
      user_id: userId,
      sheet_id: sheetId,
      column_id: columnId,
      title,
      notes: '',
      tags: [],
      card_order: order,
      created_at: now,
      updated_at: now,
      danna_item_id: null,
    })
    .select()
    .single();
  if (error) throw error;
  const c = data as KanbanCard;
  return { ...c, tags: c.tags ?? [] };
}

export async function updateCard(id: string, patch: Partial<KanbanCard>): Promise<void> {
  const { error } = await supabase
    .from('kisal_cards')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function moveCard(
  id: string,
  columnId: ColumnId,
  cardOrder: number,
): Promise<void> {
  await updateCard(id, { column_id: columnId, card_order: cardOrder });
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('kisal_cards').delete().eq('id', id);
  if (error) throw error;
}
