import { supabase } from '../supabase';
import type { KanbanCard } from '../types';
import type { Session } from '@supabase/supabase-js';

export async function exportToDanna(
  card: KanbanCard,
  session: Session,
  onSuccess: (patch: Partial<KanbanCard>) => void,
): Promise<void> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('items')
    .insert({
      user_id: session.user.id,
      type: 'task',
      title: card.title,
      description: card.notes ?? '',
      inbox: true,
      source: 'kisal',
      source_app: 'kisal',
      source_id: card.id,
      is_completed: false,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  onSuccess({ danna_item_id: (data as { id: string }).id });
}
