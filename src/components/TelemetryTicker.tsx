import { useMemo } from 'react';
import { useAppStore } from '../store';
import './TelemetryTicker.css';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)                        return 'JUST NOW';
  if (secs < 3600)                      return `${Math.floor(secs / 60)}M AGO`;
  if (secs < 86400)                     return `${Math.floor(secs / 3600)}H AGO`;
  if (secs < 86400 * 30)                return `${Math.floor(secs / 86400)}D AGO`;
  return `${Math.floor(secs / (86400 * 30))}MO AGO`;
}

export function TelemetryTicker() {
  const { state } = useAppStore();

  const activeSheet = useMemo(
    () => state.sheets.find(s => s.id === state.activeSheetId) ?? null,
    [state.sheets, state.activeSheetId],
  );

  const taskCount  = state.cards.length;
  const sheetTitle = activeSheet?.title.toUpperCase() ?? 'NO BOARD';
  const createdAt  = activeSheet ? formatDate(activeSheet.created_at) : '----';
  const age        = activeSheet ? timeAgo(activeSheet.created_at) : '----';

  const segment = [
    `BOARD: ${sheetTitle}`,
    `CREATED: ${createdAt}`,
    `BOARD AGE: ${age}`,
    `TASKS LOADED: ${taskCount}`,
    `NODE: KSL-01`,
    `ENCRYPTION: AES-256`,
    `SYNC: ACTIVE`,
    `PROTOCOL: SECURE`,
    `STATUS: NOMINAL`,
    `CLEARANCE: ALPHA`,
    `UPLINK: ESTABLISHED`,
  ].map(s => `// ${s} `).join('');

  /* duplicate so the seamless loop works */
  const text = segment + segment;

  return (
    <div className="ticker-root" aria-hidden="true">
      <span className="ticker-label">SYS</span>
      <div className="ticker-track">
        <span className="ticker-content">{text}</span>
      </div>
    </div>
  );
}
