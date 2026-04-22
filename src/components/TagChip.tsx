import './TagChip.css';

interface Props {
  tag: string;
  onRemove?: () => void;
}

export function TagChip({ tag, onRemove }: Props) {
  return (
    <span className="tag-chip">
      {tag}
      {onRemove && (
        <button className="tag-chip-remove" onClick={onRemove} aria-label={`Remove tag ${tag}`}>
          ×
        </button>
      )}
    </span>
  );
}
