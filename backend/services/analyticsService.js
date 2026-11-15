const { today, addDays, weekdayOf, daysBetween } = require('../utils/dateUtils');
const { isScheduledOn } = require('../utils/streakCalculator');
const { CATEGORIES } = require('../middleware/validateHabit');
const { pct } = require('./statisticsService');
const QUOTES = require('../utils/quotes');

function createAnalyticsService(db, habitSvc, statsSvc) {
  // Last 12 months (aligned to the start of the week). Only days with at least one completion are returned.
  const heatmap = () => {
    const t = today(), habits = habitSvc.all(), comp = habitSvc.completionMap();
    return statsSvc.dayStats(habits, comp, addDays(t, -(364 + weekdayOf(t))), t).filter(d => d.completed > 0)
      .map(d => ({ date: d.date, count: d.completed, total: d.total, percentage: d.percentage,
        intensity: d.percentage >= 100 ? 4 : d.percentage >= 66 ? 3 : d.percentage >= 33 ? 2 : 1 }));
  };
  // completed/pending = today's scheduled habits; percentage = completion rate over the last 7 days (consistency).
  const categories = () => {
    const t = today(), habits = habitSvc.all(), comp = habitSvc.completionMap(), out = [];
    for (const category of CATEGORIES) {
      const hs = habits.filter(h => h.category === category); if (!hs.length) continue;
      const week = statsSvc.dayStats(hs, comp, addDays(t, -6), t);
      const sched = hs.filter(h => isScheduledOn(h, t)), completed = sched.filter(h => comp.get(h.id)?.has(t)).length;
      const wTotal = week.reduce((s, d) => s + d.total, 0), wDone = week.reduce((s, d) => s + d.completed, 0);
      out.push({ category, total: hs.length, completed, pending: sched.length - completed, percentage: pct(wDone, wTotal), weeklyTotal: wTotal, weekly: week, mostConsistent: false });
    }
    const best = out.filter(c => c.weeklyTotal > 0).sort((a, b) => b.percentage - a.percentage || b.weeklyTotal - a.weeklyTotal)[0];
    if (best) best.mostConsistent = true;
    return out.map(({ weeklyTotal, ...c }) => c);
  };
  const motivation = () => {
    const t = today(), habits = habitSvc.all(), comp = habitSvc.completionMap();
    const sched = habits.filter(h => isScheduledOn(h, t)), done = sched.filter(h => comp.get(h.id)?.has(t)).length, pending = sched.length - done;
    const streak = statsSvc.overallStreaks().current;
    let status, message;
    if (!habits.length) { status = 'no_habits'; message = 'Add your first habit to start your streak.'; }
    else if (!sched.length) { status = 'rest_day'; message = 'Nothing is scheduled today. Rest up and plan tomorrow.'; }
    else if (!pending) { status = 'all_done'; message = `All ${done} scheduled habit${done > 1 ? 's' : ''} done today. Great work!`; }
    else { status = 'pending'; message = `${pending} habit${pending > 1 ? 's' : ''} still pending today.` + (streak ? ` Finish ${pending > 1 ? 'them' : 'it'} to keep your ${streak}-day streak going.` : ''); }
    const q = QUOTES[daysBetween(`${t.slice(0, 4)}-01-01`, t) % QUOTES.length];
    return { ...q, message, status, pending };
  };
  return { heatmap, categories, motivation };
}
module.exports = { createAnalyticsService };
