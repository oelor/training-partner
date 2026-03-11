# Manus AI — Training Partner Comprehensive Improvement Prompt

## Project Overview

You are working on **Training Partner** — a two-sided marketplace web application that connects combat sports athletes (wrestling, MMA, BJJ, boxing, kickboxing, judo, etc.) with compatible training partners and partner gyms offering open mat hours. The app is at the GitHub repo `oelor/training-partner`.

**There are TWO codebases that need to be unified:**

### Codebase 1: Next.js Frontend (`/training-partner/` — this repo)
- **Stack:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Lucide React icons, clsx
- **State:** Frontend prototype with hardcoded demo data and localStorage-based auth
- **Pages:** Landing, sign up, sign in, dashboard, profile editor, partner matching, gym listings, settings, terms, privacy
- **GitHub:** `oelor/training-partner` (main branch)

### Codebase 2: Cloudflare Worker Backend (exists separately, needs integration)
- **Stack:** Cloudflare Workers + D1 (SQLite) database + static assets
- **Worker name:** `training-partner-app`
- **D1 Database ID:** `30d075cd-2994-4d08-8aef-7ed1a415d9bb` (database name: `training-partner`)
- **Cloudflare Account ID:** `8dcf6c4b57fae561e106304c7e8d36b0`
- **Current API Routes:**
  - `GET /api/health` — health check with DB status
  - `GET /api/meta` — product metadata
  - `GET /api/open-mats` — list active open mats from D1
  - `POST /api/founding/apply` — founding beta application (name, email, role required)
  - `POST /api/waitlist` — waitlist signup (email required)
- **Current D1 Tables:** `founding_applications`, `waitlist_signups`, `open_mats`
- **Legacy Python backend** (reference only, not deployed): Has user auth, match profiles, waitlist, open mats via SQLite — use as a reference for the data model but rewrite in JS for Cloudflare Workers
- **wrangler.toml:**
```toml
name = "training-partner-app"
main = "worker/index.js"
compatibility_date = "2026-03-09"
workers_dev = true

[assets]
directory = "./web"
binding = "ASSETS"

[[d1_databases]]
binding = "DB"
database_name = "training-partner"
database_id = "30d075cd-2994-4d08-8aef-7ed1a415d9bb"
migrations_dir = "./migrations"
```

**Your job:** Merge these into a single, production-ready application. The Next.js frontend should call the Cloudflare Worker API for all data operations. The Cloudflare Worker backend should be expanded with all necessary API routes. The D1 database schema should be expanded to support the full feature set.

**Design System:**
- Primary: `#FF4D00` (Fierce Orange)
- Accent: `#00FF88` (Electric Green)
- Background: `#0D0D0D` (Deep Black)
- Surface: `#1F1F1F` (Card backgrounds)
- Fonts: Bebas Neue (headings), DM Sans (body), JetBrains Mono (mono)
- Dark theme throughout — this is a combat sports app, keep it aggressive and bold

**Budget Constraint:** The owner is a student/nonprofit operator. All services must use free tiers. Use Cloudflare Workers free tier (100K requests/day), D1 free tier (5M rows read/day, 100K rows written/day), Lemon Squeezy (no upfront cost), and free-tier APIs.

---

## Improvement Areas

### 1. BACKEND & DATABASE — Expand Cloudflare Worker + D1 (Critical Priority)

**Current:** Cloudflare Worker has 5 basic API routes. D1 has 3 tables (founding_applications, waitlist_signups, open_mats). The legacy Python backend has auth/matching logic that hasn't been ported to the Worker yet.

**Required — Expand the D1 schema with these tables:**
- `users` (id, email, password_hash, display_name, avatar_url, city, created_at, updated_at, token)
- `user_profiles` (id, user_id FK, sports TEXT/JSON, skill_level, weight_class, training_goals TEXT/JSON, experience_years, bio, availability TEXT/JSON)
- `gyms` (id, name, address, city, state, lat, lng, phone, email, description, sports TEXT/JSON, amenities TEXT/JSON, verified INTEGER, premium INTEGER, rating REAL, price, owner_id FK)
- `gym_sessions` (id, gym_id FK, day_of_week, start_time, end_time, max_slots, current_slots)
- `bookings` (id, user_id FK, session_id FK, status, created_at)
- `matches` (id, user_a FK, user_b FK, score REAL, status, created_at)
- `messages` (id, sender_id FK, receiver_id FK, content, read INTEGER, created_at)
- `subscriptions` (id, user_id FK, plan, status, lemon_squeezy_id, expires_at)
- Keep existing tables: `founding_applications`, `waitlist_signups`, `open_mats`

