-- Ad system tables for premium removal monetization
CREATE TABLE IF NOT EXISTS ad_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  placement TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL,
  advertiser_name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  link_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (slot_id) REFERENCES ad_slots(id)
);

-- Seed ad slots
INSERT INTO ad_slots (name, placement) VALUES
  ('discover_banner', 'Between search bar and gym grid on discover page'),
  ('gym_detail_sidebar', 'Below gym info card on gym detail page'),
  ('events_feed', 'Inline card every 5th event in events feed');

-- Seed placeholder ads (self-promo for premium upsell)
INSERT INTO ads (slot_id, advertiser_name, image_url, link_url, alt_text, is_active) VALUES
  (1, 'Training Partner Premium', '', '/app/settings', 'Upgrade to Premium for ad-free experience, priority booking, and more', 1),
  (2, 'Training Partner Premium', '', '/app/settings', 'Go Premium — unlock all gym features and remove ads', 1),
  (3, 'Training Partner Premium', '', '/app/settings', 'Train smarter with Premium — ad-free, priority booking, analytics', 1);
