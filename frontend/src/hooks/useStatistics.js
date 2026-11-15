import { useCallback, useEffect, useRef, useState } from 'react';
import { habitService } from '../services/habitService';
// Generic fetch hook. Refetches on "habits:changed" (fired after every habit mutation or resync),
// keeps showing the previous data while refreshing, resets when the fetcher itself changes (e.g. new month),
// and ignores out-of-order responses.
export function useAsync(fn) {
  const [s, set] = useState({ data: null, loading: true, error: null });
  const seq = useRef(0);
  const run = useCallback(() => {
    const id = ++seq.current;
    fn().then(data => { if (id === seq.current) set({ data, loading: false, error: null }); })
      .catch(e => { if (id === seq.current) set(p => ({ ...p, loading: false, error: e.message })); });
  }, [fn]);
  useEffect(() => {
    set({ data: null, loading: true, error: null }); run();
    window.addEventListener('habits:changed', run);
    return () => { seq.current++; window.removeEventListener('habits:changed', run); };
  }, [run]);
  const reload = useCallback(() => { set(p => ({ ...p, loading: p.data === null, error: null })); run(); }, [run]);
  return { ...s, reload };
}
export const useStatistics = () => useAsync(habitService.stats);
