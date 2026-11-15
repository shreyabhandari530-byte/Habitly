import api from './api';
import { pick, normalizeHabit, normalizeHistory, normalizeStats, normalizeMotivation, normalizeCheckIn } from './apiContract';
import { isISODate } from '../utils/dateUtils';
const emit = () => window.dispatchEvent(new Event('habits:changed'));
const badDate = () => Object.assign(new Error('Invalid date. Use YYYY-MM-DD.'), { kind: 'validation' });
export const habitService = {
  list: async () => pick((await api.get('/habits')).data, 'habits').map(normalizeHabit),
  create: async body => { const r = await api.post('/habits', body); emit(); return r.data; },
  update: async (id, body) => { const r = await api.put(`/habits/${id}`, body); emit(); return r.data; },
  remove: async id => { try { await api.delete(`/habits/${id}`); } finally { emit(); } },
  checkIn: async (id, date, completed = true) => {
    if (!isISODate(date)) throw badDate();
    try { const r = await api.post(`/habits/${id}/check-in`, { date, completed }); emit(); return normalizeCheckIn(r.data); }
    catch (e) { if (e.kind === 'conflict' || e.kind === 'notfound') emit(); throw e; } // resync stale UI
  },
  history: async ({ from, to }) => { if (!isISODate(from) || !isISODate(to)) throw badDate(); return normalizeHistory((await api.get('/habits/history', { params: { from, to } })).data); },
  stats: async () => normalizeStats((await api.get('/habits/stats')).data),
  motivation: async () => normalizeMotivation((await api.get('/habits/motivation')).data),
};
