const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, habit } = require('./helpers');

let t;
beforeEach(async () => { t = await startServer(); });
afterEach(() => t.close());
const daily = { weekdays: [0, 1, 2, 3, 4, 5, 6] };

test('all milestones start locked and nothing is stored', async () => {
  const { status, body } = await t.call('GET', '/habits/achievements');
  assert.equal(status, 200);
  assert.deepEqual(body.achievements.map(a => a.days), [3, 7, 14, 30, 60, 100]);
  assert.ok(body.achievements.every(a => !a.unlocked && a.unlockedAt === null));
  assert.equal(body.next.days, 3);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM achievements').get().c, 0);
});

test('3-day milestone unlocks once, with no duplicates', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'Run', ...daily }));
  const results = [];
  for (const date of ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']) results.push((await t.call('POST', `/habits/${h.id}/check-in`, { date })).body.newAchievements);
  assert.deepEqual(results[0], []); assert.deepEqual(results[1], []);
  assert.deepEqual(results[2].map(a => a.title).sort(), ['3-day streak', 'Run: 3-day streak']);
  assert.deepEqual(results[3], []);
  await t.call('GET', '/habits/achievements'); await t.call('GET', '/habits/achievements');
  assert.equal(t.db.prepare("SELECT COUNT(*) AS c FROM achievements WHERE habit_id IS NULL AND milestone = 3").get().c, 1);
  const a = (await t.call('GET', '/habits/achievements')).body;
  assert.equal(a.achievements[0].unlocked, true); assert.equal(a.achievements[0].unlockedAt, '2026-11-14');
  assert.equal(a.achievements[1].unlocked, false); assert.equal(a.currentStreak, 4); assert.equal(a.next.days, 7); assert.equal(a.next.remaining, 3);
  assert.equal(a.habitAchievements[0].days, 3);
});

test('unlocked achievements stay unlocked after undo; 7 days unlocks 3 and 7', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'Read', ...daily }));
  for (const d of [1, 2, 3, 4, 5, 6, 7]) await t.call('POST', `/habits/${h.id}/check-in`, { date: `2026-11-0${d}` });
  await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-07', completed: false });
  const a = (await t.call('GET', '/habits/achievements')).body;
  assert.deepEqual(a.achievements.filter(x => x.unlocked).map(x => x.days), [3, 7]);
  assert.equal(a.longestStreak, 6);
  assert.deepEqual(a.habitStreaks, [{ id: h.id, title: 'Read', streak: 0 }]); // 6 done, then missed days up to today
});

test('deleting a habit removes its own achievements but keeps global ones', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'Del', ...daily }));
  for (const d of ['10', '11', '12']) await t.call('POST', `/habits/${h.id}/check-in`, { date: `2026-11-${d}` });
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM achievements').get().c, 2);
  await t.call('DELETE', `/habits/${h.id}`);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM achievements').get().c, 1);
  assert.equal((await t.call('GET', '/habits/achievements')).body.achievements[0].unlocked, true);
});
