# QR Code Check-in — Design Spec

## Overview

Athletes scan a QR code posted at a gym to check in. GPS verification confirms they are physically present. Logged-in users check in instantly; non-users see a guest form that funnels into sign-up. Gym owners control the check-in radius and can regenerate their QR code from the dashboard.

## Data Model

### Modified tables

**`gyms`** — add two columns:
- `checkin_code TEXT UNIQUE` — random 16-char alphanumeric string. Generated on gym creation or first QR access. Encodes into URL: `https://trainingpartner.app/checkin/{checkin_code}`
- `checkin_radius_m INTEGER DEFAULT 200` — GPS radius in meters (configurable 50–1000m)

**`checkins`** — add one column:
- `checkin_source TEXT DEFAULT 'app'` — values: `app` (existing dashboard button), `qr` (scanned QR code)

### New table

**`guest_checkins`**:
- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `gym_id INTEGER NOT NULL REFERENCES gyms(id)`
- `name TEXT NOT NULL`
- `email TEXT NOT NULL`
- `lat REAL`
- `lng REAL`
- `created_at TEXT DEFAULT (datetime('now'))`

### Migration

One D1 migration file. Backfills existing gyms with generated `checkin_code` values using `hex(randomblob(8))`.

## API Endpoints

### `GET /api/checkin/:code` (public)

Resolves a `checkin_code` to gym info. Returns: `{ ok, gym: { id, name, city, state, lat, lng, radius_m } }`. Returns 404 if code is invalid.

### `POST /api/checkin/:code/verify` (auth required)

Accepts: `{ lat: number, lng: number }`

Flow:
1. Resolve code to gym
2. Calculate Haversine distance between `(lat, lng)` and `(gym.lat, gym.lng)`
3. If distance > `gym.checkin_radius_m`, reject with `{ ok: false, error: "too_far", distance_m, radius_m, gym_name, gym_address }`
4. Check rate limit: one check-in per user per gym per 4 hours
5. Insert into `checkins` with `checkin_source = 'qr'`
6. Award points (same logic as existing check-in)
7. Return `{ ok, gym_name, points_earned, total_points }`

### `POST /api/checkin/:code/guest` (public)

Accepts: `{ name: string, email: string, lat: number, lng: number }`

Flow:
1. Validate name (non-empty) and email (valid format)
2. Resolve code to gym
3. GPS distance check (same as verify)
4. Rate limit: one guest check-in per email per gym per 24 hours
5. Insert into `guest_checkins`
6. Return `{ ok, gym_name }`

### `POST /api/gym-dashboard/regenerate-code` (auth: gym_owner)

Generates a new `checkin_code` for the authenticated owner's gym, invalidating the previous code. Returns `{ ok, checkin_code }`.

### `PUT /api/gym-dashboard/settings` (existing, auth: gym_owner)

Add `checkin_radius_m` to accepted fields. Validate range: 50–1000.

## Frontend

### New page: `/checkin/[code]/page.tsx`

Public page (outside `/app` layout — no sidebar). Renders based on state:

1. **Loading** — Spinner while resolving code via `GET /api/checkin/:code`
2. **Invalid code** — "This check-in code is no longer valid" with link to home
3. **Logged in** — Shows gym name/city, requests GPS permission, auto-submits check-in. Displays success animation with points earned and link to `/app/passport`. On GPS error or too-far, shows friendly message with gym address.
4. **Not logged in** — Shows two paths:
   - "Sign in to check in and earn points" button → `/auth/signin?return=/checkin/[code]`
   - Guest form: name + email fields → submits to guest endpoint. On success, shows "Create your free account to earn points and badges" CTA linking to `/auth/signup`

Design: dark theme consistent with app. Gym branding (name, city) prominent. Minimal — focused on completing the check-in action.

### New component: `src/components/qr-code-card.tsx`

Renders the gym's QR code using `qrcode.react`. Props: `{ url: string, gymName: string }`. Includes:
- QR code display (256x256)
- "Download as PNG" button (canvas export)
- "Copy link" button
- "Regenerate Code" button (with confirm dialog)

### Modified: Gym Dashboard (`/app/gym-dashboard/page.tsx`)

Add "QR Check-in" to the `quickActions` array. Links to a new section or modal that renders `QrCodeCard`. The QR URL is constructed from the gym's `checkin_code`.

### Modified: Gym Dashboard Settings

Add "Check-in Radius" field — number input or slider, 50–1000m, default 200. Saves via existing settings endpoint.

## GPS & Distance

### Haversine formula (server-side)

```typescript
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

### Client-side GPS

Use `navigator.geolocation.getCurrentPosition()` with `{ enableHighAccuracy: true, timeout: 10000 }`. Handle three cases:
- Permission denied → instructions to enable
- Timeout → retry prompt
- Success → send coordinates to API

## Error Handling

| Scenario | Response |
|----------|----------|
| Invalid/expired code | 404: "This check-in code is no longer valid" |
| GPS permission denied | Client-side: "Please enable location access to check in" with browser-specific instructions |
| Too far from gym | 403: "You're {X}m away from {gym_name}. Check-ins require being within {radius}m." Includes gym address. |
| Already checked in | 429: "You already checked in at {gym_name} {time} ago" |
| Guest rate limited | 429: "This email was already used to check in today" |
| Gym has no coordinates | 500: "This gym hasn't set up location-based check-in yet" (edge case for legacy gyms without lat/lng) |

## Rate Limiting

- Authenticated users: 1 check-in per user per gym per 4 hours (matches existing behavior)
- Guest check-ins: 1 per email per gym per 24 hours
- Code regeneration: 1 per gym per hour (prevent accidental rapid regeneration)

## Security

- QR codes are public URLs — security comes from GPS verification, not code secrecy
- Guest email is stored but not verified (V1). No account creation from guest data without explicit consent.
- `checkin_code` is 16 hex chars (64 bits of entropy) — not guessable
- GPS coordinates are validated server-side (not trusted blindly, but GPS spoofing is out of scope for V1 — the threat model is "casual cheating", not determined attackers)

## Dependencies

- `qrcode.react` — QR code rendering (client-side only, ~3KB gzipped)
- No other new dependencies. Haversine is vanilla math. Everything else uses existing infrastructure.

## Testing

- **Unit:** Haversine distance calculation with known coordinates
- **Unit:** Rate limit logic (within window, outside window, edge cases)
- **Integration:** Check-in flow — valid code + valid GPS → success
- **Integration:** Check-in flow — valid code + too far → rejection with distance
- **Integration:** Guest check-in flow — valid input → success, rate limit → rejection
- **Integration:** Code regeneration — new code works, old code returns 404
- **Edge cases:** Gym without lat/lng, missing GPS, concurrent check-ins

## Out of Scope (V2+)

- QR code auto-rotation (daily/hourly) — punt to Kiosk Mode feature
- Guest-to-member conversion pipeline (automated email follow-up)
- GPS spoofing detection
- Offline check-in / Bluetooth proximity
- Check-in streaks and streak-based badges
