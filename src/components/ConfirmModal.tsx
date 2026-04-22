import { useEffect, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.css';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ title, message, confirmLabel = 'CONFIRM', danger = false, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      prev?.focus();
    };
  }, [onCancel]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onCancel} aria-hidden="true">
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <div className="modal-header-line" />
          <span className="modal-title" id="modal-title">{title}</span>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onCancel} autoFocus>
            CANCEL
          </button>
          <button
            className={`modal-btn ${danger ? 'modal-btn--danger' : 'modal-btn--confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
