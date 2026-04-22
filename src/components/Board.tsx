import { useAppStore } from '../store';
import { COLUMNS } from '../types';
import type { ColumnId } from '../types';
import { Column } from './Column';
import { CardDetailPanel } from './CardDetailPanel';
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle';
import { TagFilterBar } from './TagFilterBar';
import './Board.css';

export function Board() {
  const { state } = useAppStore();

  if (!state.activeSheetId) {
    return (
      <div className="board-empty">
        <p>No sheet selected. Create one above.</p>
      </div>
    );
  }

  const selectedCard = state.selectedCardId
    ? state.cards.find(c => c.id === state.selectedCardId) ?? null
    : null;

  const filteredCards = state.activeTagFilters.length > 0
    ? state.cards.filter(c => state.activeTagFilters.some(t => c.tags.includes(t)))
    : state.cards;

  return (
    <div className="board-root">
      <TagFilterBar />
      <div className="board-toolbar">
        <ColumnVisibilityToggle />
      </div>
      <div className="board-scroll-area">
        <div className="board-columns">
          {COLUMNS.filter(col => state.visibleColumns.has(col.id as ColumnId)).map((col, idx) => {
            const colCards = filteredCards
              .filter(c => c.column_id === col.id)
              .sort((a, b) => a.card_order - b.card_order);
            return (
              <Column
                key={col.id}
                columnId={col.id as ColumnId}
                label={col.label}
                index={idx}
                cards={colCards}
              />
            );
          })}
        </div>
        {selectedCard && <CardDetailPanel card={selectedCard} />}
      </div>
      {state.loading && (
        <div className="board-loading" aria-live="polite">LOADING</div>
      )}
    </div>
  );
}
