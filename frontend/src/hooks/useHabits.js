import { useRef } from 'react';
import { useAsync } from './useStatistics';
import { habitService } from '../services/habitService';
import useNotifications from './useNotifications';
import { today } from '../utils/dateUtils';
export default function useHabits() {
  const { data, loading, error, reload } = useAsync(habitService.list);
  const n = useNotifications(); const busy = useRef(new Set());
  const resync = () => window.dispatchEvent(new Event('habits:changed'));
  // Returns the result, {fieldErrors} for server validation errors, or null on failure.
  const run = async (fn, ok) => {
    try { const r = await fn(); if (ok) n.success(ok); return r ?? true; }
    catch (e) {
      if (e.kind === 'validation') { if (e.fieldErrors) return { fieldErrors: e.fieldErrors }; n.error(e.message); }
      else if (e.kind === 'notfound') { n.error('This habit no longer exists.'); resync(); }
      else if (e.kind === 'conflict' || e.kind === 'client') n.error(e.message);
      return null; // network/server errors are already toasted by the API layer
    }
  };
  const save = (body, id) => run(() => (id ? habitService.update(id, body) : habitService.create(body)), id ? 'Habit updated successfully' : 'Habit created successfully');
  const remove = id => run(() => habitService.remove(id), 'Habit deleted successfully');
  const toggle = async habit => {
    if (busy.current.has(habit.id)) return; busy.current.add(habit.id);
    const done = !!habit.completedToday;
    try {
      const r = await habitService.checkIn(habit.id, today(), !done);
      n.success(done ? 'Completion undone' : 'Habit completed. Nice work!');
      r.newAchievements.forEach(a => n.achievement(a.title || `${a.days}-day streak`));
    } catch (e) {
      if (e.kind === 'conflict') n.info('You already completed this habit today.');
      else if (e.kind === 'notfound') n.error('This habit no longer exists.');
      else if (e.kind === 'validation' || e.kind === 'client') n.error(e.message);
    } finally { busy.current.delete(habit.id); }
  };
  return { habits: data || [], loading, error, reload, save, remove, toggle };
}
