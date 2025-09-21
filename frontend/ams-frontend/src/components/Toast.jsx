import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => { onClose && onClose(); }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className={"toast " + (type === 'error' ? 'toast-error' : 'toast-success')} role="status" aria-live="polite">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}


