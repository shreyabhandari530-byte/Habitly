# Habitly API
Base URL `http://localhost:5000/api`. JSON only. This backend implements the frontend's `docs/API_CONTRACT.md` (v1) exactly; fields marked *extra* are additions the frontend ignores.

**Conventions:** dates are `YYYY-MM-DD` (server's local day); weekdays are `0` (Sun) to `6` (Sat); percentages are integers 0–100.
**Errors:** any non-2xx returns `{ "message": "...", "errors": { "field": "..." } }` (`errors` only for validation).

| Status | When |
|---|---|
| 400 | Validation failed (field errors), invalid id, invalid JSON body |
| 404 | Habit or route not found |
| 409 | Habit already completed for that date |
| 500 | Unexpected error (`{"message":"Internal server error. Please try again."}`, details only in the server log) |

**Habit object:** `{ id, title, description, category, start_date, weekdays, completedToday, streak }` (`streak` = current streak of that habit, `completedToday` refers to the server's today).
**Validation:** `title` trimmed 2–60 chars; `description` ≤ 300; `category` ∈ Health, Fitness, Study, Productivity, Personal Development, Other; `start_date` valid `YYYY-MM-DD`; `weekdays` non-empty integers 0–6.

## Streak rules
Only scheduled days count; unscheduled days never break a streak; a missed scheduled day does; today still being pending does not break the current streak; future days never count. *Habit streak* = consecutive scheduled days of that habit. *Overall streak* = consecutive days (that have at least one scheduled habit) on which **all** scheduled habits were completed.

## Endpoints

### GET /habits → 200 `[Habit]`
### POST /habits → 201 `Habit`
Body `{ "title":"Study Java","description":"","category":"Study","start_date":"2026-11-01","weekdays":[1,2,3,4,5] }`
Error 400: `{"message":"Validation failed","errors":{"title":"Title must be at least 2 characters."}}`
### PUT /habits/:id → 200 `Habit` (same body as POST). 400 validation / invalid id, 404 not found.
### DELETE /habits/:id → 200 `{"message":"Habit deleted successfully"}`; deletes the habit's completions and habit-level achievements. 404 if missing.
### POST /habits/:id/check-in
Body `{ "date":"2026-11-13", "completed":true }` (`completed:false` undoes; `completed` defaults to true, `date` defaults to today).
Success 200 `{ "newAchievements":[{"days":3,"title":"3-day streak"},{"days":3,"title":"Study Java: 3-day streak","habitId":1}] }` (`habitId` *extra*; empty array when nothing new unlocked or on undo).
Errors: **409** `{"message":"Habit already completed for that date."}`; 400 `{"errors":{"date":"Date cannot be in the future." | "This habit is not scheduled on that weekday." | "Date is before the habit start date." | "Date must be a valid date in YYYY-MM-DD format."}}`; 404 unknown habit. Undoing a date that is not completed returns 200 (idempotent).
### GET /habits/history?from=YYYY-MM-DD&to=YYYY-MM-DD → 200
`[{ "date":"2026-11-09","completed":1,"total":2,"percentage":50,"habits":[{"id":1,"title":"Study Java","completed":true}] }]`
Only days with at least one scheduled habit; days after today are never returned. `to` defaults to today, `from` to 30 days before `to`; max range 400 days. 400 `{"errors":{"from":"..."}}` for bad dates.
### GET /habits/stats → 200
`{ "totalHabits":5,"completedToday":2,"pendingToday":3,"completionPercentage":40,"currentStreak":4,"bestStreak":9,"weekly":[{"day":"Mon","date":"2026-11-09","completed":4,"total":5,"percentage":80}],"habitProgress":[{"title":"Study Java","percentage":88}] }`
`weekly` = last 7 days ending today. `habitProgress` = last 30 days of scheduled days. `completionPercentage` is omitted when nothing is scheduled today (the UI shows "–"). Also used by the frontend as its connection check.
### GET /habits/achievements → 200
`{ "currentStreak":4,"longestStreak":9,"achievements":[{"days":3,"unlocked":true,"unlockedAt":"2026-11-14"},{"days":7,"unlocked":false,"unlockedAt":null}],"habitStreaks":[{"id":1,"title":"Study Java","streak":9}],"next":{"days":7,"remaining":3,"percentage":57},"habitAchievements":[{"habitId":1,"title":"Study Java","days":7,"unlockedAt":"2026-11-14"}] }`
Milestones 3, 7, 14, 30, 60, 100 (`next`, `habitAchievements` *extra*). Unlocks are based on the longest streak in the stored history, stored once in SQLite (unique per type/milestone/habit) and kept even if a completion is undone later. `unlockedAt` is the day the unlock was recorded.
### GET /habits/heatmap → 200
`[{ "date":"2026-11-13","count":3,"total":5,"percentage":60,"intensity":3 }]` for the last 12 months; only days with at least one completion (`total` = habits scheduled that day; `intensity` 1–4 *extra*).
### GET /habits/motivation → 200
`{ "quote":"...","author":"Habitly","message":"2 habits still pending today.","status":"pending","pending":2 }` (`message`, `status` ∈ no_habits | rest_day | pending | all_done, `pending` *extra*). Quotes come from a local collection.
### GET /habits/analytics/categories → 200
`[{ "category":"Study","total":2,"completed":1,"pending":1,"percentage":83,"weekly":[{"day":"Mon","date":"2026-11-09","completed":1,"total":2,"percentage":50}],"mostConsistent":true }]`
Only categories that have habits. `completed`/`pending` = today's scheduled habits; **`percentage` = completion rate over the last 7 days** (consistency); `weekly` and `mostConsistent` are *extra*.
