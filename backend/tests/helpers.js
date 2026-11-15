process.env.NODE_ENV = 'test';
const { createDb } = require('../config/database');
const { createApp } = require('../app');
const dates = require('../utils/dateUtils');

// Fixed "now": Saturday 2026-11-14. Each test gets its own in-memory database (never the dev database).
async function startServer() {
  dates.setClock(() => new Date(2026, 10, 14, 12, 0, 0));
  const db = createDb(':memory:');
  const { app, services } = createApp(db);
  const server = await new Promise(r => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const call = async (method, path, body, raw) => {
    const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
    let json = null; try { json = await r.json(); } catch { /* empty body */ }
    return { status: r.status, body: json };
  };
  const close = () => new Promise(r => { server.close(() => { db.close(); r(); }); server.closeAllConnections?.(); });
  return { db, services, call, close };
}
const habit = (o = {}) => ({ title: 'Study Java', description: '', category: 'Study', start_date: '2026-10-01', weekdays: [1, 2, 3, 4, 5], ...o });
module.exports = { startServer, habit };
