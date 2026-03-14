-- Training Logs
CREATE TABLE IF NOT EXISTS training_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gym_id INTEGER,
  checkin_id INTEGER,
  partner_id INTEGER,
  sport TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'drilling',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  intensity INTEGER NOT NULL DEFAULT 5,
  notes TEXT DEFAULT '',
  techniques TEXT DEFAULT '[]',
  rounds INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_training_logs_user ON training_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_logs_gym ON training_logs(gym_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_sport ON training_logs(user_id, sport);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  gym_id INTEGER,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sport TEXT DEFAULT '',
  event_date TEXT NOT NULL,
  end_date TEXT,
  location TEXT DEFAULT '',
  max_attendees INTEGER DEFAULT 0,
  is_public INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'going',
  created_at TEXT NOT NULL,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_gym ON events(gym_id);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport, event_date);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);

-- Gym Favorites indexes (table already exists from earlier migration)
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user ON favorite_gyms(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_gyms_pair ON favorite_gyms(user_id, gym_id);
