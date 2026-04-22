import { useState, KeyboardEvent } from 'react';
import { useAppStore } from '../store';
import { ConfirmModal } from './ConfirmModal';
import './SheetTabs.css';

export function SheetTabs() {
  const { state, actions } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deletingSheetId, setDeletingSheetId] = useState<string | null>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newTitle.trim()) {
      actions.addSheet(newTitle.trim());
      setNewTitle('');
      setAdding(false);
    } else if (e.key === 'Escape') {
      setNewTitle('');
      setAdding(false);
    }
  }

  const deletingSheet = state.sheets.find(s => s.id === deletingSheetId);

  return (
    <>
      <div className="sheet-tabs" role="tablist" aria-label="Sheets">
        {state.sheets.map(sheet => (
          <button
            key={sheet.id}
            role="tab"
            aria-selected={sheet.id === state.activeSheetId}
            className={`sheet-tab ${sheet.id === state.activeSheetId ? 'sheet-tab--active' : ''}`}
            onClick={() => actions.selectSheet(sheet.id)}
          >
            <span className="sheet-tab-title">{sheet.title}</span>
            {sheet.source_app && (
              <span className="sheet-tab-badge">{sheet.source_app.toUpperCase()}</span>
            )}
            {sheet.id === state.activeSheetId && state.sheets.length > 1 && (
              <span
                className="sheet-tab-delete"
                role="button"
                tabIndex={0}
                aria-label={`Delete sheet ${sheet.title}`}
                onClick={e => { e.stopPropagation(); setDeletingSheetId(sheet.id); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setDeletingSheetId(sheet.id); } }}
              >
                ×
              </span>
            )}
          </button>
        ))}
        {adding ? (
          <input
            className="sheet-tab-input"
            autoFocus
            placeholder="Sheet name…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { setAdding(false); setNewTitle(''); }}
            maxLength={80}
          />
        ) : (
          <button className="sheet-tab sheet-tab--add" onClick={() => setAdding(true)} aria-label="Add sheet">
            + New sheet
          </button>
        )}
      </div>

      {deletingSheet && (
        <ConfirmModal
          title="Delete Sheet"
          message={`Delete "${deletingSheet.title}" and all its cards? This cannot be undone.`}
          confirmLabel="DELETE"
          danger
          onConfirm={async () => {
            await actions.deleteSheet(deletingSheet.id);
            setDeletingSheetId(null);
          }}
          onCancel={() => setDeletingSheetId(null)}
        />
      )}
    </>
  );
}
