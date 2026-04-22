export type ColumnId = 'backlog' | 'started' | 'in_progress' | 'done' | 'persistent';

export const COLUMNS: { id: ColumnId; label: string; description: string }[] = [
  { id: 'backlog',     label: 'Backlog',      description: 'Unstarted work, queued ideas' },
  { id: 'started',    label: 'Started',       description: 'Initiated but not actively progressing' },
  { id: 'in_progress',label: 'In Progress',   description: 'Currently active' },
  { id: 'done',       label: 'Done',          description: 'Completed items' },
  { id: 'persistent', label: 'Persistent',    description: 'Standing tasks, recurring items' },
];

export interface Sheet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source: string | null;
  source_app: string | null;
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface KanbanCard {
  id: string;
  user_id: string;
  sheet_id: string;
  title: string;
  notes: string | null;
  tags: string[];
  column_id: ColumnId;
  card_order: number;
  created_at: string;
  updated_at: string;
  danna_item_id: string | null;
}
