# Trust & Safety System — Design Spec

**Date:** 2026-03-14
**Path:** B (Trust First)
**Status:** Approved

## Overview

Add identity verification, reputation system, emergency safety features, blocking, age gates, legal hardening, and content moderation to Training Partner. Also restore combat sports athlete silhouette decorations to the landing page as inline SVGs.

## 1. Identity Verification

### Database
- New `identity_verifications` table: `id`, `user_id`, `id_photo` (base64, max 200KB), `selfie_photo` (base64, max 200KB), `status` (pending/approved/rejected/expired), `reviewer_notes`, `reviewed_by`, `created_at`, `reviewed_at`
- New `verified` INTEGER field on `users` table (0/1)

### Flow
1. Settings → "Verify Your Identity" section
2. Upload government ID photo + selfie photo
3. Status: pending → admin reviews in admin panel → approved/rejected
4. Approved: green "Verified" badge appears on profile across platform
5. Progressive gates: soft prompts at key moments (first 1-on-1 booking, first message to stranger) — never blocking

### Security
- Images stored as base64 in D1 for alpha (size-limited 200KB each)
- Only accessible by the user and admins
- Auto-deleted 90 days after approval (retention policy)
- User can delete ID data anytime via Settings
- State-specific disclosures for IL BIPA, TX CUBI, WA biometric laws

### API Endpoints
- `POST /api/identity/submit` — upload ID + selfie
- `GET /api/identity/status` — check verification status
- `DELETE /api/identity/data` — delete ID data
- `GET /api/admin/identity/pending` — list pending verifications (admin)
- `PUT /api/admin/identity/:id/review` — approve/reject (admin)

## 2. Reputation System (Thumbs Up/Down)

### Database
- New `session_ratings` table: `id`, `rater_id`, `rated_id`, `gym_id` (nullable), `rating` (1 or -1), `created_at`
- Unique constraint: `(rater_id, rated_id, DATE(created_at))` — one per pair per day

### Mutual Unlock Logic
- Rating button appears ONLY if both users checked in at same gym on same calendar day, OR both confirmed a scheduled session
- Query: check `checkins` table for matching `gym_id` and `DATE(created_at)` for both users

### 10-Session Protection
- User's trust score hidden until they have ≥10 total check-ins
- Before 10: blurred placeholder with "🔒 Trust score unlocks after 10 sessions"
- After 10: "👍 92% positive (24 ratings)"
- Raw thumbs up/down count never shown — only percentage

### Anti-Gaming
- One rating per pair per day (DB unique constraint)
- Mutual unlock prevents drive-by ratings
- Ratings are anonymous — user sees aggregate only, not individual raters

### API Endpoints
- `POST /api/ratings` — submit rating (validates mutual unlock)
- `GET /api/ratings/score/:userId` — get user's trust score (respects 10-session threshold)
- `GET /api/ratings/can-rate/:userId` — check if current user can rate target

## 3. Emergency Contact & Safety Check-in

