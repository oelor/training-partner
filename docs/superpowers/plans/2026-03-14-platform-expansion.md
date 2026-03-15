# Training Partner Platform Expansion Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve Training Partner from combat-sports-only into a broad training partner platform with profile customization, activity-specific graphics, image moderation, trial-friendly billing, courtesy emails, and a community moderator program.

**Architecture:** 6 independent subsystems that can be built in parallel. All share the existing Cloudflare Worker + D1 SQLite backend and Next.js frontend. New images go to Cloudflare R2 (replacing base64-in-DB). Email uses Resend API. Stripe handles trial periods. AI moderation uses Workers AI or a lightweight classifier.

**Tech Stack:** Cloudflare Workers, D1 SQLite, R2 Object Storage, Resend (email), Stripe Billing, Workers AI (image moderation), Next.js 14 App Router

---

## Current State (as of 2026-03-14)

- **44 DB tables**, ~55 API endpoints in `worker/index.js`
- **Base64 image storage** for avatars (68KB limit), gym docs, identity photos — all in SQLite
- **No R2 bucket** configured yet
- **No email service** integrated (Resend API key placeholder exists)
- **Stripe integration** exists: checkout, webhooks, subscription status
- **Trial period**: Currently referenced as 7-day in UI (just changed to 30-day in landing page text)
- **Moderator role**: Does not exist — only `athlete`, `coach`, `admin` roles
- **Profile**: Has `avatar_url` (base64), no background/cover image
- **Sports list**: Hardcoded in frontend profile form (9 combat sports only)

## Subsystem Overview

| # | Subsystem | Priority | Depends On |
|---|-----------|----------|------------|
| 1 | R2 Image Storage Migration | HIGH | Nothing (foundational) |
| 2 | Profile & Gym Customization | HIGH | Subsystem 1 |
| 3 | Image Content Moderation | HIGH | Subsystem 1 |
| 4 | Activity-Specific Graphics | MEDIUM | Nothing (CSS/assets) |
| 5 | 30-Day Trial + Courtesy Emails | HIGH | Resend API key |
| 6 | Moderator Program | MEDIUM | Subsystem 5 |

---

## Chunk 1: R2 Image Storage Migration

### Why R2 First

Every image feature (profile backgrounds, gym banners, moderation) needs proper object storage. Base64 in SQLite won't scale. R2 is free for 10GB/mo storage + 10M reads/mo — perfect for alpha.

### Task 1.1: Create R2 Bucket & Wrangler Binding

**Files:**
- Modify: `wrangler.toml`

- [ ] **Step 1: Add R2 binding to wrangler.toml**

```toml
# After [[d1_databases]] block:
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "training-partner-images"
```

- [ ] **Step 2: Create the R2 bucket**

```bash
npx wrangler r2 bucket create training-partner-images
```

Expected: "Created bucket training-partner-images"

- [ ] **Step 3: Redeploy worker to pick up binding**

```bash
npx wrangler deploy
```

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml
git commit -m "infra: add R2 bucket binding for image storage"
```

### Task 1.2: Image Upload Helper in Worker

**Files:**
- Modify: `worker/index.js` (add helper functions near top, after CORS setup ~line 60)

- [ ] **Step 1: Add R2 upload/serve helpers**

Add these helper functions to `worker/index.js` after the existing utility functions:

```javascript
// ── R2 Image Helpers ──────────────────────────────────────────
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function uploadImage(env, key, data, contentType) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error('Unsupported image type. Use JPEG, PNG, WebP, or GIF.');
  }
  if (data.byteLength > MAX_IMAGE_SIZE) {
    throw new Error('Image too large. Maximum 5MB.');
  }
  await env.IMAGES.put(key, data, {
    httpMetadata: { contentType },
    customMetadata: { uploadedAt: new Date().toISOString() },
  });
  return `/api/images/${key}`;
}

async function serveImage(env, key) {
  const object = await env.IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400'); // 24h CDN cache
  return new Response(object.body, { headers });
}

