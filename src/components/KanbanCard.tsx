import { DragEvent } from 'react';
import { useAppStore } from '../store';
import { TagChip } from './TagChip';
import type { KanbanCard as CardType } from '../types';
import './KanbanCard.css';

interface Props {
  card: CardType;
  onDragStart: (e: DragEvent, cardId: string) => void;
}

export function KanbanCard({ card, onDragStart }: Props) {
  const { state, dispatch } = useAppStore();
  const isSelected = state.selectedCardId === card.id;

  const d = new Date(card.created_at);
  const createdDate = `${d.getMonth() + 1}月${d.getDate()}日`;

  return (
    <article
      className={`kanban-card ${isSelected ? 'kanban-card--selected' : ''}`}
      role="article"
      aria-label={card.title}
      draggable
      onDragStart={e => onDragStart(e, card.id)}
      onClick={() => dispatch({ type: 'SELECT_CARD', payload: isSelected ? null : card.id })}
    >
      <div className="kanban-card-drag" aria-grabbed={false} aria-label="Drag handle">⠿</div>
      <div className="kanban-card-body">
        <p className="kanban-card-title">{card.title}</p>
        {card.tags.length > 0 && (
          <div className="kanban-card-tags">
            {card.tags.slice(0, 4).map(tag => <TagChip key={tag} tag={tag} />)}
            {card.tags.length > 4 && (
              <span className="kanban-card-more">+{card.tags.length - 4}</span>
            )}
          </div>
        )}
        <div className="kanban-card-meta">
          <span>{createdDate}</span>
          {card.danna_item_id && <span className="kanban-card-danna">DANNA</span>}
        </div>
      </div>
    </article>
  );
}
