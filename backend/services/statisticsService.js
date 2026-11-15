const { today, addDays, shortDay, eachDay } = require('../utils/dateUtils');
const { isScheduledOn, calcStreaks, overallDays, scheduledDates } = require('../utils/streakCalculator');

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
function createStatisticsService(db, habitSvc) {
  const overallStreaks = () => calcStreaks(overallDays(habitSvc.all(), habitSvc.completionMap(), today()), today());
  // Per-day totals for a date range, shared by weekly stats and category analytics.
  const dayStats = (habits, comp, from, to) => eachDay(from, to).map(date => {
    const sched = habits.filter(h => isScheduledOn(h, date));
    const completed = sched.filter(h => comp.get(h.id)?.has(date)).length;
    return { day: shortDay(date), date, completed, total: sched.length, percentage: pct(completed, sched.length) };
  });
  const stats = () => {
    const t = today(), habits = habitSvc.all(), comp = habitSvc.completionMap();
    const sched = habits.filter(h => isScheduledOn(h, t));
    const done = sched.filter(h => comp.get(h.id)?.has(t)).length;
    const { current, longest } = overallStreaks();
    const habitProgress = habits.map(h => {
      const dates = scheduledDates(h, t).filter(d => d >= addDays(t, -29));
      return dates.length ? { title: h.title, percentage: pct(dates.filter(d => comp.get(h.id)?.has(d)).length, dates.length) } : null;
    }).filter(Boolean);
    const out = { totalHabits: habits.length, completedToday: done, pendingToday: sched.length - done, currentStreak: current, bestStreak: longest,
      weekly: dayStats(habits, comp, addDays(t, -6), t), habitProgress };
    if (sched.length) out.completionPercentage = pct(done, sched.length); // omitted when nothing is scheduled today
    return out;
  };
  return { overallStreaks, dayStats, stats };
}
module.exports = { createStatisticsService, pct };
