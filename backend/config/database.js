require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DEV_DB = path.resolve(__dirname, '../database/habitly.db');
const schema = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8');

function resolveDbPath() {
  const p = process.env.DATABASE_PATH || './database/habitly.db';
  return p === ':memory:' ? p : path.resolve(__dirname, '..', p);
}

// Opens (and auto-initialises) a database. Foreign keys are enforced on every connection.
function createDb(file = resolveDbPath()) {
  if (process.env.NODE_ENV === 'test' && path.resolve(file) === DEV_DB) {
    throw new Error('Refusing to open the development database while NODE_ENV=test.');
  }
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('foreign_keys = ON');
  if (file !== ':memory:') db.pragma('journal_mode = WAL');
  db.exec(schema);
  return db;
}
module.exports = { createDb, resolveDbPath };
