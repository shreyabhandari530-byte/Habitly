// DEMO DATA ONLY: sample habits and generated history for local development.
// Usage: npm run seed (only seeds an empty database) | npm run seed:reset (clears everything, then reseeds)
const { createDb } = require('../config/database');
const { createServices } = require('../services');
const { today, addDays, eachDay, weekdayOf } = require('../utils/dateUtils');

const ALL = [0, 1, 2, 3, 4, 5, 6];
const SAMPLE = [
  { title: 'Study Java', description: 'One focused hour on core Java and OOP.', category: 'Study', weekdays: [1, 2, 3, 4, 5], rate: 0.85 },
  { title: 'Exercise', description: '30 minutes of running or gym.', category: 'Fitness', weekdays: [1, 3, 5, 6], rate: 0.75 },
  { title: 'Read a book', description: 'Read at least 20 pages.', category: 'Personal Development', weekdays: ALL, rate: 0.7 },
  { title: 'Drink water', description: 'Drink 8 glasses of water.', category: 'Health', weekdays: ALL, rate: 0.9 },
  { title: 'Practice coding', description: 'Solve a coding problem or build a feature.', category: 'Productivity', weekdays: [1, 2, 3, 4, 5, 6], rate: 0.8 },
];
const mulberry32 = a => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function seedDatabase(db, { reset = false } = {}) {
  if (reset) db.exec("DELETE FROM achievements; DELETE FROM habit_completions; DELETE FROM habits; DELETE FROM sqlite_sequence WHERE name IN ('habits','habit_completions','achievements');");
  if (db.prepare('SELECT COUNT(*) AS c FROM habits').get().c > 0) return { seeded: false };
  const t = today(), start = addDays(t, -75); let completions = 0;
  db.transaction(() => {
    const insH = db.prepare('INSERT INTO habits (title, description, category, start_date, weekdays) VALUES (?, ?, ?, ?, ?)');
    const insC = db.prepare('INSERT OR IGNORE INTO habit_completions (habit_id, completion_date) VALUES (?, ?)');
    SAMPLE.forEach((h, i) => {
      const id = Number(insH.run(h.title, h.description, h.category, start, JSON.stringify(h.weekdays)).lastInsertRowid), rnd = mulberry32(42 + i);
      for (const date of eachDay(start, t)) {
        if (date === t || !h.weekdays.includes(weekdayOf(date))) continue; // today is left pending for the demo
        const forced = date >= addDays(t, -4) || (h.title === 'Study Java' && date >= addDays(t, -9));
        if ((forced || rnd() < h.rate) && insC.run(id, date).changes) completions++;
      }
    });
  })();
  createServices(db).achievements.evaluate();
  return { seeded: true, habits: SAMPLE.length, completions };
}
module.exports = { seedDatabase, SAMPLE };

if (require.main === module) {
  const db = createDb();
  const r = seedDatabase(db, { reset: process.argv.includes('--reset') });
  console.log(r.seeded ? `Seeded ${r.habits} DEMO habits and ${r.completions} generated completions (sample data for demonstration only).` : 'Database already has habits, nothing seeded. Use "npm run seed:reset" to clear and reseed.');
  db.close();
}
