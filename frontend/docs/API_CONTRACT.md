# Habit Tracker – Shared API Contract (v1)
Frontend ⇄ Node/Express/SQLite backend. Base URL `http://localhost:5000/api` (frontend: `VITE_API_BASE_URL`). JSON only; CORS must allow `http://localhost:5173`.
The frontend normalizes every response in `src/services/apiContract.js`; change both together.

## Conventions
- **Dates**: always `YYYY-MM-DD` (local calendar day), in requests, responses and query params. `weekdays`: integers `0` (Sun) – `6` (Sat). Percentages: integers 0–100.
- **Lists** are returned as bare JSON arrays. Numbers that the backend cannot compute should be omitted; the UI shows "–" (it never invents values).
- **Success**: 200 (reads/updates), 201 (create), 204 or 200 (delete).
- **Errors** (any non-2xx): `{ "message": "Human readable text", "errors": { "title": "Title is required" } }` (`errors` only for validation).
  | Status | Meaning | UI behaviour |
  |---|---|---|
  | 400 / 422 | Validation failed | field messages shown in the form (`errors`), else toast |
  | 404 | Habit not found | toast "no longer exists", data refetched |
  | 409 | Habit already completed for that date | info toast, data refetched |
  | 5xx | Server error | toast with `message`, retry available |
  | no response / timeout | Backend unreachable | "Offline" status + banner with Retry; auto-reconnect |

## Habit object
`{ id, title, description, category, start_date, weekdays:[0-6], completedToday:boolean, streak:number }`
Rules (enforce on the server too): `title` 2–60 chars (trimmed); `description` ≤ 300; `category` ∈ Health, Fitness, Study, Productivity, Personal Development, Other; `start_date` valid date; `weekdays` ≥ 1 value.

## Endpoints
| Method & path | Request | Response |
|---|---|---|
| GET /habits | – | `[Habit]` (`completedToday` is for the server's current day) |
| POST /habits | `{title,description,category,start_date,weekdays}` | `Habit` |
| PUT /habits/:id | same as POST | `Habit` |
| DELETE /habits/:id | – | 200/204 |
| POST /habits/:id/check-in | `{date, completed}` – `completed:false` undoes | `{ newAchievements:[{days,title}] }`; **409** if already completed |
| GET /habits/history?from=&to= | both `YYYY-MM-DD` | `[{date,completed,total,percentage,habits:[{id,title,completed}]}]` – only habits *scheduled* that day (unscheduled days are never "missed") |
| GET /habits/stats | – | `{totalHabits,completedToday,pendingToday,completionPercentage,currentStreak,bestStreak,weekly:[{day,date,completed,total,percentage}],habitProgress:[{title,percentage}]}` |
| GET /habits/achievements | – | `{currentStreak,longestStreak,achievements:[{days,unlocked,unlockedAt}],habitStreaks:[{id,title,streak}]}` – milestones 3,7,14,30,60,100 |
| GET /habits/heatmap | – | `[{date,count,total,percentage}]` for the last 12 months (days with activity) |
| GET /habits/motivation | – | `{quote,author}` |
| GET /habits/analytics/categories | – | `[{category,total,completed,pending,percentage}]` |

The frontend also pings `GET /habits/stats` (silent, 4s timeout) to show connection status; no extra health endpoint is required.
