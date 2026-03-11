# Manus AI — Training Partner Comprehensive Improvement Prompt

## Project Overview

You are working on **Training Partner** — a two-sided marketplace web application that connects combat sports athletes (wrestling, MMA, BJJ, boxing, kickboxing, judo, etc.) with compatible training partners and partner gyms offering open mat hours. The app is live at the GitHub repo `oelor/training-partner`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Lucide React icons, clsx.

**Current State:** The app is a fully functional frontend prototype with hardcoded demo data and localStorage-based auth. There is NO backend, NO database, NO real authentication, and NO payment processing. Your job is to transform this into a production-ready application.

**Design System:**
- Primary: `#FF4D00` (Fierce Orange)
- Accent: `#00FF88` (Electric Green)
- Background: `#0D0D0D` (Deep Black)
- Surface: `#1F1F1F` (Card backgrounds)
- Fonts: Bebas Neue (headings), DM Sans (body), JetBrains Mono (mono)
- Dark theme throughout — this is a combat sports app, keep it aggressive and bold

**Budget Constraint:** The owner is a student/nonprofit operator. All services must use free tiers or minimal-cost options. Prefer Supabase (free tier), Vercel (free tier), Lemon Squeezy (no upfront cost), and free-tier APIs.

---

## Improvement Areas

### 1. BACKEND & DATABASE (Critical Priority)

**Current:** All data is in localStorage with hardcoded demo arrays. No persistence, no multi-user support.

**Required:**
- Set up Supabase project with PostgreSQL database
- Design and implement database schema:
  - `users` table (id, email, name, age, location, bio, avatar_url, created_at, updated_at)
  - `user_profiles` table (user_id FK, sports[], skill_level, weight_class, training_goals[], experience_years, availability JSONB)
  - `gyms` table (id, name, address, city, state, lat, lng, phone, email, description, sports[], amenities[], verified, premium, rating, price, owner_id FK)
  - `gym_sessions` table (id, gym_id FK, day_of_week, start_time, end_time, max_slots, current_slots)
  - `bookings` table (id, user_id FK, session_id FK, status, created_at)
  - `matches` table (id, user_a FK, user_b FK, score, status, created_at)
  - `messages` table (id, sender_id FK, receiver_id FK, content, read, created_at)
  - `subscriptions` table (id, user_id FK, plan, status, lemon_squeezy_id, expires_at)
- Set up Row Level Security (RLS) policies for all tables
- Create database indexes for common queries (location-based, sport filtering)
- Replace all localStorage calls with Supabase client queries
- Add real-time subscriptions for messages and match notifications

### 2. AUTHENTICATION & USER MANAGEMENT (Critical Priority)

**Current:** Fake auth — signup creates a localStorage entry, signin checks it. No email verification, no password hashing, no session management.

**Required:**
- Integrate Supabase Auth (email/password + Google OAuth + Apple Sign-In)
- Email verification flow
- Password reset flow
- Protected route middleware (redirect unauthenticated users)
- Session persistence with Supabase Auth tokens
- User avatar upload (Supabase Storage)
- Account deletion flow (GDPR-compliant data removal)
- Rate limiting on auth endpoints

### 3. PARTNER MATCHING ALGORITHM (High Priority)

**Current:** Hardcoded match percentages in demo data. No real algorithm.

**Required:**
- Implement a real matching algorithm considering:
  - Sport overlap (weighted heavily)
  - Skill level compatibility (same level or one level apart scores higher)
  - Weight class proximity
  - Geographic distance (use PostGIS or Haversine formula)
  - Training goal alignment
  - Availability overlap (compare weekly schedules)
  - Experience level compatibility
- Store match scores in database, update when profiles change
- Add "match explanation" — show users WHY they matched (e.g., "Both train BJJ, similar weight class, 3 overlapping time slots")
- Implement swipe/like/pass interaction for partner discovery
- Mutual match notification system

### 4. MESSAGING SYSTEM (High Priority)

**Current:** "Send Message" button exists but does nothing.

**Required:**
- Real-time messaging using Supabase Realtime
- Conversation threads between matched partners
- Message read receipts
- Typing indicators
- Image sharing in messages
- Message notifications (in-app + email digest)
- Block/report user functionality
- Conversation list with last message preview and unread count

### 5. PAYMENT PROCESSING (High Priority)

**Current:** Pricing UI shows Free and $20/mo Premium tiers. No payment integration.

**Required:**
- Integrate Lemon Squeezy for subscription management
- Implement two tiers:
  - **Free:** Basic partner matching (limited to 5 matches/day), no gym access
  - **Premium ($20/month):** Unlimited matches, full gym directory, priority messaging, verified badge
