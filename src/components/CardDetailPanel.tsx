import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store';
import { TagInput } from './TagInput';
import { ConfirmModal } from './ConfirmModal';
import type { KanbanCard } from '../types';
import './CardDetailPanel.css';

interface Props {
  card: KanbanCard;
}

export function CardDetailPanel({ card }: Props) {
  const { state, dispatch, actions } = useAppStore();
  const [title,         setTitle        ] = useState(card.title);
  const [notes,         setNotes        ] = useState(card.notes ?? '');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError,   setExportError  ] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(card.title);
    setNotes(card.notes ?? '');
  }, [card.id, card.title, card.notes]);

  const saveCard = useCallback((patch: Partial<KanbanCard>) => {
    actions.updateCard({ ...card, ...patch });
  }, [card, actions]);

  function handleTitleBlur() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== card.title) saveCard({ title: trimmed });
    else setTitle(card.title);
  }

  function handleNotesChange(value: string) {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveCard({ notes: value }), 1000);
  }

  function handleNotesBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (notes !== card.notes) saveCard({ notes });
  }

  function handleTagsChange(tags: string[]) {
    saveCard({ tags });
  }

  async function handleExport() {
    if (!state.session) return;
    setExportLoading(true);
    setExportError('');
    try {
      const { exportToDanna } = await import('../danna/exportService');
      await exportToDanna(card, state.session, saveCard);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }

  const d = new Date(card.created_at);
  const createdDate = `${d.getFullYear()} · ${d.getMonth() + 1}月${d.getDate()}日`;
  const u = new Date(card.updated_at);
  const updatedDate = `${u.getFullYear()} · ${u.getMonth() + 1}月${u.getDate()}日`;

  const colLabel = card.column_id.replace(/_/g, ' ').toUpperCase();
  const shortId  = card.id.replace(/-/g, '').slice(0, 8).toUpperCase();

  return (
    <>
      <aside className="card-panel" data-col={card.column_id} aria-label="Card detail">

        {/* ── Decorative corner brackets ─────────────────────── */}
        <div className="card-panel-bracket card-panel-bracket--tl" aria-hidden="true" />
        <div className="card-panel-bracket card-panel-bracket--br" aria-hidden="true" />

        {/* ── Background watermark ───────────────────────────── */}
        <div className="card-panel-watermark" aria-hidden="true">{colLabel}</div>

        {/* ── Header ────────────────────────────────────────── */}
        <div className="card-panel-header">
          <div className="card-panel-header-left">
            <span className="card-panel-col-badge">{colLabel}</span>
            <span className="card-panel-id">ID · {shortId}</span>
          </div>
          <button
            className="card-panel-close"
            onClick={() => dispatch({ type: 'SELECT_CARD', payload: null })}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="card-panel-body">

          <div className="card-panel-section">
            <label className="card-panel-label" htmlFor="card-title">▸ TITLE</label>
            <input
              id="card-title"
              className="card-panel-title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              maxLength={200}
            />
          </div>

          <div className="card-panel-section">
            <label className="card-panel-label" htmlFor="card-notes">▸ NOTES</label>
            <textarea
              id="card-notes"
              className="card-panel-notes"
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes…"
              rows={6}
            />
          </div>

          <div className="card-panel-section">
            <span className="card-panel-label">▸ TAGS</span>
            <TagInput
              tags={card.tags}
              globalTags={state.globalTags}
              onChange={handleTagsChange}
              selectOnly
            />
          </div>

          <div className="card-panel-section card-panel-section--meta">
            <div className="card-panel-meta"><span>CREATED</span><span>{createdDate}</span></div>
            <div className="card-panel-meta"><span>UPDATED</span><span>{updatedDate}</span></div>
          </div>

        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="card-panel-footer">
          {card.danna_item_id ? (
            <div className="card-panel-danna-sent">✓ SENT TO DANNA</div>
          ) : (
            <button
              className="card-panel-export-btn"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? '// EXPORTING…' : '// EXPORT TO DANNA'}
            </button>
          )}
          {exportError && <div className="card-panel-error">{exportError}</div>}
          <button className="card-panel-delete-btn" onClick={() => setConfirmDelete(true)}>
            DELETE CARD
          </button>
        </div>

      </aside>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Card"
          message={`Delete "${card.title}"? This cannot be undone.`}
          confirmLabel="DELETE"
          danger
          onConfirm={async () => {
            setConfirmDelete(false);
            await actions.deleteCard(card.id);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
