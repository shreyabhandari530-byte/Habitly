import { useEffect, useState } from 'react';
import { Loader2, Inbox, AlertTriangle, X } from 'lucide-react';
export const Loader = ({ label = 'Loading…' }) => <div className="center-box"><Loader2 className="spin" size={26} /><span>{label}</span></div>;
export const EmptyState = ({ title, text, action }) => <div className="center-box"><Inbox size={34} /><h3>{title}</h3><p className="muted">{text}</p>{action}</div>;
export const ErrorMessage = ({ message, onRetry }) => <div className="center-box error"><AlertTriangle size={30} /><p>{message}</p>{onRetry && <button className="btn" onClick={onRetry}>Try again</button>}</div>;
export function Modal({ title, onClose, children }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
export function ConfirmDialog({ title, text, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return <Modal title={title} onClose={onCancel}><p className="muted">{text}</p><div className="modal-actions"><button className="btn" onClick={onCancel} disabled={busy}>Cancel</button><button className="btn danger" onClick={go} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button></div></Modal>;
}
// Renders loading / error / ready states consistently.
export const Async = ({ state, children }) => state.loading ? <Loader /> : state.error && !state.data ? <ErrorMessage message={state.error} onRetry={state.reload} /> : children(state.data);
