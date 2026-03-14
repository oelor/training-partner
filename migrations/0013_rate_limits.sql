-- Improve rate_limits index for faster lookups by key + window_start
-- The original migration (0002) only indexed on key; queries filter on both columns.
DROP INDEX IF EXISTS idx_rate_limits_key;
CREATE INDEX idx_rate_limits_key ON rate_limits(key, window_start);
