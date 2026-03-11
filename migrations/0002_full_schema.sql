-- Migration 0002: Full schema for Training Partner app
-- Adds users, profiles, gyms, sessions, bookings, matches, messages, subscriptions, notifications, reviews

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  city TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'athlete',
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  token TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  sports TEXT DEFAULT '[]',
  skill_level TEXT DEFAULT '',
  weight_class TEXT DEFAULT '',
  training_goals TEXT DEFAULT '[]',
  experience_years INTEGER DEFAULT 0,
  bio TEXT DEFAULT '',
  availability TEXT DEFAULT '[]',
  age INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  profile_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);

-- Gyms table
CREATE TABLE IF NOT EXISTS gyms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  lat REAL DEFAULT 0,
  lng REAL DEFAULT 0,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sports TEXT DEFAULT '[]',
  amenities TEXT DEFAULT '[]',
  verified INTEGER NOT NULL DEFAULT 0,
  premium INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  price TEXT DEFAULT '',
  owner_id INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_owner ON gyms(owner_id);

-- Gym sessions (open mat hours)
CREATE TABLE IF NOT EXISTS gym_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  max_slots INTEGER NOT NULL DEFAULT 20,
  current_slots INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_gym ON gym_sessions(gym_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES gym_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_a INTEGER NOT NULL,
  user_b INTEGER NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b);
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_pair ON matches(user_a, user_b);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  lemon_squeezy_id TEXT,
  lemon_squeezy_customer_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  trial_ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ls ON subscriptions(lemon_squeezy_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  data TEXT DEFAULT '{}',
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Gym reviews table
CREATE TABLE IF NOT EXISTS gym_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_gym ON gym_reviews(gym_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_gym ON gym_reviews(user_id, gym_id);

-- Favorite gyms table
CREATE TABLE IF NOT EXISTS favorite_gyms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gym_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_gym ON favorite_gyms(user_id, gym_id);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_pair ON blocked_users(blocker_id, blocked_id);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);

-- Seed some demo gyms
INSERT INTO gyms (name, address, city, state, lat, lng, phone, email, description, sports, amenities, verified, premium, rating, review_count, price, created_at, updated_at)
VALUES
  ('Iron Temple MMA', '123 Champion Way', 'Los Angeles', 'CA', 34.0522, -118.2437, '(555) 123-4567', 'contact@irontemple.com', 'Premier MMA facility with world-class coaching and training equipment.', '["MMA","BJJ","Wrestling"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 1, 4.8, 24, '$20/drop-in', datetime('now'), datetime('now')),
  ('Grappling Factory', '456 Mat Street', 'Los Angeles', 'CA', 34.0195, -118.4912, '(555) 234-5678', 'info@grapplingfactory.com', 'Traditional grappling-focused gym with experienced instructors.', '["BJJ","Judo"]', '["Mat Space","Weight Room","Coffee Bar"]', 1, 0, 4.6, 18, '$15/drop-in', datetime('now'), datetime('now')),
  ('Knucklehead Boxing', '789 Punch Ave', 'Los Angeles', 'CA', 34.0407, -118.2468, '(555) 345-6789', 'train@knucklehead.com', 'Old-school boxing gym with authentic atmosphere.', '["Boxing","Kickboxing"]', '["Ring","Heavy Bags","Sparring Area"]', 1, 0, 4.5, 12, '$10/drop-in', datetime('now'), datetime('now')),
  ('Elite Wrestling Club', '321 Mat Blvd', 'Los Angeles', 'CA', 34.0689, -118.4452, '(555) 456-7890', 'info@elitewrestling.com', 'Competition-focused wrestling club with Olympic-level coaching.', '["Wrestling","MMA"]', '["Mat Space","Strength Room","Video Analysis"]', 1, 1, 4.9, 32, '$25/month', datetime('now'), datetime('now')),
  ('Zen Combat Academy', '555 Harmony Lane', 'Los Angeles', 'CA', 34.0928, -118.3287, '(555) 567-8901', 'zen@combatacademy.com', 'Modern facility with premium amenities and diverse training options.', '["MMA","BJJ","Muay Thai"]', '["Cage","Sauna","Lounge"]', 1, 1, 4.7, 20, '$30/drop-in', datetime('now'), datetime('now')),
  ('Bay Area Wrestling', '100 Grapple Dr', 'Hayward', 'CA', 37.6688, -122.0808, '(510) 555-1234', 'info@bayareawrestling.com', 'Community wrestling club open to all levels.', '["Wrestling","Judo"]', '["Mat Space","Parking"]', 1, 0, 4.4, 8, '$15/drop-in', datetime('now'), datetime('now'));

-- Seed gym sessions for each gym
INSERT INTO gym_sessions (gym_id, day_of_week, start_time, end_time, max_slots, current_slots, created_at)
VALUES
  (1, 'Saturday', '10:00', '14:00', 20, 0, datetime('now')),
  (1, 'Sunday', '09:00', '12:00', 15, 0, datetime('now')),
  (2, 'Sunday', '09:00', '12:00', 25, 0, datetime('now')),
  (2, 'Wednesday', '19:00', '21:00', 18, 0, datetime('now')),
  (3, 'Monday', '18:00', '20:00', 12, 0, datetime('now')),
  (3, 'Thursday', '18:00', '20:00', 12, 0, datetime('now')),
  (4, 'Tuesday', '19:00', '21:00', 30, 0, datetime('now')),
  (4, 'Thursday', '19:00', '21:00', 30, 0, datetime('now')),
  (4, 'Saturday', '10:00', '13:00', 40, 0, datetime('now')),
  (5, 'Friday', '20:00', '22:00', 16, 0, datetime('now')),
  (6, 'Saturday', '10:00', '13:00', 20, 0, datetime('now')),
  (6, 'Wednesday', '18:00', '20:00', 15, 0, datetime('now'));