**Required — Add these API routes to the Worker:**
- `POST /api/auth/register` — create user with hashed password (use Web Crypto API's PBKDF2, NOT sha256)
- `POST /api/auth/login` — authenticate, return JWT token
- `GET /api/auth/me` — get current user from Bearer token
- `PUT /api/profile` — update user profile (sports, skill, goals, availability)
- `GET /api/profile/:id` — get public profile
- `GET /api/partners` — list matched partners with filters (sport, skill, location)
- `GET /api/partners/:id` — get partner detail
- `GET /api/gyms` — list gyms with filters
- `GET /api/gyms/:id` — get gym detail
- `POST /api/bookings` — book a gym session
- `GET /api/bookings` — list user's bookings
- `GET /api/messages` — list conversations
- `GET /api/messages/:userId` — get messages with a specific user
- `POST /api/messages/:userId` — send a message
- `POST /api/subscriptions/webhook` — Lemon Squeezy webhook handler
- `GET /api/subscriptions/status` — check user's subscription

**Use D1 migrations** in `./migrations/` directory. Create `0002_full_schema.sql` for the expanded tables.

### 2. AUTHENTICATION (Critical Priority)

**Current:** Fake auth — signup creates a localStorage entry, signin checks it. No password hashing, no session management.

**Required:**
- Implement real auth in the Cloudflare Worker using Web Crypto API
- Password hashing with PBKDF2 (NOT sha256 — the legacy Python backend used sha256, upgrade this)
- JWT token issuance and verification (use `jose` library or Web Crypto API directly)
- Email verification flow (use Cloudflare Email Workers or Resend free tier)
- Password reset flow
- Update the Next.js frontend to:
  - Call Worker API for signup/signin instead of localStorage
  - Store JWT token in httpOnly cookie or secure localStorage
  - Add auth middleware to protected routes
  - Redirect unauthenticated users
- Rate limiting on auth endpoints (use Cloudflare's built-in rate limiting or a D1-backed counter)

### 3. CONNECT FRONTEND TO BACKEND (Critical Priority)

**Current:** All data is hardcoded in React components. Partners list has 8 fake entries. Gyms list has 5 fake entries.

**Required:**
- Create an API client utility (`lib/api.ts`) that:
  - Sets base URL to the Cloudflare Worker URL
  - Adds Bearer token header from stored JWT
  - Handles errors consistently
  - Returns typed responses
- Replace all hardcoded data in components with API calls:
  - `partners/page.tsx` → `GET /api/partners`
  - `gyms/page.tsx` → `GET /api/gyms`
  - `profile/page.tsx` → `GET/PUT /api/profile`
  - `app/page.tsx` (dashboard) → `GET /api/partners?limit=3` + `GET /api/gyms?limit=2`
  - `settings/page.tsx` → `GET/PUT /api/auth/me` + `GET /api/subscriptions/status`
- Remove all localStorage data operations (keep JWT storage only)
- Add loading states (skeleton loaders) for all data-fetching pages
- Add error states with retry buttons

### 4. PARTNER MATCHING ALGORITHM (High Priority)

**Current:** Hardcoded match percentages. The legacy Python backend has basic same-sport matching only.

**Required — implement in the Cloudflare Worker:**
- Real matching algorithm considering:
  - Sport overlap (weighted 30%) — multi-sport users get partial credit
  - Skill level compatibility (weighted 20%) — same or ±1 level scores high
  - Weight class proximity (weighted 15%)
  - City/location match (weighted 15%)
  - Training goal alignment (weighted 10%)
  - Availability overlap (weighted 10%) — compare weekly schedules
- Store computed match scores in the `matches` table
- Recompute when a user updates their profile
- API: `GET /api/partners?sort=match_score&sport=BJJ&skill=Advanced`
- Add "match explanation" to API response — why they matched

### 5. MESSAGING SYSTEM (High Priority)

**Current:** "Send Message" button exists but does nothing.

**Required:**
- API routes for messaging (listed in section 1)
- Frontend: conversation list page, message thread page
- Polling-based updates (Cloudflare Workers don't support WebSockets on free tier — poll every 10 seconds)
- Message read receipts (mark as read when viewed)
- Unread message count badge in sidebar nav
- Block/report user functionality
- Conversation list with last message preview

### 6. PAYMENT PROCESSING (High Priority)

**Current:** Pricing UI shows Free and $20/mo Premium tiers. No payment integration.

**Required:**
- Integrate Lemon Squeezy for subscription management
- Two tiers:
  - **Free:** Basic partner matching (5 matches/day), no gym access
  - **Premium ($20/month):** Unlimited matches, full gym directory, priority messaging, verified badge
- Lemon Squeezy webhook handler in the Worker (`POST /api/subscriptions/webhook`)
- Subscription status check middleware — gate premium features in both Worker and frontend
- Billing history from Lemon Squeezy API
- Trial period option (7-day free trial)
- Update `settings/page.tsx` subscription tab with real data
- Update `gyms/page.tsx` premium locking to check real subscription status

### 7. UI/UX IMPROVEMENTS (High Priority)

**Current:** Functional but basic. No loading states, no animations beyond CSS.

**Required:**
- **Loading States:** Skeleton loaders for all data-fetching pages
- **Empty States:** Meaningful designs for no matches, no messages, empty profile
- **Error Handling:** Toast notifications for actions (saved, error, etc.) — use `sonner` or similar
- **Responsive Polish:** Test all pages at 375px, 768px, 1280px+
- **Accessibility:** ARIA labels, keyboard navigation, focus management
- **Animations:** Framer Motion for page transitions, modal animations, card hover effects
- **Onboarding Flow:** Multi-step guided profile setup for new users
- **Profile Completeness Indicator:** Show % and prompt to fill missing sections
- **Search UX:** Debounced search, search history
- **Infinite Scroll:** For partners and gyms lists
- **Micro-interactions:** Button press effects, toggle animations, success checkmarks

### 8. GYM FEATURES (Medium Priority)

**Current:** Static gym cards with hardcoded data. Booking button non-functional.

**Required:**
- Real gym data from D1 database
- Gym owner portal (separate role):
  - Add/edit gym profile
  - Manage open mat sessions (CRUD)
  - View bookings
- User features:
  - Map view with gym locations (Mapbox GL JS free tier — 50K loads/month)
  - Gym search with filters (sport, distance, price, rating)
  - Real booking flow: select session → confirm → receive confirmation
  - Gym reviews and ratings
  - Favorite gyms

### 9. INFORMATION SECURITY (Medium Priority)

**Current:** No security measures. Plain text passwords in localStorage.

**Required:**
- PBKDF2 password hashing in the Worker (Web Crypto API)
- JWT tokens with expiration
- Input sanitization on all API routes
- CORS configuration on the Worker (allow only your frontend domain)
- Content Security Policy headers
- Rate limiting on auth and form submission endpoints
- File upload validation for avatars (type, size limits)
- Environment variable management (Cloudflare Worker secrets for API keys)
- Don't expose exact user location — show city only

### 10. SOCIAL MEDIA INTEGRATION (Medium Priority)

**Current:** No social features.

**Required:**
- Share profile link (public profile URL)
- Invite friends via link
- Open Graph meta tags for link previews when sharing
- Referral program: invite a friend, both get 1 week free Premium
- Social proof on landing page ("X athletes signed up this week")

### 11. SEO & MARKETING (Medium Priority)

**Current:** Basic meta tags in layout.tsx. No structured data.

**Required:**
- Dynamic meta tags per page
- JSON-LD structured data (Organization, SportsActivityLocation for gyms, WebApplication)
- XML sitemap generation
- robots.txt
- Analytics (Plausible or Umami free tier — privacy-friendly)
- Conversion tracking for signups

### 12. PERFORMANCE OPTIMIZATION (Low Priority)

**Required:**
- Dynamic imports for heavy components (modals, maps)
- Image optimization with next/image
- Service worker for offline support
- Bundle analysis
- Core Web Vitals optimization (target all green)

### 13. TESTING (Low Priority)

**Required:**
- Unit tests for matching algorithm
- API route tests (use `vitest` for Worker testing with `miniflare`)
- Component tests for key UI components
- E2E tests for critical flows (Playwright)

### 14. NOTIFICATIONS SYSTEM (Low Priority)

**Current:** Notification toggle switches in settings but no system.

**Required:**
- In-app notification center (bell icon with badge)
- Types: new match, message received, booking confirmed, session reminder
- Email notifications (Resend free tier — 100 emails/day)
- Notification preferences that actually control delivery

---

## Architecture Decision: Deployment Strategy

**Option A (Recommended): Monorepo with Cloudflare Pages + Workers**
- Deploy the Next.js frontend via Cloudflare Pages (uses `@cloudflare/next-on-pages`)
- The Worker API runs alongside via Cloudflare Workers
- D1 database for all data
- Single deployment pipeline via `wrangler pages deploy`
- Add `wrangler.toml` to this repo with the existing D1 binding

**Option B: Split deployment**
- Next.js frontend on Vercel (free tier)
- Cloudflare Worker API at `api.trainingpartner.app` or `training-partner-app.workers.dev`
- CORS configured to allow Vercel domain
- Two separate deploy pipelines

Pick Option A if Cloudflare Pages supports Next.js 14 App Router well enough. Pick Option B if there are compatibility issues. Both are free tier.

---

## File Structure (Current Frontend)

```
training-partner/
├── src/app/
│   ├── page.tsx              # Landing page (~430 lines)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles, animations
│   ├── auth/
│   │   ├── signup/page.tsx   # Sign up (localStorage — replace with API)
│   │   └── signin/page.tsx   # Sign in (localStorage — replace with API)
│   ├── app/
│   │   ├── layout.tsx        # App shell with sidebar + auth check
│   │   ├── page.tsx          # Dashboard with hardcoded demo data
│   │   ├── profile/page.tsx  # Profile editor (localStorage — replace with API)
│   │   ├── partners/page.tsx # Partner matching (8 hardcoded partners — replace)
│   │   ├── gyms/page.tsx     # Gym listings (5 hardcoded gyms — replace)
│   │   └── settings/page.tsx # Settings (6 tabs, mostly non-functional)
│   ├── terms/page.tsx        # Terms of Service (keep — has liability waiver)
│   └── privacy/page.tsx      # Privacy Policy (keep)
├── package.json
├── tailwind.config.ts        # Custom colors, fonts — extend, don't replace
├── next.config.js
├── SPEC.md                   # Product specification (reference)
└── SETUP.md                  # Deployment guide (update after changes)
```

## Existing Worker Code Reference

The Cloudflare Worker at `worker/index.js` currently handles 5 routes. Here's the existing pattern to follow when adding new routes:

```javascript
// Helper functions already exist: json(), readJson(), normalizeText(), isoNow()
// ensureSchema() auto-creates tables if D1 is bound
// env.DB is the D1 binding, env.ASSETS serves static files

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Route matching pattern:
    if (url.pathname === '/api/endpoint' && request.method === 'GET') {
      return handleEndpoint(request, env);
    }
    // Fallback to static assets
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  }
};
```

## Legacy Python Backend Reference (data model only — rewrite in JS)

The Python `tp_storage.py` has these tables already designed:
- `users` (id, email, password_hash, display_name, city, token)
- `match_profiles` (id, user_id, sport, skill_level, weight_class, partner_pool, travel_radius_miles, city)
- `waitlist` (id, display_name, email, city, sport, level, weight_class)
- `open_mats` (id, user_id, gym_name, city, sport, schedule_text, notes)

The Python `app.py` has these API routes:
- `POST /api/v1/auth/register` — create user
- `POST /api/v1/auth/login` — authenticate
- `POST /api/v1/match-profiles` — upsert profile
- `GET /api/v1/matches` — get matches (basic same-sport filter)
- `POST /api/v1/waitlist` — join waitlist
- `POST /api/v1/open-mats` — create open mat
- `GET /api/v1/open-mats` — list open mats

Port these to the Cloudflare Worker, but improve the matching algorithm (section 4) and use proper password hashing (PBKDF2, not sha256).

## Constraints

- **Budget:** $0. Use only free tiers (Cloudflare Workers Free, D1 Free, Lemon Squeezy, free map APIs)
- **No breaking the existing UI:** Improve it, don't redesign from scratch. Keep the dark theme and color scheme.
- **Mobile-first:** Most users will be on phones at the gym
- **Combat sports culture:** The branding should feel tough, aggressive, athletic — not corporate
- **Legal:** Terms of Service includes a liability waiver for combat sports injuries — don't remove it
- **Cloudflare-first:** Use Cloudflare Workers + D1 as the backend. Do NOT introduce Supabase, Firebase, or other external databases.

## Success Criteria

After your improvements, the app should:
1. Allow real users to sign up, verify email, and create persistent profiles stored in Cloudflare D1
2. Match users with compatible training partners using a real weighted algorithm
3. Enable messaging between matched partners
4. Show real gym data with functional booking via the Worker API
5. Process $20/month Premium subscriptions via Lemon Squeezy
6. Be secure (PBKDF2 passwords, JWT auth, input sanitization, CORS)
7. Score 90+ on all Lighthouse metrics
8. Work flawlessly on mobile devices
9. Have proper SEO for organic discovery
10. Deploy to Cloudflare (Pages + Workers + D1) with zero external dependencies
