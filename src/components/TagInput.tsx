import { useState, KeyboardEvent, useRef } from 'react';
import { TagChip } from './TagChip';
import './TagInput.css';

interface Props {
  tags: string[];
  globalTags?: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  selectOnly?: boolean; // when true: only allow picking from existing globalTags
}

export function TagInput({ tags, globalTags = [], onChange, maxTags = 10, selectOnly = false }: Props) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = value.length > 0
    ? globalTags.filter(t => t.includes(value) && !tags.includes(t))
    : globalTags.filter(t => !tags.includes(t));

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
    }
    setValue('');
    setShowSuggestions(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (value.trim()) addTag(value);
    } else if (e.key === 'Backspace' && !value && tags.length) {
      onChange(tags.slice(0, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  /* ── Select-only mode: no text input, just a dropdown button ── */
  if (selectOnly) {
    return (
      <div className="tag-input-wrap tag-input-wrap--select-only">
        <div className="tag-input-chips">
          {tags.map(tag => (
            <TagChip key={tag} tag={tag} onRemove={() => onChange(tags.filter(t => t !== tag))} />
          ))}
          {tags.length < maxTags && suggestions.length > 0 && (
            <button
              className="tag-input-select-btn"
              onMouseDown={e => { e.preventDefault(); setShowSuggestions(s => !s); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            >
              + TAG
            </button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="tag-suggestions">
            {suggestions.map(tag => (
              <button
                key={tag}
                className="tag-suggestion-item"
                onMouseDown={e => { e.preventDefault(); addTag(tag); }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Default mode: text input + suggestions ───────────────── */
  return (
    <div className="tag-input-wrap">
      <div className="tag-input-chips" onClick={() => inputRef.current?.focus()}>
        {tags.map(tag => (
          <TagChip key={tag} tag={tag} onRemove={() => onChange(tags.filter(t => t !== tag))} />
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            className="tag-input-field"
            placeholder={tags.length === 0 ? 'Type or pick a tag…' : ''}
            value={value}
            onChange={e => { setValue(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            maxLength={30}
          />
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions.slice(0, 8).map(tag => (
            <button
              key={tag}
              className="tag-suggestion-item"
              onMouseDown={e => { e.preventDefault(); addTag(tag); }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
