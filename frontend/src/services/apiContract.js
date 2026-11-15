// Shared API contract (see docs/API_CONTRACT.md). Every response is normalized here, so components
// only ever see the documented shapes. Missing numbers become null (shown as "–"), never invented values.
import { CATEGORIES } from '../utils/constants';
import { isISODate, normalizeDate } from '../utils/dateUtils';
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const arr = v => (Array.isArray(v) ? v : []);
export const pick = (d, key) => (Array.isArray(d) ? d : arr(d?.[key]));
export const HABIT_RULES = { titleMin: 2, titleMax: 60, descriptionMax: 300 };

export const normalizeHabit = h => ({
  id: h.id, title: String(h.title ?? ''), description: h.description ?? '', category: h.category || 'Other',
  start_date: normalizeDate(h.start_date), weekdays: arr(h.weekdays).map(Number).filter(d => d >= 0 && d <= 6),
  completedToday: !!h.completedToday, streak: num(h.streak) ?? 0,
});
export const normalizeStats = s => ({
  totalHabits: num(s?.totalHabits), completedToday: num(s?.completedToday), pendingToday: num(s?.pendingToday),
  completionPercentage: num(s?.completionPercentage), currentStreak: num(s?.currentStreak), bestStreak: num(s?.bestStreak),
  weekly: arr(s?.weekly).map(d => ({ day: d.day, date: normalizeDate(d.date), completed: num(d.completed) ?? 0, total: num(d.total) ?? 0, percentage: num(d.percentage) ?? 0 })),
  habitProgress: arr(s?.habitProgress).map(p => ({ title: p.title, percentage: num(p.percentage) ?? 0 })),
});
export const normalizeHistory = d => pick(d, 'history').map(x => ({
  date: normalizeDate(x.date), completed: num(x.completed) ?? 0, total: num(x.total) ?? 0, percentage: num(x.percentage) ?? 0,
  habits: arr(x.habits).map(h => ({ id: h.id, title: h.title, completed: !!h.completed })),
}));
export const normalizeAchievements = d => ({
  currentStreak: num(d?.currentStreak) ?? 0, longestStreak: num(d?.longestStreak) ?? 0,
  achievements: arr(d?.achievements).map(a => ({ days: num(a.days), unlocked: !!a.unlocked, unlockedAt: a.unlockedAt ? normalizeDate(a.unlockedAt) : null })),
  habitStreaks: arr(d?.habitStreaks).map(s => ({ id: s.id, title: s.title, streak: num(s.streak) ?? 0 })),
});
export const normalizeHeatmap = d => pick(d, 'heatmap').map(x => ({ date: normalizeDate(x.date), count: num(x.count) ?? 0, total: num(x.total) ?? 0, percentage: num(x.percentage) ?? 0 }));
export const normalizeCategories = d => pick(d, 'categories').map(c => ({ category: c.category, total: num(c.total) ?? 0, completed: num(c.completed) ?? 0, pending: num(c.pending) ?? 0, percentage: num(c.percentage) ?? 0 }));
export const normalizeMotivation = d => ({ quote: d?.quote || '', author: d?.author || '' });
export const normalizeCheckIn = d => ({ newAchievements: arr(d?.newAchievements).map(a => ({ days: num(a.days), title: a.title || '' })) });

// Request payload + validation rules (the backend must enforce the same rules; see docs).
export const buildHabitPayload = f => ({
  title: f.title.trim(), description: (f.description || '').trim(), category: f.category,
  start_date: f.start_date, weekdays: [...new Set(f.weekdays.map(Number))].sort(),
});
export function validateHabit(f) {
  const e = {}, t = f.title.trim();
  if (t.length < HABIT_RULES.titleMin) e.title = `Enter a title with at least ${HABIT_RULES.titleMin} characters.`;
  else if (t.length > HABIT_RULES.titleMax) e.title = `Keep the title under ${HABIT_RULES.titleMax} characters.`;
  if ((f.description || '').length > HABIT_RULES.descriptionMax) e.description = `Keep the description under ${HABIT_RULES.descriptionMax} characters.`;
  if (!CATEGORIES.includes(f.category)) e.category = 'Choose a category.';
  if (!f.start_date) e.start_date = 'Choose a start date.';
  else if (!isISODate(f.start_date)) e.start_date = 'Use a valid date (YYYY-MM-DD).';
  if (!f.weekdays.length) e.weekdays = 'Select at least one weekday.';
  return e;
}