### Database
- New fields on `users`: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`

### Emergency Contact
- Set in Settings → "Safety" section
- Visible to training partner only during active/confirmed session window
- Hidden after session window passes

### Safety Check-in
- After scheduled session's end time: in-app notification "Session complete? Confirm you're safe"
- Second prompt after 2 hours if not confirmed
- No automatic emergency contact notification at alpha (avoid false positives)
- Future: optional SMS to emergency contact after 4 hours

### API Endpoints
- `PUT /api/profile/emergency-contact` — set/update emergency contact
- `GET /api/session/:id/emergency-contact` — get partner's emergency contact (only during session)
- `POST /api/session/:id/safe` — confirm safe after session

## 4. Block System

### Database
- New `blocks` table: `id`, `blocker_id`, `blocked_id`, `created_at`
- Unique constraint: `(blocker_id, blocked_id)`

### Behavior
- Block from user profile or report flow
- Mutual invisibility: blocked user disappears from partner matching, messages, discovery
- Existing conversations hidden (not deleted — preserved for moderation)
- Silent blocking — blocked user sees no indication
- Unblock available in Settings → "Blocked Users"

### API Endpoints
- `POST /api/blocks` — block user
- `DELETE /api/blocks/:userId` — unblock user
- `GET /api/blocks` — list blocked users

### Integration Points
- Partner matching queries: `WHERE id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ? UNION SELECT blocker_id FROM blocks WHERE blocked_id = ?)`
- Message queries: same filter
- Gym member lists: blocked users still show in gym context (can't block gym members from gym features)

## 5. Age Gate

### Database
- New `date_of_birth` TEXT field on `users` table

### Registration Flow
- Add DOB field to signup form
- Hard block under 13 (COPPA)
- 13-17: allowed with restrictions + parental consent checkbox
  - "Minor" badge on profile
  - Cannot use marketplace features (Path A)
  - Cannot upload ID (must be 18+)
  - Users can opt out of matching with minors
- 18+: full access

### API Changes
- Registration endpoint: validate DOB, reject under 13
- Profile/matching queries: respect minor preferences
- Marketplace endpoints: reject minor users

## 6. Legal Pages — Full Rewrite

### Terms of Service (terms/page.tsx)
Hybrid tone: plain English for critical sections, standard legal for the rest.

**Sections:**
1. Acceptance of Terms (update — add arbitration reference)
2. Description of Service (minor update for new features)
3. User Responsibilities (update — rating conduct, content policy)
4. Liability Waiver (update — strengthen "platform not provider")
5. Assumption of Risk (keep)
6. Gym Partners (update — indemnification reference)
7. Subscription & Payment (update — marketplace transaction terms)
8. Privacy (keep — cross-reference)
9. Termination (keep)
10. **Platform Status & Section 230** (NEW) — "Training Partner is a platform, not a training provider"
11. **Identity Verification** (NEW) — voluntary nature, data handling, no guarantee of accuracy
12. **User Conduct & Content Policy** (NEW) — prohibited content, zero tolerance, reporting, 24-48hr response
13. **Rating System** (NEW) — personal experience not endorsements, anti-retaliation, no defamation liability
14. **Marketplace Transactions** (NEW) — platform facilitates but is not party, refund disputes between users, tax responsibility
15. **Age Requirements** (NEW) — under 13 prohibited, 13-17 with parental consent + restrictions, 18+ for full features
16. **Anti-Discrimination** (NEW) — weight/skill/sport matching is legitimate, protected-class discrimination prohibited
17. **Insurance Recommendation** (NEW) — recommend verifying gym insurance, consider personal liability
18. **Dispute Resolution & Arbitration** (NEW) — mandatory binding arbitration, class action waiver, 30-day informal resolution, small claims exception
19. Contact (keep)

### Privacy Policy (privacy/page.tsx)
**New sections:**
12. Government ID & Biometric Data — what we collect, why, how stored, 90-day retention, deletion rights, state disclosures
13. Location Data — check-in location, geo-discovery, not continuous tracking
14. Financial Transaction Data — processed by Stripe, we store records not credentials
15. Data Breach Response — 72-hour notification commitment
16. Data Retention Schedule — table of retention periods by data type
17. Minor Users — limited collection for 13-17, no ID verification, parental rights

## 7. Report & Content Moderation

### Database
- Update existing reports: add `reason` enum field (harassment, inappropriate_content, fake_identity, underage, threatening_behavior, spam, other)
- New `content_policy_violations` INTEGER field on `users` (default 0)

### Enhancements
- Report reasons dropdown in report flow
- Admin panel: reports sorted by priority (threatening_behavior, underage at top)
- 3-strike system: 3 violations = account suspension
- Reporter gets confirmation: "Report received, reviewing within 48 hours"

### API Changes
- Update `POST /api/report` — add `reason` field
- `GET /api/admin/reports` — priority-sorted report list
- `PUT /api/admin/reports/:id/resolve` — resolve with action (warn/suspend/ban/dismiss)

## 8. Landing Page Silhouettes

### Approach
Add inline SVG silhouettes of combat sports athletes as decorative background elements on the landing page. Six poses: wrestler shooting, BJJ guard player, Muay Thai kick, boxer stance, judo throw, MMA fighter.

### Placement
- Hero section: 2 silhouettes (left and right sides), low opacity (5-8%), positioned absolutely behind content
- Features section: 1 silhouette per feature card background
- "Built for Athletes" section: larger silhouette as section background

### Implementation
- SVG paths defined in globals.css as background-image data URIs, or as React components
- Opacity 5-8% to stay subtle and not distract from content
- Responsive: hidden on mobile (below md breakpoint) to keep clean

## Files Modified

| File | Changes |
|------|---------|
| `worker/index.js` | New tables, 15+ new endpoints, block filtering in queries |
| `src/lib/api.ts` | New TypeScript interfaces and API methods |
| `src/app/app/settings/page.tsx` | ID verification section, emergency contact, blocked users |
| `src/app/app/admin/page.tsx` | ID verification review, report management |
| `src/app/terms/page.tsx` | Full rewrite with 19 sections |
| `src/app/privacy/page.tsx` | Full rewrite with 17 sections |
| `src/app/auth/signup/page.tsx` | Add DOB field, age gate logic |
| `src/app/page.tsx` | Add silhouette SVGs as background decorations |
| `src/app/globals.css` | Silhouette CSS classes |
| `src/app/app/partners/[id]/page.tsx` | Block button, rating display, verified badge |
| `src/components/verified-badge.tsx` | Reusable verified badge component |
| `src/components/trust-score.tsx` | Reusable trust score display (blurred/visible) |
