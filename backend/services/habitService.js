const { today, weekdayOf, eachDay } = require('../utils/dateUtils');
const { isScheduledOn, habitStreaks } = require('../utils/streakCalculator');
const { validationError, notFoundError, conflictError } = require('../utils/responseHelper');

function createHabitService(db, lazy = {}) {
  const parse = r => ({ id: r.id, title: r.title, description: r.description, category: r.category, start_date: r.start_date, weekdays: JSON.parse(r.weekdays) });
  const all = () => db.prepare('SELECT * FROM habits ORDER BY id').all().map(parse);
  const find = id => { const r = db.prepare('SELECT * FROM habits WHERE id = ?').get(id); return r ? parse(r) : null; };
  const completionMap = () => {
    const m = new Map();
    for (const r of db.prepare('SELECT habit_id, completion_date FROM habit_completions').all()) {
      if (!m.has(r.habit_id)) m.set(r.habit_id, new Set());
      m.get(r.habit_id).add(r.completion_date);
    }
    return m;
  };
  const decorate = (h, comp, t) => {
    const set = comp.get(h.id) || new Set();
    return { ...h, completedToday: set.has(t), streak: habitStreaks(h, set, t).current };
  };
  const one = id => decorate(find(id), completionMap(), today());

  const list = () => { const comp = completionMap(), t = today(); return all().map(h => decorate(h, comp, t)); };
  const create = v => {
    const r = db.prepare('INSERT INTO habits (title, description, category, start_date, weekdays) VALUES (?, ?, ?, ?, ?)')
      .run(v.title, v.description, v.category, v.start_date, JSON.stringify(v.weekdays));
    return one(Number(r.lastInsertRowid));
  };
  const update = (id, v) => {
    if (!find(id)) throw notFoundError();
    db.prepare("UPDATE habits SET title = ?, description = ?, category = ?, start_date = ?, weekdays = ?, updated_at = datetime('now','localtime') WHERE id = ?")
      .run(v.title, v.description, v.category, v.start_date, JSON.stringify(v.weekdays), id);
    return one(id);
  };
  const remove = id => { if (db.prepare('DELETE FROM habits WHERE id = ?').run(id).changes === 0) throw notFoundError(); };

  // completed=true records a completion (409 if it already exists); completed=false removes it (idempotent).
  const checkIn = (id, { date, completed }) => db.transaction(() => {
    const h = find(id); if (!h) throw notFoundError();
    if (!completed) { db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?').run(id, date); return { newAchievements: [] }; }
    if (date > today()) throw validationError({ date: 'Date cannot be in the future.' });
    if (date < h.start_date) throw validationError({ date: 'Date is before the habit start date.' });
    if (!h.weekdays.includes(weekdayOf(date))) throw validationError({ date: 'This habit is not scheduled on that weekday.' });
    const r = db.prepare('INSERT OR IGNORE INTO habit_completions (habit_id, completion_date) VALUES (?, ?)').run(id, date);
    if (r.changes === 0) throw conflictError('Habit already completed for that date.');
    return { newAchievements: lazy.achievements ? lazy.achievements.evaluate() : [] };
  })();

  // Only scheduled habits appear per day; future days are never returned.
  const history = (from, to) => {
    const t = today(), end = to > t ? t : to, habits = all(), comp = completionMap(), out = [];
    for (const date of eachDay(from, end)) {
      const sched = habits.filter(h => isScheduledOn(h, date));
      if (!sched.length) continue;
      const items = sched.map(h => ({ id: h.id, title: h.title, completed: !!comp.get(h.id)?.has(date) }));
      const completed = items.filter(i => i.completed).length;
      out.push({ date, completed, total: items.length, percentage: Math.round((completed / items.length) * 100), habits: items });
    }
    return out;
  };
  return { all, find, completionMap, list, create, update, remove, checkIn, history };
}
module.exports = { createHabitService };
