import { useNewsTicker } from '../hooks/useNewsTicker';
import './NewsTicker.css';

const SOURCE_LABEL: Record<string, string> = {
  BBC:      'BBC',
  GUARDIAN: 'GDN',
  HN:       'HN',
};

export function NewsTicker() {
  const { headlines, loading } = useNewsTicker();

  if (loading || headlines.length === 0) {
    const placeholder = '// FETCHING HEADLINES … '.repeat(6);
    return (
      <div className="news-ticker-root" aria-label="News ticker loading">
        <span className="news-ticker-label">NEWS</span>
        <div className="news-ticker-track">
          <span className="news-ticker-content news-ticker-content--dim">{placeholder}</span>
        </div>
      </div>
    );
  }

  /* Build one long segment then duplicate for seamless loop */
  const segment = headlines
    .map(h => `[${SOURCE_LABEL[h.source] ?? h.source}] ${h.title.toUpperCase()}   `)
    .join('· ');

  const text = segment + '· ' + segment;

  return (
    <div className="news-ticker-root" aria-label="Live news headlines">
      <span className="news-ticker-label">NEWS</span>
      <div className="news-ticker-track">
        <span className="news-ticker-content">{text}</span>
      </div>
    </div>
  );
}
