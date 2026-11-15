const { weekdayOf, eachDay } = require('./dateUtils');

const isScheduledOn = (habit, date) => date >= habit.start_date && habit.weekdays.includes(weekdayOf(date));
const scheduledDates = (habit, upTo) => eachDay(habit.start_date, upTo).filter(d => habit.weekdays.includes(weekdayOf(d)));

// days: ascending [{date, done}] containing ONLY days on which something was scheduled (so unscheduled
// days can never break a streak). Today still being pending does not break the current streak.
function calcStreaks(days, today) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.done ? run + 1 : 0; if (run > longest) longest = run; }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].done) current++;
    else if (i === days.length - 1 && days[i].date === today) continue;
    else break;
  }
  return { current, longest };
}

const habitStreaks = (habit, completed, today) =>
  calcStreaks(scheduledDates(habit, today).map(date => ({ date, done: completed.has(date) })), today);

// Overall streak: consecutive scheduled days on which EVERY habit scheduled that day was completed.
function overallDays(habits, completions, today) {
  if (!habits.length) return [];
  const start = habits.reduce((m, h) => (h.start_date < m ? h.start_date : m), habits[0].start_date);
  const out = [];
  for (const date of eachDay(start, today)) {
    const sched = habits.filter(h => isScheduledOn(h, date));
    if (sched.length) out.push({ date, done: sched.every(h => completions.get(h.id)?.has(date)) });
  }
  return out;
}
module.exports = { isScheduledOn, scheduledDates, calcStreaks, habitStreaks, overallDays };
