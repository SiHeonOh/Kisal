import { ReactNode } from 'react';
import './auth.css';

interface Props {
  children: ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: Props) {
  return (
    <div className="auth-root">

      {/* Background typography */}
      <div className="auth-bg-text" aria-hidden="true">
        <div className="auth-bg-line1">
          <span className="auth-bg-en">KISAL</span>
          <span className="auth-bg-ja1">改善</span>
        </div>
        <div className="auth-bg-line2">終わりのない改善</div>
      </div>

      {/* Industrial geometry layer */}
      <div className="auth-geo" aria-hidden="true">
        <div className="auth-corner auth-corner--tl" />
        <div className="auth-corner auth-corner--tr" />
        <div className="auth-corner auth-corner--bl" />
        <div className="auth-corner auth-corner--br" />
        <div className="auth-barcode auth-barcode--h1" />
        <div className="auth-barcode auth-barcode--h2" />
        <div className="auth-barcode auth-barcode--v" />
        <div className="auth-reticle" />
        <div className="auth-slash" />
        <div className="auth-tick-row auth-tick-row--top" />
        <div className="auth-tick-row auth-tick-row--mid" />
      </div>

      {/* Vertical side text */}
      <div className="auth-side-left" aria-hidden="true">
        <span>CONTINUOUS·IMPROVEMENT</span>
        <span>PROJECT:02</span>
        <span>INDUSTRIAL·SYS</span>
        <span>KAIZEN·ENGINE</span>
      </div>
      <div className="auth-side-right" aria-hidden="true">
        <span>KAIZEN·PROTOCOL</span>
        <span>UNIT-001</span>
        <span>AUTH·ACCESS</span>
        <span>SYS://V4.1</span>
      </div>

      {/* Meta bar */}
      <div className="auth-meta-bar">
        <span>SYS://AUTH.MODULE</span>
        <span>PROJECT:02</span>
        <span>KISAL-OS V4.1</span>
        <span>■ SECURE</span>
      </div>

      {/* Login card */}
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-eyebrow">
            <span>UNIT-001</span>
            <span>◆</span>
            <span>{title.toUpperCase()}</span>
          </div>
          {children}
        </div>
      </main>

      <div className="auth-footer">
        <span>終わりなき改善</span>
        <span className="auth-footer-dot">◆</span>
        <span>CONTINUOUS IMPROVEMENT</span>
        <span className="auth-footer-dot">◆</span>
        <span>改善システム</span>
      </div>
    </div>
  );
}
