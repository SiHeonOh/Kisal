import { useState } from 'react';
import { useAppStore } from '../store';
import { COLUMNS } from '../types';
import type { ColumnId } from '../types';
import './ColumnVisibilityToggle.css';

export function ColumnVisibilityToggle() {
  const { state, dispatch } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="col-toggle-wrap">
      <button
        className="col-toggle-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Columns ({state.visibleColumns.size}/{COLUMNS.length})
      </button>
      {open && (
        <div className="col-toggle-popover" role="menu">
          {COLUMNS.map(col => {
            const visible = state.visibleColumns.has(col.id as ColumnId);
            return (
              <label key={col.id} className="col-toggle-item">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => dispatch({ type: 'TOGGLE_COLUMN', payload: col.id as ColumnId })}
                />
                <span>{col.label}</span>
              </label>
            );
          })}
        </div>
      )}
      {open && <div className="col-toggle-backdrop" onClick={() => setOpen(false)} />}
    </div>
  );
}
