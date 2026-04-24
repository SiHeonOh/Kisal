import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAppStore } from '../store';
import './AppHeader.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function AppHeader() {
  const { state, actions } = useAppStore();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const nextTheme = state.theme === 'light' ? 'dark' : 'light';

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-logo">KISAL</span>
        <span className="app-logo-sub">// TASK BOARD</span>
      </div>

      <div className="app-header-sys">
        <span className="app-sys-dot" />
        <span className="app-sys-date">{dateStr}</span>
        <span className="app-sys-divider">//</span>
        <span className="app-sys-clock">{timeStr}</span>
      </div>

      <div className="app-header-actions">
        {installPrompt && (
          <button className="header-btn" onClick={handleInstall} title="Install app">
            INSTALL
          </button>
        )}
        <button
          className="header-btn"
          onClick={() => actions.setTheme(nextTheme)}
          title={`Switch to ${nextTheme} mode`}
          aria-label="Toggle theme"
        >
          {state.theme === 'dark' ? '◐ LIGHT' : '◑ DARK'}
        </button>
        <button
          className="header-btn header-btn--exit"
          onClick={() => supabase.auth.signOut()}
          title="Sign out"
          aria-label="Sign out"
        >
          EXIT
        </button>
      </div>
    </header>
  );
}
