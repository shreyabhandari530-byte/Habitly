require('dotenv').config();
const { createDb, resolveDbPath } = require('./config/database');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 5000;
const dbPath = resolveDbPath();
const db = createDb(dbPath);
const { app } = createApp(db);
const server = app.listen(PORT, () => console.log(`Habitly API running at http://localhost:${PORT}/api (database: ${dbPath})`));

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
