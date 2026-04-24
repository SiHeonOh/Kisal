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

      {/* ── Decorative non-functional elements ──────────────── */}
      <div className="board-watermark" aria-hidden="true">KISAL</div>
      <div className="board-radar"     aria-hidden="true" />
      <div className="board-reticle board-reticle--tl" aria-hidden="true">+</div>
      <div className="board-reticle board-reticle--tr" aria-hidden="true">+</div>
      <div className="board-reticle board-reticle--bl" aria-hidden="true">+</div>
      <div className="board-reticle board-reticle--br" aria-hidden="true">+</div>

      <div className="board-bg" aria-hidden="true">
        {/* Horizontal text strips */}
        <div className="board-bg-htext board-bg-htext--1">
          KAIZEN · 改善 · CONTINUOUS·IMPROVEMENT · PROJECT:02 · UNIT:001 · SYS://V4.1 · Δ · PROTOCOL:IV · 終わりのない改善 · ◆ · KAIZEN · 改善 · CONTINUOUS·IMPROVEMENT · PROJECT:02
        </div>
        <div className="board-bg-htext board-bg-htext--2">
          001 · 002 · 003 · 004 · 005 · ◉ · AUTHORIZED · ACCESS · INDUSTRIAL·SYSTEM · ▸ · REF:A1 · NODE:07 · SYNC · 改善システム · 001 · 002 · 003
        </div>
        <div className="board-bg-htext board-bg-htext--3">
          KAIZEN·ENGINE · V4.1 · 改善 · UNIT:001 · ◆ · LOOP:ACTIVE · PROJECT:02 · 終わりのない · SYS · PROTOCOL · 改善 · KAIZEN·ENGINE · V4.1
        </div>

        {/* Vertical text strips */}
        <div className="board-bg-vtext board-bg-vtext--l">改善システム · KAIZEN·ENGINE · PROJECT:02 · UNIT:001 · CONTINUOUS·IMPROVEMENT</div>
        <div className="board-bg-vtext board-bg-vtext--r">終わりのない改善 · INDUSTRIAL·PROTOCOL · V4.1 · SYS://AUTH · AUTHORIZED·ACCESS</div>

        {/* Barcodes */}
        <div className="board-bg-barcode board-bg-barcode--h1" />
        <div className="board-bg-barcode board-bg-barcode--h2" />
        <div className="board-bg-barcode board-bg-barcode--v1" />
        <div className="board-bg-barcode board-bg-barcode--v2" />

        {/* Geometric shapes */}
        <div className="board-bg-circle board-bg-circle--lg" />
        <div className="board-bg-circle board-bg-circle--sm" />
        <div className="board-bg-cross board-bg-cross--1" />
        <div className="board-bg-cross board-bg-cross--2" />
        <div className="board-bg-bracket board-bg-bracket--tl" />
        <div className="board-bg-bracket board-bg-bracket--br" />
        <div className="board-bg-diag board-bg-diag--1" />
        <div className="board-bg-diag board-bg-diag--2" />

        {/* Large display numbers */}
        <div className="board-bg-numeral board-bg-numeral--1">02</div>
        <div className="board-bg-numeral board-bg-numeral--2">∞</div>
        <div className="board-bg-numeral board-bg-numeral--3">改</div>
      </div>

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
