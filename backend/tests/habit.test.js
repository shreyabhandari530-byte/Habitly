const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { startServer, habit } = require('./helpers');
const { createDb } = require('../config/database');
const { seedDatabase } = require('../database/seed');

let t;
before(async () => { t = await startServer(); });
after(() => t.close());

test('database initialises tables and enforces foreign keys', () => {
  const names = t.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  for (const n of ['habits', 'habit_completions', 'achievements']) assert.ok(names.includes(n), n);
  assert.equal(t.db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.throws(() => t.db.prepare("INSERT INTO habit_completions (habit_id, completion_date) VALUES (999, '2026-11-01')").run());
});

test('create, list and validate habits', async () => {
  const r = await t.call('POST', '/habits', habit({ title: '  Read  ' }));
  assert.equal(r.status, 201);
  assert.deepEqual(Object.keys(r.body).sort(), ['category', 'completedToday', 'description', 'id', 'start_date', 'streak', 'title', 'weekdays']);
  assert.equal(r.body.title, 'Read'); assert.equal(r.body.completedToday, false); assert.equal(r.body.streak, 0);
  const list = await t.call('GET', '/habits');
  assert.equal(list.status, 200); assert.ok(Array.isArray(list.body)); assert.equal(list.body.length, 1);
  const bad = await t.call('POST', '/habits', { title: 'x', category: 'Nope', start_date: '2026-13-01', weekdays: [] });
  assert.equal(bad.status, 400); assert.equal(bad.body.message, 'Validation failed');
  assert.deepEqual(Object.keys(bad.body.errors).sort(), ['category', 'start_date', 'title', 'weekdays']);
  assert.equal((await t.call('POST', '/habits', habit({ weekdays: [7] }))).status, 400);
  assert.equal((await t.call('POST', '/habits', habit({ title: 'a'.repeat(61) }))).status, 400);
  assert.equal((await t.call('POST', '/habits', habit({ description: 'a'.repeat(301) }))).status, 400);
});

test('update, delete (with cascade) and id errors', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'Temp' }));
  const u = await t.call('PUT', `/habits/${h.id}`, habit({ title: 'Renamed', weekdays: [1] }));
  assert.equal(u.status, 200); assert.equal(u.body.title, 'Renamed'); assert.deepEqual(u.body.weekdays, [1]);
  assert.equal((await t.call('PUT', `/habits/${h.id}`, { title: '' })).status, 400);
  assert.equal((await t.call('PUT', '/habits/9999', habit())).status, 404);
  assert.equal((await t.call('PUT', '/habits/abc', habit())).status, 400);
  await t.call('PUT', `/habits/${h.id}`, habit({ weekdays: [1, 2, 3, 4, 5] }));
  await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13' });
  const d = await t.call('DELETE', `/habits/${h.id}`);
  assert.equal(d.status, 200);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM habit_completions WHERE habit_id = ?').get(h.id).c, 0);
  assert.equal((await t.call('DELETE', `/habits/${h.id}`)).status, 404);
});

test('check-in: complete, duplicate 409, undo, idempotent undo', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'CI' }));
  const ok = await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13', completed: true });
  assert.equal(ok.status, 200); assert.ok(Array.isArray(ok.body.newAchievements));
  const dup = await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13', completed: true });
  assert.equal(dup.status, 409); assert.ok(dup.body.message);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM habit_completions WHERE habit_id = ?').get(h.id).c, 1);
  assert.equal((await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13', completed: false })).status, 200);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS c FROM habit_completions WHERE habit_id = ?').get(h.id).c, 0);
  assert.equal((await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13', completed: false })).status, 200);
});

test('check-in validation: future, unscheduled weekday, before start, bad date, missing habit', async () => {
  const { body: h } = await t.call('POST', '/habits', habit({ title: 'Val' }));
  const f = await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-16' });
  assert.equal(f.status, 400); assert.ok(f.body.errors.date);
  assert.ok((await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-14' })).body.errors.date); // Saturday
  assert.ok((await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-09-28' })).body.errors.date); // before start
  assert.ok((await t.call('POST', `/habits/${h.id}/check-in`, { date: '14-11-2026' })).body.errors.date);
  assert.ok((await t.call('POST', `/habits/${h.id}/check-in`, { date: '2026-11-13', completed: 'yes' })).body.errors.completed);
  assert.equal((await t.call('POST', '/habits/9999/check-in', { date: '2026-11-13' })).status, 404);
});

test('invalid JSON and unknown routes return JSON errors', async () => {
  const j = await t.call('POST', '/habits', undefined, '{bad json');
  assert.equal(j.status, 400); assert.ok(j.body.message);
  const n = await t.call('GET', '/nope');
  assert.equal(n.status, 404); assert.ok(n.body.message);
});

test('data persists after the database is closed and reopened', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'habitly-')), 'test.db');
  let db = createDb(file);
  db.prepare("INSERT INTO habits (title, category, start_date, weekdays) VALUES ('Persist', 'Other', '2026-11-01', '[1]')").run();
  db.close(); db = createDb(file);
  assert.equal(db.prepare('SELECT title FROM habits').get().title, 'Persist');
  db.close(); fs.rmSync(path.dirname(file), { recursive: true });
});

test('seed script is idempotent and can reset', () => {
  const db = createDb(':memory:');
  const a = seedDatabase(db); const b = seedDatabase(db);
  assert.equal(a.seeded, true); assert.equal(b.seeded, false);
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM habits').get().c, 5);
  const c = seedDatabase(db, { reset: true });
  assert.equal(c.seeded, true); assert.equal(db.prepare('SELECT COUNT(*) AS c FROM habits').get().c, 5);
  db.close();
});
