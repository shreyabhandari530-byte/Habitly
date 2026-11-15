# Habitly Backend
Node.js + Express + SQLite (better-sqlite3) REST API for the Habitly habit tracker. Implements the frontend's shared contract (`docs/API_CONTRACT.md`); see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Features
Habit CRUD, check-in/undo with duplicate (409), future-date and weekday validation, schedule-aware streaks, statistics, calendar history, 12-month heatmap, persistent achievements (3/7/14/30/60/100 days), category analytics, daily motivation from a local message list, centralized validation and error handling, CORS for `localhost:5173/5174`, graceful shutdown. Single user, no authentication.

## Setup
Prerequisites: Node.js 20+ and npm.
```
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run seed                # optional demo data
npm start                   # http://localhost:5000/api
```
The SQLite file (`DATABASE_PATH`, default `database/habitly.db`) and tables are created automatically on startup and persist across restarts. Foreign keys are enforced.

## Demo data
`npm run seed` adds 5 sample habits (Study Java, Exercise, Read a book, Drink water, Practice coding) with ~75 days of generated history, only if the database is empty. `npm run seed:reset` deletes ALL data and reseeds. **Sample data is for demonstration only.**

## Tests
```
npm test
```
Uses the Node.js test runner with real HTTP requests against an in-memory SQLite database (never the development database).

## Connect the frontend
In the frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api`, then `npm run dev` (http://localhost:5173). Set `FRONTEND_URL` here if you use another origin.

## Structure
```
config/database.js  routes/  controllers/  services/  middleware/  utils/
database/schema.sql database/seed.js  tests/  app.js (Express app)  server.js (entry)
```
Notes: `services/` holds all business logic, `utils/streakCalculator.js` the streak rules, `utils/dateUtils.js` all date handling (`YYYY-MM-DD`, server local time).