- Webhook handling for subscription events (created, renewed, cancelled, failed)
- Subscription status check middleware (gate premium features)
- Billing history page with invoice downloads
- Trial period option (7-day free trial of Premium)
- Cancellation flow with feedback survey
- Proration handling for plan changes

### 6. UI/UX IMPROVEMENTS (High Priority)

**Current:** Functional but basic. Some rough edges, no loading states, no animations beyond CSS.

**Required:**
- **Loading States:** Add skeleton loaders for all data-fetching pages (partners list, gyms list, dashboard)
- **Empty States:** Design meaningful empty states for no matches, no messages, empty profile
- **Error Handling:** User-friendly error boundaries, toast notifications for actions (saved, error, etc.)
- **Responsive Polish:** Test and fix all pages at mobile (375px), tablet (768px), and desktop (1280px+)
- **Accessibility:** Add ARIA labels, keyboard navigation, focus management, screen reader support
- **Animations:** Add Framer Motion for page transitions, modal animations, card hover effects
- **Image Optimization:** Use Next.js Image component for all images, add blur placeholders
- **Dark/Light Mode:** Add theme toggle (dark is default, but some users prefer light)
- **Onboarding Flow:** Multi-step guided profile setup for new users (sport → skill → goals → availability → bio)
- **Profile Completeness Indicator:** Show percentage and prompt users to fill missing sections
- **Search UX:** Add debounced search, search history, suggested searches
- **Infinite Scroll:** Replace static lists with infinite scroll for partners and gyms
- **Pull to Refresh:** Mobile gesture support
- **Micro-interactions:** Button press effects, toggle animations, success checkmarks

### 7. GYM FEATURES (Medium Priority)

**Current:** Static gym cards with hardcoded data. Booking button is non-functional.

**Required:**
- Real gym data from database
- Gym owner dashboard (separate role/portal):
  - Add/edit gym profile
  - Manage open mat sessions (CRUD)
  - View bookings and attendance
  - Revenue analytics
- User-facing features:
  - Map view with gym locations (use Mapbox or Google Maps free tier)
  - Gym search with filters (sport, distance, price, rating, availability)
  - Real booking flow with slot management
  - Booking confirmation emails
  - Check-in/check-out system
  - Gym reviews and ratings
  - Favorite gyms list

### 8. INFORMATION SECURITY (Medium Priority)

**Current:** No security measures whatsoever. Plain text everything.

**Required:**
- Input sanitization on all forms (prevent XSS)
- CSRF protection
- Rate limiting on API routes
- Content Security Policy headers
- Secure cookie configuration
- SQL injection prevention (Supabase handles this, but verify)
- File upload validation (type, size limits for avatars)
- Environment variable management (.env.local for secrets)
- HTTPS enforcement
- Data encryption at rest (Supabase default)
- Privacy-first design:
  - Don't expose exact location (show distance only)
  - Allow hiding profile from search
  - Allow blocking users
  - Data export functionality
  - Account deletion with full data purge

### 9. SOCIAL MEDIA INTEGRATION (Medium Priority)

**Current:** No social features.

**Required:**
- Share profile link (generate public profile URL)
- Social login (Google, Apple — via Supabase Auth)
- Invite friends via link/SMS/email
- Social proof: "X athletes in your area" on landing page
- Instagram integration: link Instagram profile, show recent posts on profile
- Share match achievements ("Found my new training partner on Training Partner!")
- Open Graph meta tags for link previews when sharing
- Referral program: invite a friend, both get 1 week free Premium

### 10. SEO & MARKETING (Medium Priority)

**Current:** Basic meta tags in layout.tsx. No structured data, no sitemap.

**Required:**
- Dynamic meta tags per page (title, description, OG image)
- Structured data (JSON-LD) for:
  - Organization
  - SportsActivityLocation (for gyms)
  - WebApplication
- XML sitemap generation
- robots.txt
- Blog/content section for SEO (training tips, gym spotlights)
- Landing page A/B testing capability
- Analytics integration (Plausible or Umami — privacy-friendly, free tier)
- Conversion tracking for signups

### 11. PERFORMANCE OPTIMIZATION (Low Priority)

**Current:** Static build, decent performance. No optimization.

**Required:**
- Implement ISR (Incremental Static Regeneration) for gym pages
- Dynamic imports for heavy components (modals, maps)
- Image optimization with next/image and WebP/AVIF
- Bundle analysis and tree shaking
- Service worker for offline support
- Cache API responses appropriately
- Lazy load below-fold content
- Core Web Vitals optimization (target all green)

