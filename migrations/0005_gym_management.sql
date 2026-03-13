-- Gym management features for Premium Gym tier
-- Documents: proof of insurance, certifications, licenses
-- Private lessons: coaches list availability and pricing

CREATE TABLE IF NOT EXISTS gym_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_id INTEGER NOT NULL,
  type TEXT NOT NULL,          -- insurance, certification, license, other
  name TEXT NOT NULL DEFAULT '',
  file_data TEXT DEFAULT '',   -- base64 encoded (small files) or external URL
  verified INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS private_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_id INTEGER NOT NULL,
  coach_user_id INTEGER NOT NULL,
  sport TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gym_docs_gym ON gym_documents(gym_id);
CREATE INDEX IF NOT EXISTS idx_private_lessons_gym ON private_lessons(gym_id);
CREATE INDEX IF NOT EXISTS idx_private_lessons_coach ON private_lessons(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_private_lessons_sport ON private_lessons(sport);
