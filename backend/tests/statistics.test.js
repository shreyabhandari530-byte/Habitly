const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, habit } = require('./helpers');
const { calcStreaks } = require('../utils/streakCalculator');

let t;
beforeEach(async () => { t = await startServer(); });
afterEach(() => t.close());
const checkIns = (id, dates) => Promise.all(dates.map(date => t.call('POST', `/habits/${id}/check-in`, { date })));
const seq = async (id, dates) => { for (const date of dates) await t.call('POST', `/habits/${id}/check-in`, { date }); };

test('calcStreaks: pending today does not break, misses do, unscheduled days are ignored', () => {
  const d = (date, done) => ({ date, done });
  assert.deepEqual(calcStreaks([d('a', true), d('b', true), d('2026-11-14', false)], '2026-11-14'), { current: 2, longest: 2 });
  assert.deepEqual(calcStreaks([d('a', true), d('b', false), d('c', true)], '2026-11-14'), { current: 1, longest: 1 });
  assert.deepEqual(calcStreaks([d('a', true), d('b', true), d('c', false), d('2026-11-14', true)], '2026-11-14'), { current: 1, longest: 2 });
  assert.deepEqual(calcStreaks([], '2026-11-14'), { current: 0, longest: 0 });
});

test('stats with no habits are computed, not faked', async () => {
  const { status, body } = await t.call('GET', '/habits/stats');
  assert.equal(status, 200);
  assert.equal(body.totalHabits, 0); assert.equal(body.completedToday, 0); assert.equal(body.pendingToday, 0);
  assert.equal(body.currentStreak, 0); assert.equal(body.bestStreak, 0);
  assert.equal('completionPercentage' in body, false);
  assert.equal(body.weekly.length, 7); assert.equal(body.weekly[6].date, '2026-11-14');
});

test('streak spans an unscheduled weekend; a missed scheduled day breaks it', async () => {
  const { body: h } = await t.call('POST', '/habits', habit());
  await seq(h.id, ['2026-11-06', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']); // Fri, then Mon-Fri
  let s = (await t.call('GET', '/habits/stats')).body;
  assert.equal(s.currentStreak, 6); assert.equal(s.bestStreak, 6);
  assert.equal((await t.call('GET', '/habits')).body[0].streak, 6);
  await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-11', completed: false });
  s = (await t.call('GET', '/habits/stats')).body;
  assert.equal(s.currentStreak, 2); assert.equal(s.bestStreak, 3);
});

test('stats count today only for habits scheduled today', async () => {
  const { body: daily } = await t.call('POST', '/habits', habit({ title: 'Daily', weekdays: [0, 1, 2, 3, 4, 5, 6] }));
  await t.call('POST', '/habits', habit({ title: 'Weekdays' })); // not scheduled on Saturday
  await t.call('POST', '/habits', habit({ title: 'Sat', weekdays: [6] }));
  let s = (await t.call('GET', '/habits/stats')).body;
  assert.equal(s.totalHabits, 3); assert.equal(s.completedToday, 0); assert.equal(s.pendingToday, 2); assert.equal(s.completionPercentage, 0);
  await t.call('POST', `/habits/${daily.id}/check-in`, { date: '2026-11-14' });
  s = (await t.call('GET', '/habits/stats')).body;
  assert.equal(s.completedToday, 1); assert.equal(s.pendingToday, 1); assert.equal(s.completionPercentage, 50);
  assert.equal(s.weekly[6].completed, 1); assert.equal(s.weekly[6].total, 2);
});

test('history returns scheduled days only, never future days', async () => {
  const { body: h } = await t.call('POST', '/habits', habit());
  await checkIns(h.id, ['2026-11-09', '2026-11-10']);
  const r = await t.call('GET', '/habits/history?from=2026-11-08&to=2026-11-20');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.map(d => d.date), ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']);
  assert.equal(r.body[0].completed, 1); assert.equal(r.body[0].percentage, 100); assert.equal(r.body[2].completed, 0);
  assert.deepEqual(r.body[0].habits, [{ id: h.id, title: 'Study Java', completed: true }]);
  assert.ok((await t.call('GET', '/habits/history?from=bad&to=2026-11-20')).body.errors.from);
  assert.ok((await t.call('GET', '/habits/history?from=2026-11-20&to=2026-11-01')).body.errors.from);
});

test('heatmap, categories and motivation come from stored data', async () => {
  const { body: a } = await t.call('POST', '/habits', habit({ title: 'Alpha', category: 'Health', weekdays: [0, 1, 2, 3, 4, 5, 6] }));
  await t.call('POST', '/habits', habit({ title: 'Beta', category: 'Fitness', weekdays: [0, 1, 2, 3, 4, 5, 6] }));
  assert.deepEqual((await t.call('GET', '/habits/heatmap')).body, []);
  assert.equal((await t.call('GET', '/habits/motivation')).body.status, 'pending');
  await checkIns(a.id, ['2026-11-13', '2026-11-14']);
  const hm = (await t.call('GET', '/habits/heatmap')).body;
  assert.deepEqual(hm.map(d => [d.date, d.count, d.total, d.percentage]), [['2026-11-13', 1, 2, 50], ['2026-11-14', 1, 2, 50]]);
  const cats = (await t.call('GET', '/habits/analytics/categories')).body;
  assert.deepEqual(cats.map(c => c.category), ['Health', 'Fitness']);
  assert.equal(cats[0].completed, 1); assert.equal(cats[0].pending, 0); assert.equal(cats[1].pending, 1);
  assert.equal(cats[0].mostConsistent, true); assert.equal(cats[1].mostConsistent, false); assert.equal(cats[0].weekly.length, 7);
  const m = (await t.call('GET', '/habits/motivation')).body;
  assert.ok(m.quote && m.author && m.message); assert.equal(m.pending, 1);
});

test('motivation reports all_done when every scheduled habit is complete', async () => {
  const { body: a } = await t.call('POST', '/habits', habit({ weekdays: [6] }));
  await t.call('POST', `/habits/${a.id}/check-in`, { date: '2026-11-14' });
  assert.equal((await t.call('GET', '/habits/motivation')).body.status, 'all_done');
});
