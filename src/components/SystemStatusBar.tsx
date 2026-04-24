import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import './SystemStatusBar.css';

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatUptime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function SystemStatusBar() {
  const { state } = useAppStore();
  const [uptimeSec, setUptimeSec] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setUptimeSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const activeSheet = useMemo(
    () => state.sheets.find(s => s.id === state.activeSheetId) ?? null,
    [state.sheets, state.activeSheetId],
  );

  const segments = [
    { label: 'UPTIME',  value: formatUptime(uptimeSec) },
    { label: 'TASKS',   value: String(state.cards.length) },
    { label: 'SHEETS',  value: String(state.sheets.length) },
    { label: 'BOARD',   value: activeSheet?.title.toUpperCase() ?? '—' },
    { label: 'NODE',    value: 'KSL-01' },
    { label: 'VER',     value: '0.9.1' },
  ];

  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-bar-dot" />
      {segments.map((seg, i) => (
        <span key={seg.label} className="status-bar-segment">
          <span className="status-bar-key">{seg.label}</span>
          <span className="status-bar-sep">:</span>
          <span className="status-bar-val">{seg.value}</span>
          {i < segments.length - 1 && (
            <span className="status-bar-div">//</span>
          )}
        </span>
      ))}
    </div>
  );
}
