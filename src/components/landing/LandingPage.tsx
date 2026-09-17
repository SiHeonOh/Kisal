import { Link } from 'react-router-dom';
import { DemoBoard } from './DemoBoard';
import './landing.css';

/* Feature datasheet: key → value → detail, like the status bar */
const SPEC = [
  { key: 'COLUMNS', value: '5',         detail: 'Backlog, Started, In progress, Done, and Persistent for the work that never closes.' },
  { key: 'SHEETS',  value: 'MANY',      detail: 'One board per project, switched with tabs. Each keeps its own cards and tags.' },
  { key: 'TAGS',    value: 'GLOBAL',    detail: 'Create a tag once from the filter bar, put it on any card, filter by any combination.' },
  { key: 'DRAG',    value: 'NATIVE',    detail: 'Cards move between columns with plain HTML5 drag and drop. No library, no lag.' },
  { key: 'EXPORT',  value: 'DANNA',     detail: 'One click sends a card to the DANNA planner inbox and marks it on the board.' },
  { key: 'SYNC',    value: 'SUPABASE',  detail: 'Every card is stored per user behind row-level security. Sign in anywhere and it is there.' },
  { key: 'INSTALL', value: 'PWA',       detail: 'Add it to your dock or home screen. An offline page covers you when the network drops.' },
  { key: 'THEMES',  value: '2',         detail: 'Lime on black, or black on lime. Switched from the header, remembered on this device.' },
];

const TICKER = [
  'KISAL', 'TASK BOARD', '改善', 'FIVE COLUMNS', 'DANNA LINKED', 'CLOUD SYNC',
  'INSTALLABLE', 'GLOBAL TAGS', '終わりのない改善', 'NODE: KSL-01', 'STATUS: OPEN',
].map(s => `// ${s} `).join('');

export function LandingPage() {
  return (
    <div className="ld-root">

      {/* ── Meta bar ─────────────────────────────────────── */}
      <header className="ld-top">
        <div className="ld-top-meta" aria-hidden="true">
          <span>SYS://LANDING</span>
          <span>PROJECT:02</span>
          <span>KISAL-OS V4.1</span>
        </div>
        <nav className="ld-top-nav" aria-label="Account">
          <Link className="ld-navlink" to="/login">Sign in</Link>
          <Link className="ld-navlink ld-navlink--fill" to="/signup">Create account</Link>
        </nav>
      </header>

      <div className="ld-ticker" aria-hidden="true">
        <span className="ld-ticker-label">SYS</span>
        <div className="ld-ticker-track">
          <span className="ld-ticker-content">{TICKER}{TICKER}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ld-hero" aria-labelledby="ld-hero-title">
        <div className="ld-geo" aria-hidden="true">
          <span className="ld-corner ld-corner--tl" />
          <span className="ld-corner ld-corner--tr" />
          <span className="ld-corner ld-corner--bl" />
          <span className="ld-corner ld-corner--br" />
          <span className="ld-tickrow" />
          <span className="ld-barcode" />
        </div>

        <div className="ld-hero-type" aria-hidden="true">
          <div className="ld-hero-line1">
            <span className="ld-hero-en">KISAL</span>
            <span className="ld-hero-ja">改善</span>
          </div>
          <div className="ld-hero-line2">終わりのない改善</div>
        </div>

        <div className="ld-hero-card">
          <div className="ld-eyebrow">
            <span>UNIT-001</span><span>◆</span><span>TASK BOARD</span>
          </div>
          <h1 id="ld-hero-title" className="ld-hero-title">
            A kanban board built on kaizen.
          </h1>
          <p className="ld-hero-lede">
            Five columns, as many sheets as you have projects, and a direct line to the DANNA planner.
            Nothing on the board is ever finished. It only gets better.
          </p>
          <div className="ld-cta-row">
            <Link className="ld-btn ld-btn--fill" to="/signup">Create account ▸</Link>
            <Link className="ld-btn" to="/login">Sign in</Link>
          </div>
        </div>
      </section>

      {/* ── Live board (light theme flip) ───────────────── */}
      <section className="ld-live" aria-labelledby="ld-live-title">
        <div className="ld-live-head">
          <h2 id="ld-live-title" className="ld-section-title">// LIVE</h2>
          <p className="ld-live-note">
            The features are the cards. Watch them move. On your board, you drag them.
          </p>
        </div>
        <DemoBoard />
      </section>

      {/* ── Spec sheet ───────────────────────────────────── */}
      <section className="ld-spec" aria-labelledby="ld-spec-title">
        <div className="ld-spec-head">
          <h2 id="ld-spec-title" className="ld-section-title">// SPEC SHEET</h2>
          <span className="ld-spec-ref" aria-hidden="true">REF:KSL-01 // REV 0.9.1</span>
        </div>
        <dl className="ld-spec-list">
          {SPEC.map(row => (
            <div className="ld-spec-row" key={row.key}>
              <dt className="ld-spec-key">{row.key}</dt>
              <dd className="ld-spec-value">{row.value}</dd>
              <dd className="ld-spec-detail">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Access ───────────────────────────────────────── */}
      <section className="ld-access" aria-labelledby="ld-access-title">
        <div className="ld-access-inner">
          <div className="ld-eyebrow ld-eyebrow--dark">
            <span>SYS://AUTH.MODULE</span><span>◆</span><span>OPEN</span>
          </div>
          <h2 id="ld-access-title" className="ld-access-title">Start a board.</h2>
          <p className="ld-access-lede">
            Email and password. Your cards are stored under your own account and nobody else can read them.
          </p>
          <div className="ld-cta-row">
            <Link className="ld-btn ld-btn--dark" to="/signup">Create account ▸</Link>
            <Link className="ld-btn ld-btn--dark-outline" to="/login">Sign in</Link>
          </div>
        </div>
        <span className="ld-access-ja" aria-hidden="true">改善</span>
      </section>

      <footer className="ld-footer">
        <span>終わりなき改善</span>
        <span className="ld-footer-dot">◆</span>
        <span>CONTINUOUS IMPROVEMENT</span>
        <span className="ld-footer-dot">◆</span>
        <span>改善システム</span>
      </footer>
    </div>
  );
}
