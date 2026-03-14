# Revenue Features Design Spec

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan.

**Goal:** Add three revenue features — promoted events, ad spaces with premium removal, and fitness tracker foundation.

**Date:** 2026-03-14

---

## Feature 1: Promoted Events for Competition Organizers

### Data Model
Migration adds to existing events system:
```sql
ALTER TABLE events ADD COLUMN is_promoted INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN promotion_tier TEXT DEFAULT NULL; -- 'featured','spotlight','headline'
ALTER TABLE events ADD COLUMN promotion_start TEXT DEFAULT NULL;
ALTER TABLE events ADD COLUMN promotion_end TEXT DEFAULT NULL;
ALTER TABLE events ADD COLUMN promotion_stripe_session TEXT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS event_promotion_impressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(event_id, date)
);
```

### Promotion Tiers
| Tier | Price | Duration | Placement |
|------|-------|----------|-----------|
| Featured | $50 | 30 days | Gold border + badge in events feed |
| Spotlight | $100 | 30 days | Featured + pinned to top of events list |
| Headline | $200 | 30 days | Spotlight + banner on discover gyms page |

### API Endpoints
- `POST /api/events/:id/promote` — Create Stripe checkout for promotion (body: { tier })
- `GET /api/events/promoted` — Get currently promoted events (for discover page banner)
- `POST /api/events/:id/impression` — Track impression (fire-and-forget beacon)
- `POST /api/events/:id/click` — Track click

### Stripe Integration
- One-time payment via Stripe Checkout (not subscription)
- Price IDs created in Stripe for each tier
- Webhook `checkout.session.completed` with metadata `{ type: 'event_promotion', event_id, tier }`
- Sets is_promoted=1, promotion_tier, promotion_start=now, promotion_end=now+30days

### Frontend Changes
- Events page: promoted events section at top with gold styling
- Discover page: "Upcoming Events" banner for headline-tier promoted events
- Event creator sees "Promote This Event" button → tier selection → Stripe checkout
- Promoted events have gold border, "Promoted" badge, and "⚡ Sponsored" label

---

## Feature 2: Ad Spaces with Premium Removal

### Data Model
```sql
CREATE TABLE IF NOT EXISTS ad_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE, -- 'discover_banner', 'gym_detail_sidebar', 'events_feed'
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

-- Seed default ad slots
INSERT INTO ad_slots (name, placement) VALUES
  ('discover_banner', 'Between search bar and gym grid on discover page'),
  ('gym_detail_sidebar', 'Below gym info card on gym detail page'),
  ('events_feed', 'Inline card every 5th event in events feed');
```

### API Endpoints
- `GET /api/ads/:slotName` — Get active ad for a slot (random selection if multiple)
- `POST /api/ads/:id/impression` — Track impression
- `POST /api/ads/:id/click` — Track click + redirect

### Frontend Component: `<AdBanner />`
Props: `{ slot: string, className?: string }`
Behavior:
1. Check `isPremiumPlan(subscription?.plan)` — if true, render nothing
2. Fetch ad from `/api/ads/:slot`
3. Render ad image/link with "Ad · Upgrade to remove" label
4. Track impression on mount via beacon
5. Track click on interaction

### Ad Placements
1. Discover page — between search/filters and gym grid
2. Gym detail page — card below gym info section
3. Events feed — inline every 5th event

### Premium Feature Addition
- Settings page upgrade section: add "Ad-free experience" to premium benefits list

---

## Feature 3: Fitness Tracker Integration (Foundation)

### Data Model
```sql
CREATE TABLE IF NOT EXISTS connected_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL, -- 'whoop', 'withings', 'garmin', 'fitbit'
  provider_user_id TEXT DEFAULT '',
  access_token TEXT DEFAULT '',
  refresh_token TEXT DEFAULT '',
  token_expires_at TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- 'active', 'disconnected', 'pending'
  last_sync_at TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS fitness_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'sleep','recovery','strain','heart_rate','weight','body_comp'
  value_json TEXT NOT NULL DEFAULT '{}',
  recorded_at TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fitness_data_user_type ON fitness_data(user_id, data_type, recorded_at);
```

### API Endpoints
- `GET /api/integrations` — List user's connected accounts + available providers
- `POST /api/integrations/:provider/notify` — Toggle "notify me" for a provider

### Frontend Changes
- Settings page: "Connected Apps" section
  - Provider cards: Whoop, Withings, Garmin, Fitbit
  - Each shows logo, name, "Coming Soon" badge
  - "Notify me when available" toggle
- Profile page: "Training Metrics" placeholder section with "Connect a fitness tracker to see your training data here" message
