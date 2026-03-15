-- Champion Verification Tiers
-- Replaces binary verified column with tiered system

-- Add verification tier column
ALTER TABLE users ADD COLUMN verification_tier TEXT DEFAULT 'none' CHECK(verification_tier IN ('none', 'verified', 'pro', 'champion'));
ALTER TABLE users ADD COLUMN verification_sport TEXT;
ALTER TABLE users ADD COLUMN verification_title TEXT;

-- Migrate existing verified users
UPDATE users SET verification_tier = 'verified' WHERE verified = 1;

-- Message filtering preferences
ALTER TABLE users ADD COLUMN msg_filter_verified_only INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN msg_filter_min_tier TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN msg_filter_max_distance_km INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN msg_filter_sports_match INTEGER DEFAULT 0;

-- Set Amit Elor as champion
UPDATE users SET verification_tier = 'champion', verification_sport = 'Wrestling', verification_title = '2024 Olympic Champion' WHERE id = 6;
