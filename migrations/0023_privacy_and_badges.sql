-- =============================================
-- PRIVACY & VISIBILITY CONTROLS
-- =============================================

-- Profile visibility mode (preset or custom)
ALTER TABLE users ADD COLUMN privacy_mode TEXT DEFAULT 'open' CHECK(privacy_mode IN ('open', 'standard', 'private', 'custom'));

-- Per-field visibility: 'public', 'community', 'trusted', 'hidden'
ALTER TABLE users ADD COLUMN vis_photo TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN vis_bio TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN vis_location_city TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN vis_location_exact TEXT DEFAULT 'community';
ALTER TABLE users ADD COLUMN vis_sports TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN vis_schedule TEXT DEFAULT 'community';
ALTER TABLE users ADD COLUMN vis_contact TEXT DEFAULT 'trusted';
ALTER TABLE users ADD COLUMN vis_training_logs TEXT DEFAULT 'trusted';

-- Trusted contacts (symmetric/mutual — both must accept)
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')),
  trust_group TEXT DEFAULT 'training_partner' CHECK(trust_group IN ('training_partner', 'coach', 'competitor', 'friend')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  UNIQUE(requester_id, recipient_id)
);
CREATE INDEX idx_trusted_contacts_recipient ON trusted_contacts(recipient_id, status);
CREATE INDEX idx_trusted_contacts_requester ON trusted_contacts(requester_id, status);

-- Teams/Groups
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  creator_id INTEGER NOT NULL,
  visibility_policy TEXT DEFAULT 'standard' CHECK(visibility_policy IN ('open', 'standard', 'private')),
  is_public INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 50,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  vis_override TEXT DEFAULT 'inherit',
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(team_id, user_id)
);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- =============================================
-- EXTENDED BADGE SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  badge_type TEXT NOT NULL CHECK(badge_type IN ('competition', 'coaching')),
  -- Competition: state, national, international, world_olympic
  -- Coaching: youth, high_school, university, professional
  badge_level TEXT NOT NULL,
  sport TEXT NOT NULL,
  title TEXT NOT NULL,
  organization TEXT,
  year INTEGER,
  evidence_url TEXT,
  evidence_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'rejected')),
  verified_by INTEGER,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
CREATE INDEX idx_user_badges_user ON user_badges(user_id, status);
CREATE INDEX idx_user_badges_status ON user_badges(status);
