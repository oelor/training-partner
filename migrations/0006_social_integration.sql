-- Social integration: Google OAuth + Instagram connect
-- google_id: links Google account for OAuth login
-- instagram_username: user's Instagram handle for profile display

-- Note: google_id and instagram_username may already exist from ensureFullSchema()
-- SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we use INSERT INTO a temp
-- approach: create a dummy table to mark this migration as applied, the actual
-- columns are ensured by the worker's ensureFullSchema() on cold start.

-- Ensure index exists (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