### 12. TESTING (Low Priority)

**Current:** No tests.

**Required:**
- Unit tests for matching algorithm (Jest)
- Component tests for key UI components (React Testing Library)
- Integration tests for auth flows
- E2E tests for critical user journeys (Playwright):
  - Sign up → Complete profile → Find partner → Send message
  - Sign up → Subscribe → Access premium gyms → Book session
- API route tests
- Accessibility tests (axe-core)

### 13. NOTIFICATIONS SYSTEM (Low Priority)

**Current:** Notification toggle switches in settings but no notification system.

**Required:**
- In-app notification center (bell icon with badge)
- Notification types:
  - New match found
  - Message received
  - Booking confirmed
  - Gym session reminder
  - Subscription renewal reminder
- Email notifications (via Resend or Supabase email)
- Push notifications (web push API)
- Notification preferences that actually control delivery

### 14. ADMIN DASHBOARD (Low Priority)

**Current:** No admin functionality.

**Required:**
- Admin role with separate dashboard
- User management (view, suspend, delete)
- Gym verification workflow (review applications)
- Content moderation (reported users/messages)
- Analytics dashboard (signups, active users, revenue, popular sports)
- System health monitoring

---

## Implementation Priority Order

1. **Supabase setup** (database + auth) — everything depends on this
2. **Authentication** — real signup/signin/session management
3. **Database migration** — move all hardcoded data to Supabase
4. **Partner matching algorithm** — core value proposition
5. **Messaging system** — enables user engagement
6. **Payment processing** — enables revenue
7. **UI/UX polish** — improves retention
8. **Security hardening** — protects users
9. **Gym features** — expands platform value
10. **Social & SEO** — grows user base
11. **Notifications** — improves engagement
12. **Performance & Testing** — ensures reliability
13. **Admin dashboard** — enables operations

---

## File Structure (Current)

```
training-partner/
├── src/app/
│   ├── page.tsx              # Landing page (~430 lines)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles, animations
│   ├── auth/
│   │   ├── signup/page.tsx   # Sign up (localStorage)
│   │   └── signin/page.tsx   # Sign in (localStorage)
│   ├── app/
│   │   ├── layout.tsx        # App shell with sidebar
│   │   ├── page.tsx          # Dashboard with demo data
│   │   ├── profile/page.tsx  # Profile editor
│   │   ├── partners/page.tsx # Partner matching (8 hardcoded partners)
│   │   ├── gyms/page.tsx     # Gym listings (5 hardcoded gyms)
│   │   └── settings/page.tsx # Settings (6 tabs, non-functional)
│   ├── terms/page.tsx        # Terms of Service
│   └── privacy/page.tsx      # Privacy Policy
├── package.json              # Next.js 14, React 18, Tailwind, Lucide
├── tailwind.config.ts        # Custom colors, fonts, animations
├── next.config.js            # Image domains config
├── SPEC.md                   # Product specification
├── SETUP.md                  # Deployment guide
└── README.md                 # Overview
```

## Key Technical Notes

- All demo data is hardcoded in component files (partners in partners/page.tsx, gyms in gyms/page.tsx)
- Auth check in app/layout.tsx reads `trainingPartnerUser` from localStorage
- Profile saves to localStorage with key `trainingPartnerUser`
- The `isPremium` flag is hardcoded to `false` in gyms/page.tsx
- No API routes exist — all logic is client-side
- Tailwind config has custom theme extending default — don't replace, extend
- The app uses App Router (not Pages Router) — all routes are in `src/app/`
- Currently builds and deploys successfully as a static Next.js app

## Constraints

- **Budget:** $0. Use only free tiers (Supabase Free, Vercel Free, Lemon Squeezy, free map APIs)
- **No breaking the existing UI:** Improve it, don't redesign from scratch. Keep the dark theme and color scheme.
- **Mobile-first:** Most users will be on phones at the gym
- **Combat sports culture:** The branding should feel tough, aggressive, athletic — not corporate or soft
- **Legal:** Terms of Service includes a liability waiver for combat sports injuries — this is important, don't remove it

## Success Criteria

After your improvements, the app should:
1. Allow real users to sign up, verify email, and create persistent profiles
2. Match users with compatible training partners using a real algorithm
3. Enable real-time messaging between matched partners
4. Show real gym data with functional booking
5. Process $20/month Premium subscriptions via Lemon Squeezy
6. Be secure enough for production use
7. Score 90+ on all Lighthouse metrics
8. Work flawlessly on mobile devices
9. Have proper SEO for organic discovery
10. Be deployable to Vercel with zero configuration
