import { AppHeader } from './AppHeader';
import { SheetTabs } from './SheetTabs';
import { Board } from './Board';
import './App.css';

export function App() {
  return (
    <div className="app-root">
      <AppHeader />
      <SheetTabs />
      <Board />
    </div>
  );
}
