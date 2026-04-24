import { AppHeader } from './AppHeader';
import { TelemetryTicker } from './TelemetryTicker';
import { SheetTabs } from './SheetTabs';
import { Board } from './Board';
import { SystemStatusBar } from './SystemStatusBar';
import './App.css';

export function App() {
  return (
    <div className="app-root">
      <AppHeader />
      <TelemetryTicker />
      <SheetTabs />
      <Board />
      <SystemStatusBar />
    </div>
  );
}
