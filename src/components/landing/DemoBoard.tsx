import { useEffect, useState } from 'react';
import { COLUMNS } from '../../types';
import type { ColumnId } from '../../types';

/* ── The feature list, expressed as cards on the board ────── */
interface DemoCard {
  id: string;
  title: string;
  tag: string;
  col: ColumnId;
  danna?: boolean;
}

const FLOW: ColumnId[] = ['backlog', 'started', 'in_progress', 'done'];

const INITIAL: DemoCard[] = [
  { id: 'c1', title: 'Drag cards across five columns',   tag: 'BOARD',  col: 'in_progress' },
  { id: 'c2', title: 'Split work into separate sheets',  tag: 'SHEETS', col: 'backlog' },
  { id: 'c3', title: 'Tag once, filter everywhere',      tag: 'TAGS',   col: 'started' },
  { id: 'c4', title: 'Send a card to DANNA',             tag: 'DANNA',  col: 'done', danna: true },
  { id: 'c5', title: 'Pick up from any device',          tag: 'CLOUD',  col: 'backlog' },
  { id: 'c6', title: 'Install it like an app',           tag: 'PWA',    col: 'started' },
  { id: 'c7', title: 'Open notes in the detail panel',   tag: 'NOTES',  col: 'backlog' },
  { id: 'c8', title: 'Flip to the lime theme',           tag: 'THEME',  col: 'done' },
  { id: 'p1', title: 'Review the backlog every week',    tag: 'KAIZEN', col: 'persistent' },
  { id: 'p2', title: 'Improve one small thing',          tag: 'KAIZEN', col: 'persistent' },
];

const TODAY = new Date();
const DATE_LABEL = `${TODAY.getMonth() + 1}月${TODAY.getDate()}日`;

function advance(cards: DemoCard[]): DemoCard[] {
  const movable = cards.filter(c => c.col !== 'persistent');
  const pick = movable[Math.floor(Math.random() * movable.length)];
  const idx = FLOW.indexOf(pick.col);
  /* Done → back to Backlog: the loop never ends */
  const next: ColumnId = idx >= FLOW.length - 1 ? 'backlog' : FLOW[idx + 1];
  const moved = { ...pick, col: next };
  /* Move the card to the bottom of its new column */
  return [...cards.filter(c => c.id !== pick.id), moved];
}

export function DemoBoard() {
  const [cards, setCards] = useState<DemoCard[]>(INITIAL);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setCards(advance);
      setMoves(m => m + 1);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ld-board" aria-label="Demonstration board">
      <div className="ld-board-columns">
        {COLUMNS.map((col, i) => {
          const inCol = cards.filter(c => c.col === col.id);
          return (
            <section className="ld-col" data-col={col.id} key={col.id} aria-label={col.label}>
              <header className="ld-col-head">
                <span className="ld-col-num">{i + 1}</span>
                <span className="ld-col-label">{col.label}</span>
                <span className="ld-col-count">{inCol.length}</span>
              </header>
              <div className="ld-col-body">
                {inCol.map(card => (
                  <article className="ld-card" key={`${card.id}-${card.col}`}>
                    <span className="ld-card-grip" aria-hidden="true">⠿</span>
                    <div className="ld-card-body">
                      <p className="ld-card-title">{card.title}</p>
                      <div className="ld-card-meta">
                        <span className="ld-card-tag">{card.tag}</span>
                        <span>{DATE_LABEL}</span>
                        {card.danna && <span className="ld-card-danna">DANNA</span>}
                      </div>
                    </div>
                  </article>
                ))}
                {inCol.length === 0 && <p className="ld-col-empty">Drop a card here</p>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="ld-board-foot" aria-live="polite">
        <span className="ld-board-dot" /> MOVES: {String(moves).padStart(3, '0')} // CARDS: {cards.length} // LOOP: ENDLESS
      </p>
    </div>
  );
}