async function deleteImage(env, key) {
  await env.IMAGES.delete(key);
}
```

- [ ] **Step 2: Add image serving route**

In the router section of `worker/index.js`, add before the catch-all:

```javascript
// Serve R2 images
if (method === 'GET' && path.startsWith('/api/images/')) {
  const key = path.replace('/api/images/', '');
  return serveImage(env, key);
}
```

- [ ] **Step 3: Add generic image upload endpoint**

```javascript
// POST /api/upload-image — authenticated image upload to R2
async function handleImageUpload(request, env, user) {
  const formData = await request.formData();
  const file = formData.get('file');
  const purpose = formData.get('purpose') || 'general'; // avatar, cover, gym-banner, post

  if (!file || !file.size) {
    return corsJson({ ok: false, error: 'No file provided' }, { status: 400 }, request, env);
  }

  const contentType = file.type;
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return corsJson({ ok: false, error: 'Unsupported image type' }, { status: 400 }, request, env);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return corsJson({ ok: false, error: 'Image too large (max 5MB)' }, { status: 400 }, request, env);
  }

  const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1];
  const key = `${purpose}/${user.id}/${Date.now()}.${ext}`;
  const data = await file.arrayBuffer();

  const url = await uploadImage(env, key, data, contentType);

  return corsJson({ ok: true, url, key }, {}, request, env);
}
```

- [ ] **Step 4: Wire route**

```javascript
if (method === 'POST' && path === '/api/upload-image') return requireAuth(handleImageUpload);
```

- [ ] **Step 5: Commit**

```bash
git add worker/index.js
git commit -m "feat: add R2 image storage with upload/serve endpoints"
```

### Task 1.3: Migrate Avatar Upload to R2

**Files:**
- Modify: `worker/index.js` (handleUploadAvatar function, ~line 2012)
- Modify: `src/app/app/profile/page.tsx` (AvatarUpload component)
- Modify: `src/lib/api.ts` (add uploadImageFile method)

- [ ] **Step 1: Add uploadImageFile to API client**

In `src/lib/api.ts`, add a method that sends FormData instead of JSON:

```typescript
async uploadImageFile(file: File, purpose: string): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  const res = await fetch(`${API_URL}/api/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${this.getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new ApiError('Upload failed', res.status);
  const data = await res.json();
  return data;
}
```

- [ ] **Step 2: Update AvatarUpload component to use FormData upload**

Replace the base64 FileReader approach with direct file upload via the new endpoint.

- [ ] **Step 3: Update backend handleUploadAvatar to accept R2 URL**

Keep backward compat: if `avatar` field is a URL (starts with `/api/images/`), store it directly. If base64, process as before (for mobile app compat).

- [ ] **Step 4: Commit**

```bash
git add worker/index.js src/app/app/profile/page.tsx src/lib/api.ts
git commit -m "feat: migrate avatar upload from base64 to R2"
```

---

## Chunk 2: Profile & Gym Customization

### Task 2.1: Add Cover Image to User Profiles

**Files:**
- Create: `migrations/0008_profile_images.sql`
- Modify: `worker/index.js` (user profile update handler)
- Modify: `src/app/app/profile/page.tsx` (add cover image upload)

- [ ] **Step 1: Create migration**

```sql
-- Profile cover images and expanded sports list
ALTER TABLE user_profiles ADD COLUMN cover_image_url TEXT DEFAULT '';
ALTER TABLE user_profiles ADD COLUMN gym_affiliation TEXT DEFAULT '';
```

- [ ] **Step 2: Apply migration locally**

```bash
npx wrangler d1 migrations apply training-partner --local
```

- [ ] **Step 3: Update profile update handler in worker/index.js**

Accept `cover_image_url` and `gym_affiliation` in the profile update endpoint.

- [ ] **Step 4: Add CoverImageUpload component to profile page**

Similar to AvatarUpload but uses `purpose: 'cover'` and displays as a banner.

- [ ] **Step 5: Update the partner detail page to show cover image**

File: `src/app/app/partners/[id]/page.tsx` — render cover image as background behind avatar.

- [ ] **Step 6: Commit**

### Task 2.2: Add Banner Image to Gyms

**Files:**
- Create: `migrations/0009_gym_banner.sql`
- Modify: `worker/index.js`
- Modify: `src/app/app/gyms/[id]/page.tsx`
- Modify: `src/app/app/gym-dashboard/page.tsx`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE gyms ADD COLUMN banner_image_url TEXT DEFAULT '';
ALTER TABLE gyms ADD COLUMN sport_focus TEXT DEFAULT '';
```

- [ ] **Step 2: Update gym update handler to accept banner_image_url**

- [ ] **Step 3: Add banner upload to gym dashboard**

- [ ] **Step 4: Display banner on gym detail page**

- [ ] **Step 5: Commit**

### Task 2.3: Expand Sports/Activities List

**Files:**
- Modify: `src/app/app/profile/page.tsx` (SPORTS array)
- Modify: `src/app/app/onboarding/page.tsx` (if sport selection exists there)
- Create: `src/lib/constants.ts` (shared sports/activities list)

- [ ] **Step 1: Create shared constants file**

```typescript
export const ACTIVITIES = [
  // Combat Sports
  'Wrestling', 'MMA', 'Brazilian Jiu-Jitsu', 'Boxing', 'Kickboxing',
  'Judo', 'Muay Thai', 'Karate', 'Sambo', 'Taekwondo', 'Capoeira',
  // Strength & Conditioning
  'Weightlifting', 'Powerlifting', 'CrossFit', 'Calisthenics', 'Strongman',
  // Cardio & Endurance
  'Running', 'Rucking', 'Cycling', 'Swimming', 'Rowing',
  // Flexibility & Movement
  'Yoga', 'Pilates', 'Mobility Training',
  // Outdoor & Adventure
  'Rock Climbing', 'Hiking', 'Trail Running',
  // General
  'General Fitness', 'Personal Training', 'Group Fitness',
] as const;

export type Activity = typeof ACTIVITIES[number];

// Categories for UI grouping
export const ACTIVITY_CATEGORIES = {
  'Combat Sports': ACTIVITIES.slice(0, 11),
  'Strength & Conditioning': ACTIVITIES.slice(11, 16),
  'Cardio & Endurance': ACTIVITIES.slice(16, 21),
  'Flexibility & Movement': ACTIVITIES.slice(21, 24),
  'Outdoor & Adventure': ACTIVITIES.slice(24, 27),
  'General': ACTIVITIES.slice(27),
} as const;
```

- [ ] **Step 2: Update profile page to import from constants**

Replace hardcoded sports array with `ACTIVITIES` import, render grouped by category.

- [ ] **Step 3: Update onboarding page similarly**

- [ ] **Step 4: Commit**

---

## Chunk 3: Image Content Moderation

### Task 3.1: AI Image Screening via Workers AI

**Files:**
- Modify: `worker/index.js` (add moderation check to upload flow)
- Modify: `wrangler.toml` (add AI binding)

- [ ] **Step 1: Add Workers AI binding**

```toml
# In wrangler.toml
[ai]
binding = "AI"
```

- [ ] **Step 2: Create moderation function**

```javascript
async function moderateImage(env, imageData) {
  try {
    // Use Cloudflare Workers AI image classification
    const result = await env.AI.run('@cf/microsoft/resnet-50', {
      image: [...new Uint8Array(imageData)],
    });

    // Check for NSFW content using text classification on description
    // Alternatively, use a dedicated NSFW model when available
    return { safe: true, labels: result, reviewed: 'ai' };
  } catch (err) {
    // If AI fails, flag for manual review but allow upload
    console.error('AI moderation failed:', err);
    return { safe: true, labels: [], reviewed: 'pending', error: err.message };
  }
}
```

- [ ] **Step 3: Add moderation_status to images**

Create `migrations/0010_image_moderation.sql`:

```sql
CREATE TABLE IF NOT EXISTS image_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  uploader_id INTEGER NOT NULL,
  ai_result TEXT DEFAULT '{}',
  status TEXT DEFAULT 'approved', -- approved, flagged, rejected, pending_review
  reviewed_by INTEGER, -- moderator user ID if human-reviewed
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (uploader_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_image_reviews_status ON image_reviews(status);
CREATE INDEX IF NOT EXISTS idx_image_reviews_uploader ON image_reviews(uploader_id);
```

- [ ] **Step 4: Wire moderation into upload flow**

In `handleImageUpload`, after saving to R2, run moderation. If flagged, set status to `flagged` and still allow (with review queue).

- [ ] **Step 5: Commit**

### Task 3.2: Moderation Disclaimer

**Files:**
- Create: `src/components/moderation-disclaimer.tsx`
- Modify: `src/app/app/profile/page.tsx` (show near upload)
- Modify: `src/app/terms/page.tsx` (add moderation section)

- [ ] **Step 1: Create disclaimer component**

```tsx
export function ModerationDisclaimer() {
  return (
    <p className="text-xs text-text-secondary mt-2">
      Uploaded images are screened by AI to maintain community safety.
      This system is imperfect and may make mistakes. Flagged content
      is queued for human review. By uploading, you agree to our{' '}
      <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
    </p>
  );
}
```

- [ ] **Step 2: Add to all upload areas (profile, gym dashboard, community posts)**

- [ ] **Step 3: Update Terms of Service page with image moderation policy**

- [ ] **Step 4: Commit**

### Task 3.3: Admin Moderation Queue

**Files:**
- Create: `src/app/app/admin/moderation/page.tsx`
- Modify: `worker/index.js` (add moderation review endpoints)

- [ ] **Step 1: Add API endpoints**

```
GET  /api/admin/moderation/queue    — list flagged images
POST /api/admin/moderation/review   — approve/reject image { image_id, action }
```

- [ ] **Step 2: Build moderation queue UI**

Grid of flagged images with approve/reject buttons. Only visible to admin and moderator roles.

- [ ] **Step 3: Commit**

---

## Chunk 4: Activity-Specific Graphics

### Task 4.1: Create Section Background Graphics

This is a design/asset task. Each section of the landing page and key app pages gets a subtle background graphic specific to an activity.

**Files:**
- Create: `public/graphics/bjj-silhouette.svg`
- Create: `public/graphics/weightlifting-silhouette.svg`
- Create: `public/graphics/running-silhouette.svg`
- Create: `public/graphics/climbing-silhouette.svg`
- Create: `public/graphics/yoga-silhouette.svg`
- Create: `public/graphics/cycling-silhouette.svg`
- Create: `src/components/activity-graphics.tsx` (reusable component)

Note: The SVG silhouettes can be created via Canva when quota refreshes, or sourced from an open SVG library (Undraw, SVGRepo, Heroicons). The existing `src/components/silhouettes.tsx` already has combat sports SVGs as React components — follow that same pattern.

- [ ] **Step 1: Create activity-graphics component**

```tsx
// Maps activity names to subtle background graphics
// Usage: <ActivityGraphic activity="BJJ" className="opacity-[0.04]" />
```

- [ ] **Step 2: Update landing page sections to use diverse graphics**

Replace `MuayThaiKickSilhouette`, `BoxerSilhouette`, etc. with a mix of combat + general fitness silhouettes.

- [ ] **Step 3: Add graphics to app dashboard, partner cards, gym pages**

Each area shows a contextually relevant activity graphic based on the user's selected sports or the gym's sport_focus.

- [ ] **Step 4: Commit**

### Task 4.2: Replace Hero Image

**Dependency:** Canva quota refresh or alternative image source.

The hero image should show two athletes supporting each other (e.g., spotting on a squat rack, partner pushups) rather than combat athletes. This is a **design task**:

- [ ] **Step 1: Generate/source new hero image via Canva**

Prompt: "Two diverse athletes supporting each other in a gym setting. One spotting the other on a squat rack or doing partner exercises. Dark moody lighting with warm orange glow. No text. Wide format, cinematic."

- [ ] **Step 2: Export as PNG, optimize to <500KB, save to `public/hero-banner.png`**

- [ ] **Step 3: Verify landing page renders correctly with new image**

---

## Chunk 5: 30-Day Trial + Courtesy Emails

### Task 5.1: Update Stripe Trial Period

**Files:**
- Modify: `worker/index.js` (Stripe checkout handler, ~line 1476)

- [ ] **Step 1: Set trial_period_days to 30**

In the `handleCreateCheckout` function, update the Stripe checkout session:

```javascript
const session = await stripe.checkout.sessions.create({
  // ... existing config ...
  subscription_data: {
    trial_period_days: 30,  // Changed from 7
  },
});
```

- [ ] **Step 2: Also update any Stripe Price objects if trial is set at price level**

Check Stripe Dashboard — if trial_period is configured on the Price object, update it there too.

- [ ] **Step 3: Commit**

### Task 5.2: Scheduled Courtesy Email System

**Files:**
- Create: `worker/email-scheduler.js` (Cloudflare Cron Trigger)
- Modify: `wrangler.toml` (add cron trigger)
- Modify: `worker/index.js` (add email sending helpers)
- Create: `migrations/0011_email_log.sql`

- [ ] **Step 1: Create email log table**

```sql
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_type TEXT NOT NULL, -- trial_feedback_day20, trial_ending_day29, welcome, etc.
  sent_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_email_log_user_type ON email_log(user_id, email_type);
```

- [ ] **Step 2: Add Resend email helper to worker**

```javascript
async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) {
    console.log('Email skipped (no RESEND_API_KEY):', subject, to);
    return { ok: false, reason: 'no_api_key' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Training Partner <noreply@trainingpartner.app>',
      to,
      subject,
      html,
    }),
  });
  return res.json();
}
```

- [ ] **Step 3: Add cron trigger to wrangler.toml**

```toml
[triggers]
crons = ["0 14 * * *"]  # Run daily at 2 PM UTC (morning US time)
```

- [ ] **Step 4: Implement scheduled handler**

```javascript
export default {
  async fetch(request, env) { /* existing router */ },

  async scheduled(event, env) {
    // Find users on day 20 of trial
    const day20Users = await env.DB.prepare(`
      SELECT u.id, u.email, u.display_name
      FROM users u
      LEFT JOIN email_log el ON el.user_id = u.id AND el.email_type = 'trial_feedback_day20'
      WHERE u.created_at <= datetime('now', '-20 days')
        AND u.created_at > datetime('now', '-21 days')
        AND el.id IS NULL
        AND u.role != 'admin'
    `).all();

    for (const user of day20Users.results) {
      await sendEmail(env, {
        to: user.email,
        subject: "How's your Training Partner experience? (Day 20)",
        html: `<p>Hi ${user.display_name || 'there'},</p>
          <p>You've been using Training Partner for 20 days now! We'd love to hear how it's going.</p>
          <p>Reply to this email with any feedback — what's working, what could be better, or anything on your mind.</p>
          <p>Your trial continues for 10 more days. We're here to help you get the most out of it.</p>
          <p>— The Training Partner Team</p>`
      });
      await env.DB.prepare('INSERT INTO email_log (user_id, email_type) VALUES (?, ?)')
        .bind(user.id, 'trial_feedback_day20').run();
    }

    // Find users on day 29 of trial (1 day before billing)
    const day29Users = await env.DB.prepare(`
      SELECT u.id, u.email, u.display_name
      FROM users u
      LEFT JOIN email_log el ON el.user_id = u.id AND el.email_type = 'trial_ending_day29'
      WHERE u.created_at <= datetime('now', '-29 days')
        AND u.created_at > datetime('now', '-30 days')
        AND el.id IS NULL
        AND u.role != 'admin'
    `).all();

    for (const user of day29Users.results) {
      await sendEmail(env, {
        to: user.email,
        subject: "Your Training Partner trial ends tomorrow",
        html: `<p>Hi ${user.display_name || 'there'},</p>
          <p>We hope you've enjoyed your 30-day trial!</p>
          <p>Your trial ends tomorrow. If you'd like to continue, you don't need to do anything — your subscription will begin automatically.</p>
          <p><strong>If you'd like to cancel</strong>, you can do so anytime from your <a href="https://trainingpartner.app/app/settings">account settings</a>. We never want to charge anyone who isn't getting value from the platform.</p>
          <p>Either way, thanks for giving us a try. We'd love to keep you around!</p>
          <p>— The Training Partner Team</p>`
      });
      await env.DB.prepare('INSERT INTO email_log (user_id, email_type) VALUES (?, ?)')
        .bind(user.id, 'trial_ending_day29').run();
    }
  },
};
```

- [ ] **Step 5: Commit**

---

## Chunk 6: Moderator Program

### Task 6.1: Add Moderator Role

**Files:**
- Create: `migrations/0012_moderator_role.sql`
- Modify: `worker/index.js` (auth middleware, role checks)

- [ ] **Step 1: Create migration**

```sql
CREATE TABLE IF NOT EXISTS moderator_grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  granted_by INTEGER NOT NULL,     -- admin who granted
  granted_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,         -- free membership end date
  status TEXT DEFAULT 'active',     -- active, expired, revoked
  notes TEXT DEFAULT '',            -- reason / expectations
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (granted_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_moderator_grants_status ON moderator_grants(status, expires_at);
```

- [ ] **Step 2: Update role system**

In the auth middleware, when checking `user.role`, also check `moderator_grants` table. A user with an active grant gets moderator permissions (access to moderation queue, user reports) without needing to change their `role` column.

```javascript
async function isModeratorOrAdmin(env, userId) {
  const user = await env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
  if (user?.role === 'admin') return true;
  const grant = await env.DB.prepare(
    `SELECT id FROM moderator_grants
     WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')`
  ).bind(userId).first();
  return !!grant;
}
```

- [ ] **Step 3: Add admin endpoints for moderator management**

```
POST /api/admin/moderators/grant   — { user_id, months, notes }
POST /api/admin/moderators/revoke  — { user_id, reason }
GET  /api/admin/moderators         — list all moderators
```

- [ ] **Step 4: Commit**

### Task 6.2: Moderator Dashboard

**Files:**
- Create: `src/app/app/moderate/page.tsx`

- [ ] **Step 1: Build moderator dashboard**

Shows:
- Image moderation queue (from Chunk 3)
- Reported users queue (existing `reports` table)
- Activity log of moderator actions

Only accessible to users with moderator grant or admin role.

- [ ] **Step 2: Add "Moderate" link to sidebar/nav for eligible users**

- [ ] **Step 3: Commit**

### Task 6.3: Moderator Free Membership Integration

**Files:**
- Modify: `worker/index.js` (subscription status check)

- [ ] **Step 1: Update subscription status endpoint**

When checking if a user has premium access, also check `moderator_grants`:

```javascript
async function handleGetSubscription(request, env, user) {
  // Check Stripe subscription first
  const stripeStatus = /* existing logic */;

  // Check moderator grant
  if (!stripeStatus.active) {
    const modGrant = await env.DB.prepare(
      `SELECT expires_at FROM moderator_grants
       WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')`
    ).bind(user.id).first();

    if (modGrant) {
      return corsJson({
        ok: true,
        active: true,
        plan: 'moderator',
        expires_at: modGrant.expires_at,
        source: 'moderator_grant'
      }, {}, request, env);
    }
  }

  return corsJson({ ok: true, ...stripeStatus }, {}, request, env);
}
```

- [ ] **Step 2: Commit**

---

## Implementation Order (Recommended)

```
Week 1: Chunk 5 (Trial + Emails) — highest user impact, smallest code
Week 1: Chunk 2 Task 2.3 (Expand activities list) — quick win
Week 2: Chunk 1 (R2 migration) — foundational for everything else
Week 2: Chunk 3 (Image moderation) — required before enabling more uploads
Week 3: Chunk 2 Tasks 2.1-2.2 (Profile/Gym customization) — depends on R2
Week 3: Chunk 6 (Moderator program) — builds on moderation queue
Week 4: Chunk 4 (Activity graphics) — design-heavy, can be done in parallel

Note: Chunk 4 Task 4.2 (new hero image) requires Canva quota or alternative
image source. Can be done anytime quota refreshes.
```

## What Orry Needs to Provide

| Item | Where | Notes |
|------|-------|-------|
| Resend API key | `wrangler secret put RESEND_API_KEY` | Free tier: 100 emails/day |
| Stripe trial update | Stripe Dashboard or via API | Set trial_period_days: 30 on prices |
| Canva hero image | Generate when quota refreshes | Collaborative athletes, no text |
| Activity SVGs | Canva or open source (SVGRepo, Undraw) | 6-8 silhouettes for different sports |
| First moderators | Manual grant via admin panel | Choose trusted early users |
