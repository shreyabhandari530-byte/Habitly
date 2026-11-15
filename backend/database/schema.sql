CREATE TABLE IF NOT EXISTS habits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL CHECK (category IN ('Health','Fitness','Study','Productivity','Personal Development','Other')),
  start_date  TEXT NOT NULL,            -- YYYY-MM-DD
  weekdays    TEXT NOT NULL,            -- JSON array of 0 (Sun) .. 6 (Sat)
  created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id        INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date TEXT NOT NULL,        -- YYYY-MM-DD
  created_at      TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (habit_id, completion_date)
);
CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions (completion_date);

CREATE TABLE IF NOT EXISTS achievements (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id         INTEGER REFERENCES habits(id) ON DELETE CASCADE,   -- NULL = global achievement
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('streak','habit_streak')),
  milestone        INTEGER NOT NULL,
  unlocked_at      TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_achievement ON achievements (achievement_type, milestone, IFNULL(habit_id, 0));
