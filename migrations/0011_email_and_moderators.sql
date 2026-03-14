-- Email logging for trial courtesy emails
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_email_log_user_type ON email_log(user_id, email_type);

-- Moderator program with free membership grants
CREATE TABLE IF NOT EXISTS moderator_grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  granted_by INTEGER NOT NULL,
  granted_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (granted_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_moderator_grants_status ON moderator_grants(status, expires_at);
