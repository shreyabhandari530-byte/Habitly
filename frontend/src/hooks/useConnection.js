import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
// Tracks backend reachability from real API traffic ("api:status" events) plus a light ping
// (every 30s when online, every 5s when offline). Reconnecting refetches all data.
export default function useConnection() {
  const [status, setStatus] = useState('checking'); const last = useRef('checking');
  const check = useCallback(async () => { try { await api.get('/habits/stats', { timeout: 4000, silent: true }); } catch { /* status is set by the interceptor */ } }, []);
  useEffect(() => {
    const on = e => { const s = e.detail; if (last.current === 'offline' && s === 'online') window.dispatchEvent(new Event('habits:changed')); last.current = s; setStatus(s); };
    window.addEventListener('api:status', on);
    let timer; const loop = () => { if (!document.hidden) check(); timer = setTimeout(loop, last.current === 'offline' ? 5000 : 30000); };
    loop();
    return () => { clearTimeout(timer); window.removeEventListener('api:status', on); };
  }, [check]);
  return { status, retry: check };
}
