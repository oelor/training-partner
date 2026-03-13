-- Social integration: Google OAuth + Instagram connect
-- google_id: links Google account for OAuth login
-- instagram_username: user's Instagram handle for profile display

-- Note: These ALTER TABLE statements will fail silently if columns already exist
-- The worker's ensureFullSchema also handles this via safe ALTER TABLE calls

ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN instagram_username TEXT;

CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
