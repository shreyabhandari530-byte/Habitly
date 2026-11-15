# Habitly – Habit & Daily Goal Tracker (Frontend)
React + Vite + Axios + React Router + Recharts + Lucide + React Hot Toast. Plain CSS (design tokens in `src/styles/global.css`).

## Run
```
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```
Backend expected at `http://localhost:5000/api` (set `VITE_API_BASE_URL`). Enable CORS for `http://localhost:5173`.
The UI stores nothing locally; every mutation re-fetches from the API.

## API contract
The full request/response contract (dates, error format, status codes, validation rules) is in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md). Responses are normalized in `src/services/apiContract.js`.

## Behaviour notes
- Connection status: sidebar pill + offline banner; auto-reconnect refetches all data.
- After any create/update/delete/check-in, stats, charts, calendar, heatmap and achievements refetch automatically.
- Dates are `YYYY-MM-DD` everywhere. Missing statistics show "–" instead of made-up numbers.
