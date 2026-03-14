-- Cache for Google Places API results to minimize API calls ($200/mo free tier)
CREATE TABLE IF NOT EXISTS places_cache (
  cache_key TEXT PRIMARY KEY,
  results_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX idx_places_cache_expires ON places_cache(expires_at);
