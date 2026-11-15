const { today, nowLocal } = require('../utils/dateUtils');
const { habitStreaks } = require('../utils/streakCalculator');
const MILESTONES = [3, 7, 14, 30, 60, 100];

function createAchievementService(db, habitSvc, statsSvc) {
  // Unlocks every milestone reached by the stored completion history. Rows are unique per
  // (type, milestone, habit) so repeated calls never duplicate; returns only newly unlocked ones.
  const evaluate = () => {
    const t = today(), now = nowLocal(), comp = habitSvc.completionMap(), unlocked = [];
    const ins = db.prepare('INSERT OR IGNORE INTO achievements (habit_id, achievement_type, milestone, unlocked_at) VALUES (?, ?, ?, ?)');
    const { longest } = statsSvc.overallStreaks();
    for (const m of MILESTONES) if (longest >= m && ins.run(null, 'streak', m, now).changes === 1) unlocked.push({ days: m, title: `${m}-day streak` });
    for (const h of habitSvc.all()) {
      const best = habitStreaks(h, comp.get(h.id) || new Set(), t).longest;
      for (const m of MILESTONES) if (best >= m && ins.run(h.id, 'habit_streak', m, now).changes === 1) unlocked.push({ days: m, title: `${h.title}: ${m}-day streak`, habitId: h.id });
    }
    return unlocked;
  };
  const get = () => {
    evaluate();
    const t = today(), comp = habitSvc.completionMap(), habits = habitSvc.all(), { current, longest } = statsSvc.overallStreaks();
    const rows = db.prepare('SELECT * FROM achievements ORDER BY milestone, id').all();
    const global = new Map(rows.filter(r => r.achievement_type === 'streak').map(r => [r.milestone, r]));
    const nextDays = MILESTONES.find(m => m > current);
    return {
      currentStreak: current, longestStreak: longest,
      achievements: MILESTONES.map(m => ({ days: m, unlocked: global.has(m), unlockedAt: global.has(m) ? global.get(m).unlocked_at.slice(0, 10) : null })),
      habitStreaks: habits.map(h => ({ id: h.id, title: h.title, streak: habitStreaks(h, comp.get(h.id) || new Set(), t).current })),
      next: nextDays ? { days: nextDays, remaining: nextDays - current, percentage: Math.round((current / nextDays) * 100) } : null,
      habitAchievements: rows.filter(r => r.achievement_type === 'habit_streak').map(r => ({ habitId: r.habit_id, title: habits.find(h => h.id === r.habit_id)?.title, days: r.milestone, unlockedAt: r.unlocked_at.slice(0, 10) })),
    };
  };
  return { MILESTONES, evaluate, get };
}
module.exports = { createAchievementService, MILESTONES };
