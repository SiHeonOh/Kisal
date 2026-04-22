import { ReactNode } from 'react';
import './auth.css';

interface Props {
  children: ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: Props) {
  return (
    <div className="auth-root">
      <header className="auth-header">
        <span className="auth-logo">KISAL</span>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
