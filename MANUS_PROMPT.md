# Manus Task: Training Partner App — Frontend Polish & Improvements

## Context
You are working on **Training Partner** (https://github.com/oelor/training-partner), a combat sports training partner matching platform. The app is LIVE and functional — backend API, auth, Stripe payments, database are all working.

**Branch:** `feature/alpha-polish` — work here, NOT main
**Live frontend:** https://training-partner.vercel.app
**Live API:** https://trainingpartner.app/api/health
**Repo:** https://github.com/oelor/training-partner.git

**Stack:**
- Frontend: Next.js 14.2.5, React 18, Tailwind CSS 3, TypeScript, Lucide React icons
- Backend: Cloudflare Worker (worker/index.js) — already deployed, DO NOT MODIFY
- Database: Cloudflare D1 — already has full schema with 30+ tables
- Payments: Stripe (test mode) — products, prices, checkout, webhooks all wired

**Design system:** Dark theme only
- Background: `#0D0D0D`, Surface: `#1F1F1F`, Primary: `#FF4D00` (orange), Accent: `#00FF88` (green)
- Fonts: Bebas Neue (headings), DM Sans (body), JetBrains Mono (mono)
- Border: `#333333`, Text secondary: `#A0A0A0`

## ⚠️ TOKEN AWARENESS — CRITICAL
You have limited tokens. Follow these rules strictly:
1. **Before starting:** `git pull origin feature/alpha-polish`
2. **Commit every 3-5 file changes:** `git add [files] && git commit -m "improve: [description]" && git push origin feature/alpha-polish`
3. **Run `npm run build` before each push** to catch TypeScript errors
4. **At 70-80% token usage**, STOP new work immediately and do a final commit+push
5. **Never leave uncommitted work** — if in doubt, commit and push

## 🚫 DO NOT MODIFY These Files
- `worker/index.js` — backend is deployed and working perfectly
- `wrangler.toml` — infrastructure config
- `src/lib/api.ts` — API client is tested and correct
- `.env.local` — local dev config

## Priority 1: Fix Broken Images (DO FIRST)

### 1a. Delete unused image
```bash
rm public/images/feature-cards.png
```
This file has a "YOGA" label and is no longer referenced anywhere.

### 1b. Fix `public/images/gym-interior.png`
Has a visible "WWW.REALLYGREATSITE.COM" watermark at the bottom. Options:
- **Best:** Replace the "TRAIN AT THE BEST GYMS" section in `src/app/page.tsx` (~line 491-506) with a pure CSS/code visual. Use a gradient card with grid lines or geometric shapes that match the dark/neon aesthetic. No external images needed.
- **Alternative:** If you can generate images, create a dark moody gym interior with mats and dramatic orange/green lighting. Absolutely NO text or watermarks.

### 1c. Fix `public/images/app-mockup.png`
Shows "FitMatch App" at the bottom — wrong product. Options:
- **Best:** Replace the CTA section in `src/app/page.tsx` (~line 537-580) with a code-based phone mockup. Use a rounded div styled like a phone screen showing fake UI elements (match cards, green "Connect" button, etc.) built with Tailwind. No image needed.
- **Alternative:** If you can generate images, create a dark phone mockup showing "Training Partner" branding with orange/green colors and match percentage UI.

### 1d. Fix `public/images/hero-banner.png`
Has truncated "Welcome to" text. Used at 20% opacity as hero background. Options:
- **Best:** Remove the `<Image>` tag from the hero section (~lines 104-112 in page.tsx) and rely on the existing gradient overlay + CSS pattern background. The hero already looks good without it.
- **Alternative:** Replace with an abstract image — dark combat sports silhouettes with neon accents, NO text whatsoever.

After fixing images, commit and push immediately.

## Priority 2: Empty States & UX (IMPORTANT)

When a new user signs up and enters the app, most pages are empty. Add meaningful empty states to these pages:

### 2a. Partners page (`src/app/app/partners/page.tsx`, 159 lines)
When no partners are found, show: icon + "No training partners found yet" + "Complete your profile to get matched" + link to /app/profile

### 2b. Messages page (`src/app/app/messages/page.tsx`, 253 lines)
When no conversations exist: icon + "No conversations yet" + "Find a training partner and send them a message" + link to /app/partners

### 2c. Bookings page (`src/app/app/bookings/page.tsx`, 149 lines)
When no bookings exist: icon + "No bookings yet" + "Browse gyms to book your first session" + link to /app/gyms

### 2d. Community page (`src/app/app/community/page.tsx`, 275 lines)
When no posts exist: icon + "No posts yet" + "Be the first to share something with the community" + link to /app/community/create

### 2e. Notifications page (`src/app/app/notifications/page.tsx`, 196 lines)
When no notifications: icon + "All caught up!" + "You'll see notifications here when something happens"

Use Lucide React icons (already imported in most pages). Match the dark theme. Keep empty states simple — icon, heading, description, optional CTA button.

## Priority 3: Mobile Responsiveness Fixes

Test at 375px width mentally and fix:

### 3a. Dashboard (`src/app/app/page.tsx`, 365 lines)
- Stat cards grid should be `grid-cols-2` on mobile, not overflow
- Quick action buttons should wrap

### 3b. Settings page (`src/app/app/settings/page.tsx`, 542 lines)
- Tab navigation should scroll horizontally on mobile or stack
- Form inputs should be full-width on mobile

### 3c. Partner detail (`src/app/app/partners/[id]/page.tsx`, 305 lines)
- Profile header should stack (avatar above name) on mobile
- Action buttons should be full-width

## Priority 4: Navigation & Layout Polish

### 4a. App layout
Check `src/app/app/` for a layout file. If there's no sidebar/bottom nav for the app section, consider adding a simple bottom navigation bar for mobile with icons for: Dashboard, Partners, Messages, Profile (4 items max).

### 4b. Back buttons
Detail pages (`/app/partners/[id]`, `/app/gyms/[id]`) should have a back button/link at the top.

### 4c. Active state
If there's a navigation component, the current page should be highlighted.

## Priority 5: Content & Copy Fixes

### 5a. Footer waiver link
The footer in `src/app/page.tsx` links to `/waiver` but this page may not exist. Either:
- Create `src/app/waiver/page.tsx` with a basic liability waiver for combat sports
- Or change the link to `/terms` (terms page likely already covers this)

### 5b. Supported sports list
Verify these are actual combat sports only (no yoga, no fitness, no crossfit). Current list:
Wrestling, MMA, Brazilian Jiu-Jitsu, Boxing, Kickboxing, Judo, Taekwondo, Karate, Sambo, Muay Thai, Capoeira, Kung Fu ← this is correct

### 5c. Legal pages
Check `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` — if they're placeholder/lorem ipsum, write real content for a combat sports platform. Include:
- Privacy: data collection, cookies, third-party services (Stripe, Cloudflare)
- Terms: liability waiver for injuries, age requirements (18+), code of conduct, account termination

## Priority 6: Code Quality (only if time remains)

### 6a. Remove unused imports
Check each page for imported but unused components/icons.

### 6b. Consistent error handling
Check that pages with API calls have try/catch with user-friendly error messages shown via toast.

### 6c. Accessibility basics
- All `<img>` tags should have meaningful alt text
- Form inputs should have labels
- Buttons should have aria-labels if icon-only
- Focus states should be visible (Tailwind `focus:ring-2 focus:ring-primary`)

## File Map
```
src/app/page.tsx                      — Landing page (635 lines) ← fix images here
src/app/globals.css                   — CSS variables + animations (215 lines)
src/app/layout.tsx                    — Root layout
src/app/providers.tsx                 — Auth context provider
src/lib/api.ts                        — API client (DO NOT MODIFY)
src/lib/auth-context.tsx              — Auth state management
src/app/app/page.tsx                  — Dashboard (365 lines)
src/app/app/settings/page.tsx         — Settings + billing (542 lines)
src/app/app/onboarding/page.tsx       — New user onboarding (436 lines)
src/app/app/partners/page.tsx         — Partner search (159 lines)
src/app/app/partners/[id]/page.tsx    — Partner detail (305 lines)
src/app/app/messages/page.tsx         — Messaging (253 lines)
src/app/app/gyms/page.tsx             — Gym listings (134 lines)
src/app/app/gyms/[id]/page.tsx        — Gym detail (370 lines)
src/app/app/bookings/page.tsx         — Bookings (149 lines)
src/app/app/community/page.tsx        — Community posts (275 lines)
src/app/app/community/create/page.tsx — Create post (174 lines)
src/app/app/profile/page.tsx          — Profile editor (455 lines)
src/app/app/admin/page.tsx            — Admin dashboard (276 lines)
src/app/app/notifications/page.tsx    — Notifications (196 lines)
src/app/app/invite/page.tsx           — Invite codes (201 lines)
src/app/app/support/page.tsx          — Support/donate (324 lines)
src/app/auth/signup/page.tsx          — Registration (234 lines)
src/app/auth/signin/page.tsx          — Login (166 lines)
src/app/auth/forgot-password/page.tsx — Password reset request (109 lines)
src/app/auth/reset-password/page.tsx  — Password reset form (163 lines)
src/app/auth/verify-email/page.tsx    — Email verification (112 lines)
src/app/contact/page.tsx              — Contact page
src/app/privacy/page.tsx              — Privacy policy
src/app/terms/page.tsx                — Terms of service
src/app/partners/[sport]/page.tsx     — SEO: sport landing pages
src/app/partners/[sport]/[city]/page.tsx — SEO: city landing pages
src/components/toast.tsx              — Toast notifications
src/components/skeleton.tsx           — Loading skeletons
src/components/feedback-widget.tsx    — Feedback widget
src/components/comment-section.tsx    — Post comments
src/components/report-dialog.tsx      — Report user dialog
src/components/share-button.tsx       — Share functionality
src/components/error-boundary.tsx     — Error boundary
src/components/google-signin.tsx      — Google OAuth button
src/components/turnstile.tsx          — Cloudflare Turnstile CAPTCHA
tailwind.config.ts                    — Theme config (colors, fonts, animations)
public/images/                        — Static images (fix broken ones!)
```

## Rules Summary
1. Work on branch `feature/alpha-polish`
2. DO NOT modify: `worker/index.js`, `wrangler.toml`, `src/lib/api.ts`, `.env*`
3. Commit and push every 3-5 file changes
4. Run `npm run build` before pushing
5. Dark theme only — use existing color variables
6. No new npm dependencies unless truly necessary
7. Combat sports focused — never mention yoga, fitness, crossfit
8. When low on tokens → final commit+push immediately
9. All images must have NO text and NO watermarks
10. Keep it aggressive and athletic in tone — this is for fighters, not a wellness app
