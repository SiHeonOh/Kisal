import { useState, useEffect, useCallback } from 'react';

export interface NewsItem {
  source: 'BBC' | 'GUARDIAN' | 'HN';
  title: string;
}

// Free CORS proxy — returns the raw response body unchanged
const PROXY   = 'https://api.allorigins.win/raw?url=';
const REFRESH = 15 * 60 * 1000; // 15 min

async function fetchRSS(
  url: string,
  source: NewsItem['source'],
  count = 7,
): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) return [];
    const text = await res.text();
    const doc   = new DOMParser().parseFromString(text, 'text/xml');
    return Array.from(doc.querySelectorAll('item'))
      .slice(0, count)
      .map(item => ({
        source,
        title: item.querySelector('title')?.textContent?.trim() ?? '',
      }))
      .filter(i => i.title.length > 0);
  } catch {
    return [];
  }
}

async function fetchHN(count = 6): Promise<NewsItem[]> {
  try {
    const ids: number[] = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
    ).then(r => r.json());

    const stories = await Promise.all(
      ids.slice(0, count).map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r =>
          r.json(),
        ),
      ),
    );

    return stories
      .filter(s => s?.title)
      .map(s => ({ source: 'HN' as const, title: s.title as string }));
  } catch {
    return [];
  }
}

export function useNewsTicker() {
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [loading,   setLoading  ] = useState(true);

  const fetchAll = useCallback(async () => {
    const [bbc, guardian, hn] = await Promise.all([
      fetchRSS('https://feeds.bbci.co.uk/news/world/rss.xml',      'BBC'),
      fetchRSS('https://www.theguardian.com/world/rss',             'GUARDIAN'),
      fetchHN(),
    ]);

    // Interleave sources so they mix evenly in the ticker
    const merged: NewsItem[] = [];
    const max = Math.max(bbc.length, guardian.length, hn.length);
    for (let i = 0; i < max; i++) {
      if (bbc[i])      merged.push(bbc[i]);
      if (hn[i])       merged.push(hn[i]);
      if (guardian[i]) merged.push(guardian[i]);
    }

    if (merged.length > 0) setHeadlines(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { headlines, loading };
}
