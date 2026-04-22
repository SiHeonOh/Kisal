import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAppStore } from '../store';
import './AppHeader.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppHeader() {
  const { state, actions } = useAppStore();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const nextTheme = state.theme === 'light' ? 'dark' : 'light';
  const themeLabel = state.theme === 'light' ? '☀' : '☾';

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <header className="app-header">
      <span className="app-logo">KISAL</span>
      <div className="app-header-actions">
        {installPrompt && (
          <button className="header-btn" onClick={handleInstall} title="Install app">
            Install
          </button>
        )}
        <button
          className="header-btn header-btn--icon"
          onClick={() => actions.setTheme(nextTheme)}
          title={`Theme: ${state.theme}`}
          aria-label="Toggle theme"
        >
          {themeLabel}
        </button>
        <button
          className="header-btn header-btn--icon"
          onClick={() => supabase.auth.signOut()}
          title="Sign out"
          aria-label="Sign out"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
