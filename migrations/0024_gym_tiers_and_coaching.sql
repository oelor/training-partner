-- Gym partnership tiers
ALTER TABLE gyms ADD COLUMN partnership_tier TEXT DEFAULT 'free' CHECK(partnership_tier IN ('free', 'verified', 'featured', 'partner'));
ALTER TABLE gyms ADD COLUMN partnership_stripe_sub TEXT;
ALTER TABLE gyms ADD COLUMN partnership_start TEXT;
ALTER TABLE gyms ADD COLUMN partnership_end TEXT;
ALTER TABLE gyms ADD COLUMN claimed_by INTEGER REFERENCES users(id);
ALTER TABLE gyms ADD COLUMN claimed_at TEXT;
ALTER TABLE gyms ADD COLUMN lead_email TEXT;
ALTER TABLE gyms ADD COLUMN lead_phone TEXT;
ALTER TABLE gyms ADD COLUMN website_url TEXT;
ALTER TABLE gyms ADD COLUMN logo_url TEXT;

-- Coaching listings
CREATE TABLE IF NOT EXISTS coaching_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_id INTEGER NOT NULL,
  sport TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK(session_type IN ('private', 'semi_private', 'group', 'online')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  location TEXT,
  gym_id INTEGER,
  is_active INTEGER DEFAULT 1,
  max_students INTEGER DEFAULT 1,
  experience_years INTEGER,
  payment_methods TEXT DEFAULT 'Contact coach directly',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (coach_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES users(id)
);
CREATE INDEX idx_coaching_listings_sport ON coaching_listings(sport, is_active);
CREATE INDEX idx_coaching_listings_coach ON coaching_listings(coach_id);

-- Coaching inquiries (message thread between student and coach about a listing)
CREATE TABLE IF NOT EXISTS coaching_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES coaching_listings(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Affiliate links tracking
CREATE TABLE IF NOT EXISTS affiliate_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT CHECK(category IN ('gear', 'apparel', 'supplements', 'equipment', 'software', 'other')),
  commission_percent REAL,
  is_active INTEGER DEFAULT 1,
  clicks INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed some affiliate links
INSERT INTO affiliate_links (name, brand, url, category, commission_percent) VALUES
('Sanabul Essential MMA Gloves', 'Sanabul', 'https://www.amazon.com/dp/B01B4V9R1S?tag=trainingpartner-20', 'gear', 4.0),
('Elite Sports BJJ Gi', 'Elite Sports', 'https://www.amazon.com/dp/B07KWJLNHH?tag=trainingpartner-20', 'apparel', 4.0),
('Venum Challenger Headgear', 'Venum', 'https://www.amazon.com/dp/B00RH1A8OI?tag=trainingpartner-20', 'gear', 4.0),
('Hayabusa T3 Boxing Gloves', 'Hayabusa', 'https://www.amazon.com/dp/B01GIWIW6O?tag=trainingpartner-20', 'gear', 4.0),
('SISU Mouthguard', 'SISU', 'https://www.amazon.com/dp/B00NNJSEXU?tag=trainingpartner-20', 'gear', 4.0),
('Fuji BJJ Rashguard', 'Fuji', 'https://www.amazon.com/dp/B01N6TX1OT?tag=trainingpartner-20', 'apparel', 4.0),
('ASICS Matflex Wrestling Shoes', 'ASICS', 'https://www.amazon.com/dp/B07DND2FNQ?tag=trainingpartner-20', 'gear', 4.0),
('RDX Shin Guards', 'RDX', 'https://www.amazon.com/dp/B00UHBNOAM?tag=trainingpartner-20', 'gear', 4.0);
