-- Migration 0021: Enhanced abuse-resistant reporting system
-- Replaces the basic reports table (0003) with a full-featured reporting system

-- Migrate existing reports to new schema
-- First, create the new table
CREATE TABLE IF NOT EXISTS reports_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL,
  reported_user_id INTEGER,
  content_type TEXT NOT NULL CHECK(content_type IN ('profile', 'message', 'event', 'review', 'gym_review')),
  content_id INTEGER,
  category TEXT NOT NULL CHECK(category IN ('impersonation', 'harassment', 'spam', 'fake_profile', 'inappropriate_content', 'underage', 'other')),
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'actioned', 'dismissed')),
  admin_notes TEXT,
  action_taken TEXT CHECK(action_taken IN ('warning', 'content_removed', 'restricted', 'banned', NULL)),
  resolved_by INTEGER,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id)
);

-- Migrate existing data from old reports table
INSERT INTO reports_v2 (id, reporter_id, reported_user_id, content_type, category, description, status, created_at)
SELECT id, reporter_id, reported_id, 'profile',
  CASE reason
    WHEN 'harassment' THEN 'harassment'
    WHEN 'inappropriate_content' THEN 'inappropriate_content'
    WHEN 'fake_identity' THEN 'fake_profile'
    WHEN 'underage' THEN 'underage'
    WHEN 'threatening_behavior' THEN 'harassment'
    WHEN 'spam' THEN 'spam'
    ELSE 'other'
  END,
  COALESCE(NULLIF(details, ''), reason),
  status,
  created_at
FROM reports;

-- Drop old table and rename
DROP TABLE IF EXISTS reports;
ALTER TABLE reports_v2 RENAME TO reports;

-- Create indexes
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id, status);
CREATE INDEX idx_reports_reporter ON reports(reporter_id, created_at);
CREATE INDEX idx_reports_status ON reports(status, created_at);
CREATE UNIQUE INDEX idx_reports_no_duplicate ON reports(reporter_id, reported_user_id, content_type, content_id) WHERE status != 'dismissed';
