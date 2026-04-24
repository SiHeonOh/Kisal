import { useState, KeyboardEvent } from 'react';
import { useAppStore } from '../store';
import './TagFilterBar.css';

export function TagFilterBar() {
  const { state, dispatch, actions } = useAppStore();
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState('');

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newTag.trim()) {
      actions.addGlobalTag(newTag.trim());
      setNewTag('');
      setCreating(false);
    } else if (e.key === 'Escape') {
      setNewTag('');
      setCreating(false);
    }
  }

  const hasFilters = state.activeTagFilters.length > 0;

  return (
    <div className="tag-filter-bar">
      <div className="tag-filter-left">
        {creating ? (
          <input
            className="tag-filter-input"
            autoFocus
            placeholder="tag name…"
            value={newTag}
            onChange={e => setNewTag(e.target.value.toLowerCase())}
            onKeyDown={handleKeyDown}
            onBlur={() => { setCreating(false); setNewTag(''); }}
            maxLength={30}
          />
        ) : (
          <button
            className="tag-filter-create-btn"
            onClick={() => setCreating(true)}
            title="Create new tag"
          >
            <span className="tag-filter-create-icon">+</span>
            TAG
          </button>
        )}

        <div className="tag-filter-divider" />

        <div className="tag-filter-chips" role="group" aria-label="Tag filters">
          {state.globalTags.length === 0 && (
            <span className="tag-filter-empty">no tags yet</span>
          )}
          {state.globalTags.map((tag, i) => {
            const active = state.activeTagFilters.includes(tag);
            return (
              <span key={tag} className="tag-filter-chip-wrap">
                <button
                  className={`tag-filter-chip tag-filter-chip--${(i % 3) + 1} ${active ? 'tag-filter-chip--active' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_TAG_FILTER', payload: tag })}
                  aria-pressed={active}
                >
                  {tag}
                </button>
                <button
                  className={`tag-filter-chip-delete tag-filter-chip-delete--${(i % 3) + 1}`}
                  onClick={() => actions.deleteGlobalTag(tag)}
                  title={`Delete tag "${tag}"`}
                  aria-label={`Delete tag ${tag}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="tag-filter-right">
        {hasFilters && (
          <>
            <span className="tag-filter-status">
              FILTERED: {state.activeTagFilters.length}
            </span>
            <button
              className="tag-filter-clear-btn"
              onClick={() => dispatch({ type: 'CLEAR_TAG_FILTERS' })}
            >
              CLEAR
            </button>
          </>
        )}
      </div>
    </div>
  );
}
