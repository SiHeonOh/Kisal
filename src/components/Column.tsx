import { useState, DragEvent, KeyboardEvent } from 'react';
import { useAppStore } from '../store';
import { KanbanCard } from './KanbanCard';
import type { ColumnId, KanbanCard as CardType } from '../types';
import './Column.css';

interface Props {
  columnId: ColumnId;
  label: string;
  index: number;
  cards: CardType[];
}

export function Column({ columnId, label, index, cards }: Props) {
  const { actions } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleAddKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newTitle.trim()) {
      actions.addCard(columnId, newTitle.trim());
      setNewTitle('');
      setAdding(false);
    } else if (e.key === 'Escape') {
      setNewTitle('');
      setAdding(false);
    }
  }

  function handleDragStart(e: DragEvent, cardId: string) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumn', columnId);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;
    const targetOrder = cards.length;
    actions.moveCard(cardId, columnId, targetOrder);
  }

  return (
    <div
      className={`column ${dragOver ? 'column--drag-over' : ''}`}
      data-col={columnId}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <span className="column-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="column-label" role="heading" aria-level={2}>{label}</span>
        <span className="column-count">{cards.length}</span>
      </div>
      <div className="column-cards" role="list" aria-label={label}>
        {cards.map(card => (
          <KanbanCard key={card.id} card={card} onDragStart={handleDragStart} />
        ))}
        {dragOver && cards.length === 0 && (
          <div className="column-drop-hint">Drop here</div>
        )}
      </div>
      <div className="column-footer">
        {adding ? (
          <div className="column-add-form">
            <input
              autoFocus
              className="column-add-input"
              placeholder="Card title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={handleAddKeyDown}
              onBlur={() => { setAdding(false); setNewTitle(''); }}
              maxLength={200}
            />
          </div>
        ) : (
          <button className="column-add-btn" onClick={() => setAdding(true)}>
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
