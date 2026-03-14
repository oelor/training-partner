-- QR Code Check-in: gym codes, radius config, guest check-ins

-- Add QR check-in columns to gyms
-- Note: SQLite doesn't support UNIQUE in ALTER TABLE ADD COLUMN.
-- The unique constraint is enforced via index below.
ALTER TABLE gyms ADD COLUMN checkin_code TEXT;
ALTER TABLE gyms ADD COLUMN checkin_radius_m INTEGER DEFAULT 200;

-- Guest check-ins (non-authenticated visitors)
CREATE TABLE IF NOT EXISTS guest_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  lat REAL,
  lng REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guest_checkins_gym ON guest_checkins(gym_id, created_at);
CREATE INDEX IF NOT EXISTS idx_guest_checkins_email ON guest_checkins(email, gym_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gyms_checkin_code ON gyms(checkin_code);
