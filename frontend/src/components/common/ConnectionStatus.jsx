import { Wifi, WifiOff, Loader2 } from 'lucide-react';
export function ConnectionStatus({ status }) {
  const M = { online: [Wifi, 'Connected'], offline: [WifiOff, 'Offline'], checking: [Loader2, 'Connecting…'] }[status];
  const Icon = M[0];
  return <div className={'conn-pill ' + status} role="status"><Icon size={15} className={status === 'checking' ? 'spin' : ''} />{M[1]}</div>;
}
export const OfflineBanner = ({ onRetry }) => <div className="offline-banner" role="alert"><WifiOff size={17} /><span>Can't reach the backend at <b>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</b>. Showing the last loaded data.</span><button className="btn" onClick={onRetry}>Retry</button></div>;
