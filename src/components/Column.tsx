import { useState, Fragment, DragEvent, KeyboardEvent } from 'react';
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
  const [adding,    setAdding   ] = useState(false);
  const [newTitle,  setNewTitle ] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [insertIdx,  setInsertIdx ] = useState<number | null>(null);

  /* ── keyboard handler for the new-card input ──────────────── */
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

  /* ── drag helpers ─────────────────────────────────────────── */
  function handleDragStart(e: DragEvent, cardId: string) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumn', columnId);
  }

  // Only fires when the pointer truly leaves the column element
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setInsertIdx(null);
    }
  }

  // Column-wide dragOver — keeps the column highlighted and defaults to append
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    // Don't overwrite insertIdx if a slot already set it
  }

  // Individual slot dragOver — sets the precise insertion point
  function handleSlotDragOver(e: DragEvent, slotIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    setInsertIdx(slotIndex);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    setIsDragOver(false);
    if (!cardId) { setInsertIdx(null); return; }
    // Use the slot-set index if available; otherwise append to end
    const targetOrder = insertIdx !== null ? insertIdx : cards.length;
    setInsertIdx(null);
    actions.moveCard(cardId, columnId, targetOrder);
  }

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div
      className={`column${isDragOver ? ' column--drag-over' : ''}`}
      data-col={columnId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <span className="column-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="column-label" role="heading" aria-level={2}>{label}</span>
        <span className="column-count">{cards.length}</span>
      </div>

      <div className="column-cards" role="list" aria-label={label}>
        {cards.length === 0 ? (
          /* Empty column — full-height drop target */
          <div className={`column-empty-drop${isDragOver ? ' column-empty-drop--active' : ''}`}>
            DROP HERE
          </div>
        ) : (
          <>
            {/* Slot before the first card */}
            <div
              className={`column-drop-slot${isDragOver && insertIdx === 0 ? ' column-drop-slot--active' : ''}`}
              onDragOver={e => handleSlotDragOver(e, 0)}
            />

            {cards.map((card, i) => (
              <Fragment key={card.id}>
                <KanbanCard card={card} onDragStart={handleDragStart} />

                {/* Slot after each card */}
                <div
                  className={`column-drop-slot${isDragOver && insertIdx === i + 1 ? ' column-drop-slot--active' : ''}`}
                  onDragOver={e => handleSlotDragOver(e, i + 1)}
                />
              </Fragment>
            ))}
          </>
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
