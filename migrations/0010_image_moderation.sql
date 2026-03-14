-- Image content moderation
CREATE TABLE IF NOT EXISTS image_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  uploader_id INTEGER NOT NULL,
  ai_result TEXT DEFAULT '{}',
  status TEXT DEFAULT 'approved',
  reviewed_by INTEGER,
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (uploader_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_image_reviews_status ON image_reviews(status);
CREATE INDEX IF NOT EXISTS idx_image_reviews_uploader ON image_reviews(uploader_id);
