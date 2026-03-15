-- Stripe Connect fields for coaches
ALTER TABLE users ADD COLUMN stripe_connect_id TEXT;
ALTER TABLE users ADD COLUMN stripe_connect_onboarded INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_connect_charges_enabled INTEGER DEFAULT 0;

-- Coaching bookings (paid through platform)
CREATE TABLE IF NOT EXISTS coaching_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  coach_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  stripe_payment_intent TEXT,
  stripe_checkout_session TEXT,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  coach_payout_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded', 'disputed')),
  payment_method TEXT DEFAULT 'stripe' CHECK(payment_method IN ('stripe', 'off_platform')),
  session_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES coaching_listings(id),
  FOREIGN KEY (coach_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);
CREATE INDEX idx_bookings_coach ON coaching_bookings(coach_id, status);
CREATE INDEX idx_bookings_student ON coaching_bookings(student_id, status);
