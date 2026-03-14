// Training Partner — Cloudflare Worker API
// Full-featured backend: Auth, Profiles, Partners, Gyms, Messaging, Bookings, Subscriptions

// ─── Utilities ───────────────────────────────────────────────────────────────

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

// Allowed origins for CORS — restrict to known frontends
const PRODUCTION_ORIGINS = [
  'https://training-partner.vercel.app',
  'https://trainingpartner.app',
];

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  if (PRODUCTION_ORIGINS.includes(origin)) return true;
  // Allow custom frontend URL from env
  if (env.FRONTEND_URL && origin === env.FRONTEND_URL) return true;
  // Allow Vercel preview deployments
  if (origin.match(/^https:\/\/training-partner-[\w-]+\.vercel\.app$/)) return true;
  // Only allow localhost in non-production environments
  if (env.ENVIRONMENT !== 'production' && (DEV_ORIGINS.includes(origin) || origin.startsWith('http://localhost:'))) return true;
  return false;
}

function corsHeaders(origin, env) {
  const allowedOrigin = isAllowedOrigin(origin, env) ? origin : PRODUCTION_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function corsJson(data, init = {}, request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '0');
  const cors = corsHeaders(origin, env);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

// ─── Email Service ──────────────────────────────────────────────────────────

const FRONTEND_URL = 'https://trainingpartner.app';

async function sendEmail(env, { to, subject, html }) {
  // If RESEND_API_KEY is set, use Resend (free tier: 100 emails/day)
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM || 'Training Partner <noreply@trainingpartner.app>',
          to,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Resend send failed:', e);
      return false;
    }
  }

  // Fallback: log to console (development)
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${html}`);
  return true;
}

function passwordResetEmailHtml(resetUrl) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #FF4D00; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #333; line-height: 1.6;">
        You requested a password reset for your Training Partner account. Click the button below to set a new password.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #FF4D00; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px; line-height: 1.5;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Training Partner &mdash; Never Train Alone Again</p>
    </div>
  `;
}

function verificationEmailHtml(verifyUrl) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #FF4D00; margin-bottom: 16px;">Verify Your Email</h2>
      <p style="color: #333; line-height: 1.6;">
        Welcome to Training Partner! Please verify your email address to unlock all features.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background: #FF4D00; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px; line-height: 1.5;">
        If you didn't create this account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Training Partner &mdash; Never Train Alone Again</p>
    </div>
  `;
}

// ── R2 Image Storage ──────────────────────────────────────────
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function uploadImageToR2(env, key, data, contentType) {
  if (!env.IMAGES) {
    throw new Error('R2 bucket not configured');
  }
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

async function serveImageFromR2(env, key) {
  if (!env.IMAGES) return new Response('R2 not configured', { status: 503 });
  const object = await env.IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(object.body, { headers });
}

// ── Moderator Role Check ──────────────────────────────────────
async function isModeratorOrAdmin(env, userId) {
  const user = await env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
  if (user?.role === 'admin') return true;
  const grant = await env.DB.prepare(
    "SELECT id FROM moderator_grants WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')"
  ).bind(userId).first();
  return !!grant;
}

// ─── CORS ───────────────────────────────────────────────────────────────────

function handleCors(request, env) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, env),
  });
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

function normalizeText(value) {
  return String(value || '').trim();
}

function isoNow() {
  return new Date().toISOString();
}

// Haversine distance between two lat/lng points in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Generate a random 16-char hex string for checkin codes
function generateCheckinCode() {
  const chars = '0123456789abcdef';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function sanitize(str, maxLen = 5000) {
  if (typeof str !== 'string') return '';
  // Strip HTML-significant and script-injection characters
  return str.replace(/[<>"'`]/g, '').replace(/javascript:/gi, '').trim().slice(0, maxLen);
}

// Recursively sanitize string values in nested objects/arrays
function sanitizeDeep(value) {
  if (typeof value === 'string') return sanitize(value, 500);
  if (Array.isArray(value)) return value.slice(0, 50).map(sanitizeDeep);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value).slice(0, 50)) {
      result[sanitize(k, 100)] = sanitizeDeep(v);
    }
    return result;
  }
  return value; // numbers, booleans, null pass through
}

// ─── Password Hashing (PBKDF2 via Web Crypto API) ───────────────────────────

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function verifyPassword(password, salt, hash) {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}

// ─── JWT (using Web Crypto API) ──────────────────────────────────────────────

function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function createJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + 86400 * 7 }));
  const data = `${header}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signature = base64url(String.fromCharCode(...new Uint8Array(sig)));
  return `${data}.${signature}`;
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(base64urlDecode(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

async function getUser(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  if (!env.JWT_SECRET) return null; // Reject if secret not configured
  const token = auth.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || !payload.userId) return null;
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
  return user || null;
}

async function requireAuth(request, env) {
  const user = await getUser(request, env);
  if (!user) return null;
  return user;
}

// ─── Runtime Schema Initialization ───────────────────────────────────────────

let schemaInitialized = false;

async function ensureFullSchema(env) {
  if (schemaInitialized || !env.DB) return;
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, display_name TEXT NOT NULL, avatar_url TEXT DEFAULT '', city TEXT DEFAULT '', role TEXT NOT NULL DEFAULT 'athlete', email_verified INTEGER NOT NULL DEFAULT 0, verification_token TEXT, reset_token TEXT, reset_token_expires TEXT, google_id TEXT, instagram_username TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, token TEXT)`,
      `CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, sports TEXT, skill_level TEXT, weight_class TEXT, training_goals TEXT, experience_years INTEGER DEFAULT 0, bio TEXT, availability TEXT, age INTEGER DEFAULT 0, location TEXT, profile_complete INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gyms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT DEFAULT '', city TEXT DEFAULT '', state TEXT DEFAULT '', lat REAL DEFAULT 0, lng REAL DEFAULT 0, phone TEXT DEFAULT '', email TEXT DEFAULT '', description TEXT DEFAULT '', sports TEXT DEFAULT '[]', amenities TEXT DEFAULT '[]', verified INTEGER NOT NULL DEFAULT 0, premium INTEGER NOT NULL DEFAULT 0, rating REAL NOT NULL DEFAULT 0, review_count INTEGER NOT NULL DEFAULT 0, price TEXT DEFAULT '', owner_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, day_of_week TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, max_slots INTEGER NOT NULL DEFAULT 20, current_slots INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, session_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS matches (id INTEGER PRIMARY KEY AUTOINCREMENT, user_a INTEGER NOT NULL, user_b INTEGER NOT NULL, score REAL NOT NULL DEFAULT 0, explanation TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL, content TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'free', status TEXT NOT NULL DEFAULT 'active', stripe_customer_id TEXT, stripe_subscription_id TEXT, current_period_start TEXT, current_period_end TEXT, trial_ends_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT DEFAULT '', data TEXT DEFAULT '{}', read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, comment TEXT DEFAULT '', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS favorite_gyms (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gym_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS blocked_users (id INTEGER PRIMARY KEY AUTOINCREMENT, blocker_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL, reported_id INTEGER NOT NULL, reason TEXT NOT NULL, details TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', reviewed_by INTEGER, reviewed_at TEXT, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, window_start TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS founding_applications (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, city TEXT, sport TEXT, goal TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new')`,
      `CREATE TABLE IF NOT EXISTS waitlist_signups (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT, email TEXT NOT NULL, role TEXT, city TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new')`,
      `CREATE TABLE IF NOT EXISTS open_mats (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, city TEXT NOT NULL, sport TEXT NOT NULL, venue TEXT, day_of_week TEXT, notes TEXT, is_active INTEGER NOT NULL DEFAULT 1)`,
      `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'article', sport TEXT DEFAULT '', media_url TEXT DEFAULT '', likes_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS post_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(post_id, user_id))`,
      `CREATE TABLE IF NOT EXISTS donations (id INTEGER PRIMARY KEY AUTOINCREMENT, donor_id INTEGER NOT NULL, recipient_id INTEGER NOT NULL, amount_cents INTEGER NOT NULL, message TEXT DEFAULT '', stripe_payment_intent_id TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_documents (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', file_data TEXT DEFAULT '', verified INTEGER NOT NULL DEFAULT 0, uploaded_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS private_lessons (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, coach_user_id INTEGER NOT NULL, sport TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', description TEXT DEFAULT '', price_cents INTEGER NOT NULL DEFAULT 0, duration_minutes INTEGER NOT NULL DEFAULT 60, available INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      // Alpha launch features
      `CREATE TABLE IF NOT EXISTS post_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL, parent_id INTEGER DEFAULT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT NOT NULL DEFAULT 'general', rating INTEGER, title TEXT DEFAULT '', body TEXT NOT NULL, page TEXT DEFAULT '', user_agent TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS invite_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, created_by INTEGER, max_uses INTEGER NOT NULL DEFAULT 10, current_uses INTEGER NOT NULL DEFAULT 0, expires_at TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS invite_redemptions (id INTEGER PRIMARY KEY AUTOINCREMENT, code_id INTEGER NOT NULL, user_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS app_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, metric_key TEXT NOT NULL, metric_value TEXT NOT NULL, recorded_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS support_donations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, donor_name TEXT DEFAULT '', donor_email TEXT DEFAULT '', amount_cents INTEGER NOT NULL, message TEXT DEFAULT '', cause TEXT NOT NULL DEFAULT 'tma', stripe_session_id TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`,
      // Gym Features — memberships, check-ins, promotions, announcements
      `CREATE TABLE IF NOT EXISTS gym_members (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, user_id INTEGER NOT NULL, role TEXT NOT NULL DEFAULT 'member', status TEXT NOT NULL DEFAULT 'pending', requested_by TEXT NOT NULL DEFAULT 'user', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(gym_id, user_id))`,
      `CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gym_id INTEGER NOT NULL, points INTEGER NOT NULL DEFAULT 10, method TEXT NOT NULL DEFAULT 'manual', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_promotions (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', type TEXT NOT NULL DEFAULT 'general', start_date TEXT, end_date TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, author_id INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      // Observability tables — API request tracking & error logging
      `CREATE TABLE IF NOT EXISTS api_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, method TEXT NOT NULL, path TEXT NOT NULL, status INTEGER NOT NULL, duration_ms INTEGER NOT NULL, user_agent TEXT DEFAULT '', country TEXT DEFAULT '', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS api_errors (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, method TEXT NOT NULL, error_message TEXT NOT NULL, error_stack TEXT DEFAULT '', user_agent TEXT DEFAULT '', created_at TEXT NOT NULL)`,
      // Trust & Safety tables
      `CREATE TABLE IF NOT EXISTS identity_verifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, id_photo TEXT NOT NULL, selfie_photo TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', reviewer_notes TEXT DEFAULT '', reviewed_by INTEGER, created_at TEXT NOT NULL, reviewed_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS session_ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, rater_id INTEGER NOT NULL, rated_id INTEGER NOT NULL, gym_id INTEGER, rating INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS blocks (id INTEGER PRIMARY KEY AUTOINCREMENT, blocker_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(blocker_id, blocked_id))`,
      // QR Check-in: guest check-ins table
      `CREATE TABLE IF NOT EXISTS guest_checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, lat REAL, lng REAL, created_at TEXT DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS training_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gym_id INTEGER, checkin_id INTEGER, partner_id INTEGER, sport TEXT NOT NULL, session_type TEXT NOT NULL DEFAULT 'drilling', duration_minutes INTEGER NOT NULL DEFAULT 60, intensity INTEGER NOT NULL DEFAULT 5, notes TEXT DEFAULT '', techniques TEXT DEFAULT '[]', rounds INTEGER DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL, gym_id INTEGER, title TEXT NOT NULL, description TEXT DEFAULT '', sport TEXT DEFAULT '', event_date TEXT NOT NULL, end_date TEXT, location TEXT DEFAULT '', max_attendees INTEGER DEFAULT 0, is_public INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'upcoming', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS event_rsvps (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'going', created_at TEXT NOT NULL, UNIQUE(event_id, user_id))`,
      // Moderation & image review tables
      `CREATE TABLE IF NOT EXISTS moderator_grants (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, granted_by INTEGER NOT NULL, expires_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', notes TEXT DEFAULT '', granted_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS image_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, image_key TEXT NOT NULL, uploader_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'approved', reviewed_by INTEGER, reviewed_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS email_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, email_type TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    ];
    for (const sql of tables) {
      await env.DB.prepare(sql).run();
    }
    // Create indexes (ignore errors if they already exist)
    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_pair ON matches(user_a, user_b)',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id)',
      'CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)',
      'CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_pair ON post_likes(post_id, user_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_gym_docs_gym ON gym_documents(gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_private_lessons_gym ON private_lessons(gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_blocked_blocker ON blocked_users(blocker_id)',
      'CREATE INDEX IF NOT EXISTS idx_blocked_blocked ON blocked_users(blocked_id)',
      'CREATE INDEX IF NOT EXISTS idx_sub_stripe ON subscriptions(stripe_subscription_id)',
      'CREATE INDEX IF NOT EXISTS idx_gym_reviews_gym ON gym_reviews(gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_gym_reviews_user_gym ON gym_reviews(user_id, gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key, window_start)',
      'CREATE INDEX IF NOT EXISTS idx_gym_sessions_gym ON gym_sessions(gym_id)',
      // Alpha launch indexes
      'CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)',
      'CREATE INDEX IF NOT EXISTS idx_invite_redemptions_code ON invite_redemptions(code_id)',
      'CREATE INDEX IF NOT EXISTS idx_app_metrics_key ON app_metrics(metric_key, recorded_at)',
      'CREATE INDEX IF NOT EXISTS idx_support_donations_user ON support_donations(user_id)',
      // Gym feature indexes
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_gym_members_pair ON gym_members(gym_id, user_id)',
      'CREATE INDEX IF NOT EXISTS idx_gym_members_user ON gym_members(user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_gym_members_gym ON gym_members(gym_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_checkins_gym ON checkins(gym_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_gym_promotions_gym ON gym_promotions(gym_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_gym_announcements_gym ON gym_announcements(gym_id, created_at)',
      // Observability indexes
      'CREATE INDEX IF NOT EXISTS idx_api_requests_created ON api_requests(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_api_requests_path ON api_requests(path, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_api_errors_created ON api_errors(created_at)',
      // Trust & Safety indexes
      'CREATE INDEX IF NOT EXISTS idx_identity_verifications_user ON identity_verifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status)',
      'CREATE INDEX IF NOT EXISTS idx_session_ratings_rated ON session_ratings(rated_id)',
      'CREATE INDEX IF NOT EXISTS idx_session_ratings_rater_rated_date ON session_ratings(rater_id, rated_id)',
      'CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id)',
      'CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_session_ratings_unique_daily ON session_ratings(rater_id, rated_id, DATE(created_at))',
      // QR Check-in indexes
      'CREATE INDEX IF NOT EXISTS idx_guest_checkins_gym ON guest_checkins(gym_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_guest_checkins_email ON guest_checkins(email, gym_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_gyms_checkin_code ON gyms(checkin_code)',
      // Training Log indexes
      'CREATE INDEX IF NOT EXISTS idx_training_logs_user ON training_logs(user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_training_logs_gym ON training_logs(gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_training_logs_sport ON training_logs(user_id, sport)',
      // Gym Favorites indexes
      'CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user ON favorite_gyms(user_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_gyms_pair ON favorite_gyms(user_id, gym_id)',
      // Events indexes
      'CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id)',
      'CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)',
      'CREATE INDEX IF NOT EXISTS idx_events_gym ON events(gym_id)',
      'CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport, event_date)',
      'CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id)',
    ];
    for (const sql of indexes) {
      try { await env.DB.prepare(sql).run(); } catch {}
    }
    // Safe column additions for existing databases
    const safeAlters = [
      'ALTER TABLE users ADD COLUMN google_id TEXT',
      'ALTER TABLE users ADD COLUMN instagram_username TEXT',
      'ALTER TABLE users ADD COLUMN verified INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE users ADD COLUMN date_of_birth TEXT',
      'ALTER TABLE users ADD COLUMN emergency_contact_name TEXT',
      'ALTER TABLE users ADD COLUMN emergency_contact_phone TEXT',
      'ALTER TABLE users ADD COLUMN emergency_contact_relation TEXT',
      'ALTER TABLE users ADD COLUMN content_policy_violations INTEGER NOT NULL DEFAULT 0',
      // QR Check-in columns
      'ALTER TABLE gyms ADD COLUMN checkin_code TEXT',
      'ALTER TABLE gyms ADD COLUMN checkin_radius_m INTEGER DEFAULT 200',
    ];
    for (const sql of safeAlters) {
      try { await env.DB.prepare(sql).run(); } catch {} // ignore "duplicate column" errors
    }
    // Seed gyms if empty
    const gymCount = await env.DB.prepare('SELECT COUNT(*) as cnt FROM gyms').first();
    if (!gymCount || gymCount.cnt === 0) {
      const now = isoNow();
      const gyms = [
        [1,'Iron Temple MMA','123 Champion Way','Los Angeles','CA',34.0522,-118.2437,'(555) 123-4567','contact@irontemple.com','Premier MMA facility with world-class coaching.','["MMA","BJJ","Wrestling"]','["Showers","Locker Room","Parking","Pro Shop"]',1,1,4.8,24,'$20/drop-in'],
        [2,'Grappling Factory','456 Mat Street','Los Angeles','CA',34.0195,-118.4912,'(555) 234-5678','info@grapplingfactory.com','Traditional grappling-focused gym.','["BJJ","Judo"]','["Mat Space","Weight Room","Coffee Bar"]',1,0,4.6,18,'$15/drop-in'],
        [3,'Knucklehead Boxing','789 Punch Ave','Los Angeles','CA',34.0407,-118.2468,'(555) 345-6789','train@knucklehead.com','Old-school boxing gym with authentic atmosphere.','["Boxing","Kickboxing"]','["Ring","Heavy Bags","Sparring Area"]',1,0,4.5,12,'$10/drop-in'],
        [4,'Elite Wrestling Club','321 Mat Blvd','Los Angeles','CA',34.0689,-118.4452,'(555) 456-7890','info@elitewrestling.com','Competition-focused wrestling club.','["Wrestling","MMA"]','["Mat Space","Strength Room","Video Analysis"]',1,1,4.9,32,'$25/month'],
        [5,'Zen Combat Academy','555 Harmony Lane','Los Angeles','CA',34.0928,-118.3287,'(555) 567-8901','zen@combatacademy.com','Modern facility with premium amenities.','["MMA","BJJ","Muay Thai"]','["Cage","Sauna","Lounge"]',1,1,4.7,20,'$30/drop-in'],
        [6,'Bay Area Wrestling','100 Grapple Dr','Hayward','CA',37.6688,-122.0808,'(510) 555-1234','info@bayareawrestling.com','Community wrestling club open to all levels.','["Wrestling","Judo"]','["Mat Space","Parking"]',1,0,4.4,8,'$15/drop-in'],
      ];
      for (const g of gyms) {
        await env.DB.prepare('INSERT OR IGNORE INTO gyms (id,name,address,city,state,lat,lng,phone,email,description,sports,amenities,verified,premium,rating,review_count,price,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...g, now, now).run();
      }
      // Seed sessions
      const sessions = [
        [1,1,'Saturday','10:00','14:00',20,0],[2,1,'Sunday','09:00','12:00',15,0],
        [3,2,'Sunday','09:00','12:00',25,0],[4,2,'Wednesday','19:00','21:00',18,0],
        [5,3,'Monday','18:00','20:00',12,0],[6,3,'Thursday','18:00','20:00',12,0],
        [7,4,'Tuesday','19:00','21:00',30,0],[8,4,'Thursday','19:00','21:00',30,0],
        [9,4,'Saturday','10:00','13:00',40,0],[10,5,'Friday','20:00','22:00',16,0],
        [11,6,'Saturday','10:00','13:00',20,0],[12,6,'Wednesday','18:00','20:00',15,0],
      ];
      for (const s of sessions) {
        await env.DB.prepare('INSERT OR IGNORE INTO gym_sessions (id,gym_id,day_of_week,start_time,end_time,max_slots,current_slots,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(...s, now).run();
      }
    }
    schemaInitialized = true;
  } catch (err) {
    console.error('Schema init error:', err);
    // Do NOT set schemaInitialized so it retries on next request
  }
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

async function checkRateLimit(env, key, maxRequests, windowSeconds) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000).toISOString();
  // Clean old entries
  await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(windowStart).run();
  // Count recent requests
  const result = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND window_start > ?'
  ).bind(key, windowStart).first();
  if (result && result.count >= maxRequests) return false;
  // Add entry
  await env.DB.prepare(
    'INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)'
  ).bind(key, now.toISOString()).run();
  return true;
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

async function handleRegister(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const name = sanitize(normalizeText(body.name));
  const email = sanitize(normalizeText(body.email)).toLowerCase();
  const password = body.password || '';
  const sport = sanitize(normalizeText(body.sport));
  const dateOfBirth = body.date_of_birth || null;

  if (!name || !email || !password) {
    return corsJson({ ok: false, error: 'Name, email, and password are required' }, { status: 400 }, request, env);
  }
  if (password.length < 8 || password.length > 128) {
    return corsJson({ ok: false, error: 'Password must be 8-128 characters' }, { status: 400 }, request, env);
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return corsJson({ ok: false, error: 'Password must include uppercase, lowercase, and a number' }, { status: 400 }, request, env);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return corsJson({ ok: false, error: 'Invalid email address' }, { status: 400 }, request, env);
  }

  // Validate date of birth (age gate)
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return corsJson({ ok: false, error: 'Invalid date of birth' }, { status: 400 }, request, env);
    }
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
    if (age < 13) {
      return corsJson({ ok: false, error: 'You must be at least 13 years old' }, { status: 400 }, request, env);
    }
  }

  // Rate limit: 5 registrations per IP per hour
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `register:${ip}`, 5, 3600);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many registration attempts. Try again later.' }, { status: 429 }, request, env);
  }

  // Verify Cloudflare Turnstile token (if configured)
  const turnstileToken = body.turnstile_token || body.cf_turnstile_response;
  if (env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return corsJson({ ok: false, error: 'Please complete the verification challenge' }, { status: 400 }, request, env);
    }
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: ip,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return corsJson({ ok: false, error: 'Verification failed. Please try again.' }, { status: 403 }, request, env);
    }
  }

  // Check if email already exists
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return corsJson({ ok: false, error: 'Email already registered' }, { status: 409 }, request, env);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = isoNow();
  const verificationToken = crypto.randomUUID();

  const result = await env.DB.prepare(`
    INSERT INTO users (email, password_hash, password_salt, display_name, city, role, email_verified, verification_token, date_of_birth, created_at, updated_at)
    VALUES (?, ?, ?, ?, '', 'athlete', 0, ?, ?, ?, ?)
  `).bind(email, passwordHash, salt, name, verificationToken, dateOfBirth, now, now).run();

  const userId = result.meta.last_row_id;

  // Create empty profile
  await env.DB.prepare(`
    INSERT INTO user_profiles (user_id, sports, skill_level, weight_class, training_goals, experience_years, bio, availability, created_at, updated_at)
    VALUES (?, ?, '', '', '[]', 0, '', '[]', ?, ?)
  `).bind(userId, sport ? JSON.stringify([sport]) : '[]', now, now).run();

  // Create free subscription
  await env.DB.prepare(`
    INSERT INTO subscriptions (user_id, plan, status, created_at, updated_at)
    VALUES (?, 'free', 'active', ?, ?)
  `).bind(userId, now, now).run();

  // Send verification email
  const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  await sendEmail(env, {
    to: email,
    subject: 'Verify your Training Partner email',
    html: verificationEmailHtml(verifyUrl),
  });

  // Generate JWT
  const token = await createJWT({ userId, email, role: 'athlete' }, env.JWT_SECRET);

  return corsJson({
    ok: true,
    token,
    user: { id: userId, email, display_name: name, role: 'athlete', city: '', avatar_url: '', email_verified: 0 }
  }, { status: 201 }, request, env);
}

async function handleGoogleAuth(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const { credential, client_id } = body;
  if (!credential) {
    return corsJson({ ok: false, error: 'Google credential is required' }, { status: 400 }, request, env);
  }

  // Verify Google ID token via Google's tokeninfo endpoint (validates signature, iss, exp)
  if (!env.GOOGLE_CLIENT_ID) {
    return corsJson({ ok: false, error: 'Google Sign-In not configured' }, { status: 503 }, request, env);
  }

  let payload;
  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      return corsJson({ ok: false, error: 'Invalid Google token' }, { status: 400 }, request, env);
    }
    payload = await verifyRes.json();
  } catch {
    return corsJson({ ok: false, error: 'Failed to verify Google token' }, { status: 500 }, request, env);
  }

  // Verify audience matches our client ID
  if (payload.aud !== env.GOOGLE_CLIENT_ID) {
    return corsJson({ ok: false, error: 'Invalid token audience' }, { status: 400 }, request, env);
  }

  const googleEmail = (payload.email || '').toLowerCase();
  const googleName = payload.name || payload.given_name || '';
  const googleId = payload.sub;
  const googleAvatar = payload.picture || '';
  const emailVerified = payload.email_verified !== false;

  if (!googleEmail || !googleId) {
    return corsJson({ ok: false, error: 'Google token missing email or ID' }, { status: 400 }, request, env);
  }

  const now = isoNow();

  // Check if user exists by google_id or email
  let user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?').bind(googleId).first();

  if (!user) {
    user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(googleEmail).first();
  }

  if (user) {
    // Existing user — link google_id if not yet linked, update avatar if empty
    if (!user.google_id) {
      await env.DB.prepare('UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?').bind(googleId, now, user.id).run();
    }
    if (!user.avatar_url && googleAvatar) {
      await env.DB.prepare('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?').bind(googleAvatar, now, user.id).run();
    }
    if (emailVerified && !user.email_verified) {
      await env.DB.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').bind(now, user.id).run();
    }

    const token = await createJWT({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET);
    return corsJson({
      ok: true,
      token,
      user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role, city: user.city || '', avatar_url: user.avatar_url || googleAvatar, email_verified: emailVerified ? 1 : user.email_verified },
      isNewUser: false,
    }, {}, request, env);
  }

  // New user — create account
  const salt = generateSalt();
  const randomPass = crypto.randomUUID();
  const passwordHash = await hashPassword(randomPass, salt);

  const result = await env.DB.prepare(`
    INSERT INTO users (email, password_hash, password_salt, display_name, avatar_url, city, role, email_verified, google_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '', 'athlete', ?, ?, ?, ?)
  `).bind(googleEmail, passwordHash, salt, googleName, googleAvatar, emailVerified ? 1 : 0, googleId, now, now).run();

  const userId = result.meta.last_row_id;

  // Create empty profile
  await env.DB.prepare(`
    INSERT INTO user_profiles (user_id, sports, skill_level, weight_class, training_goals, experience_years, bio, availability, created_at, updated_at)
    VALUES (?, '[]', '', '', '[]', 0, '', '[]', ?, ?)
  `).bind(userId, now, now).run();

  // Create free subscription
  await env.DB.prepare(`
    INSERT INTO subscriptions (user_id, plan, status, created_at, updated_at)
    VALUES (?, 'free', 'active', ?, ?)
  `).bind(userId, now, now).run();

  const token = await createJWT({ userId, email: googleEmail, role: 'athlete' }, env.JWT_SECRET);

  return corsJson({
    ok: true,
    token,
    user: { id: userId, email: googleEmail, display_name: googleName, role: 'athlete', city: '', avatar_url: googleAvatar, email_verified: emailVerified ? 1 : 0 },
    isNewUser: true,
  }, { status: 201 }, request, env);
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const email = sanitize(normalizeText(body.email)).toLowerCase();
  const password = body.password || '';

  if (!email || !password) {
    return corsJson({ ok: false, error: 'Email and password are required' }, { status: 400 }, request, env);
  }

  // Rate limit: 10 login attempts per IP per 15 minutes
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `login:${ip}`, 10, 900);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many login attempts. Try again later.' }, { status: 429 }, request, env);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    return corsJson({ ok: false, error: 'Invalid email or password' }, { status: 401 }, request, env);
  }

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) {
    return corsJson({ ok: false, error: 'Invalid email or password' }, { status: 401 }, request, env);
  }

  const token = await createJWT({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET);

  return corsJson({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      city: user.city,
      avatar_url: user.avatar_url,
    }
  }, {}, request, env);
}

async function handleGetMe(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const profile = await env.DB.prepare('SELECT * FROM user_profiles WHERE user_id = ?').bind(user.id).first();
  const sub = await env.DB.prepare('SELECT * FROM subscriptions WHERE user_id = ?').bind(user.id).first();

  return corsJson({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      city: user.city,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
      google_id: user.google_id || null,
      instagram_username: user.instagram_username || null,
      verified: user.verified || 0,
      date_of_birth: user.date_of_birth || null,
      emergency_contact_name: user.emergency_contact_name || null,
      emergency_contact_phone: user.emergency_contact_phone || null,
      emergency_contact_relation: user.emergency_contact_relation || null,
      created_at: user.created_at,
    },
    profile: profile ? {
      sports: JSON.parse(profile.sports || '[]'),
      skill_level: profile.skill_level,
      weight_class: profile.weight_class,
      training_goals: JSON.parse(profile.training_goals || '[]'),
      experience_years: profile.experience_years,
      bio: profile.bio,
      availability: JSON.parse(profile.availability || '[]'),
      age: profile.age,
      location: profile.location,
      profile_complete: profile.profile_complete,
    } : null,
    subscription: sub ? { plan: sub.plan, status: sub.status, trial_ends_at: sub.trial_ends_at, current_period_end: sub.current_period_end } : { plan: 'free', status: 'active' },
  }, {}, request, env);
}

// ─── Profile Routes ──────────────────────────────────────────────────────────

async function handleUpdateInstagram(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  let username = (body.instagram_username || '').replace(/^@/, '').trim().substring(0, 30);
  // Validate Instagram username format: alphanumeric, periods, underscores only
  if (username && !/^[a-zA-Z0-9_.]+$/.test(username)) {
    return corsJson({ ok: false, error: 'Invalid Instagram username. Use only letters, numbers, periods, and underscores.' }, { status: 400 }, request, env);
  }

  await env.DB.prepare('UPDATE users SET instagram_username = ?, updated_at = ? WHERE id = ?')
    .bind(username || null, isoNow(), user.id).run();

  return corsJson({ ok: true }, {}, request, env);
}

async function handleUpdateProfile(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const now = isoNow();

  // Update user fields if provided
  if (body.display_name || body.city || body.avatar_url !== undefined) {
    const updates = [];
    const values = [];
    if (body.display_name) { updates.push('display_name = ?'); values.push(sanitize(body.display_name)); }
    if (body.city) { updates.push('city = ?'); values.push(sanitize(body.city)); }
    if (body.avatar_url !== undefined) { updates.push('avatar_url = ?'); values.push(sanitize(body.avatar_url)); }
    updates.push('updated_at = ?'); values.push(now);
    values.push(user.id);
    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  }

  // Update profile fields
  const sports = body.sports ? JSON.stringify(body.sports.map(s => sanitize(s))) : undefined;
  const skillLevel = body.skill_level !== undefined ? sanitize(body.skill_level) : undefined;
  const weightClass = body.weight_class !== undefined ? sanitize(body.weight_class) : undefined;
  const trainingGoals = body.training_goals ? JSON.stringify(body.training_goals.map(g => sanitize(g))) : undefined;
  const experienceYears = body.experience_years !== undefined ? parseInt(body.experience_years) || 0 : undefined;
  const bio = body.bio !== undefined ? sanitize(body.bio) : undefined;
  const availability = body.availability ? JSON.stringify(sanitizeDeep(body.availability)) : undefined;
  const age = body.age !== undefined ? parseInt(body.age) || 0 : undefined;
  const location = body.location !== undefined ? sanitize(body.location) : undefined;

  const pUpdates = [];
  const pValues = [];
  if (sports !== undefined) { pUpdates.push('sports = ?'); pValues.push(sports); }
  if (skillLevel !== undefined) { pUpdates.push('skill_level = ?'); pValues.push(skillLevel); }
  if (weightClass !== undefined) { pUpdates.push('weight_class = ?'); pValues.push(weightClass); }
  if (trainingGoals !== undefined) { pUpdates.push('training_goals = ?'); pValues.push(trainingGoals); }
  if (experienceYears !== undefined) { pUpdates.push('experience_years = ?'); pValues.push(experienceYears); }
  if (bio !== undefined) { pUpdates.push('bio = ?'); pValues.push(bio); }
  if (availability !== undefined) { pUpdates.push('availability = ?'); pValues.push(availability); }
  if (age !== undefined) { pUpdates.push('age = ?'); pValues.push(age); }
  if (location !== undefined) { pUpdates.push('location = ?'); pValues.push(location); }

  // Calculate profile completeness
  const profile = await env.DB.prepare('SELECT * FROM user_profiles WHERE user_id = ?').bind(user.id).first();
  const currentSports = sports !== undefined ? JSON.parse(sports) : JSON.parse(profile?.sports || '[]');
  const currentSkill = skillLevel !== undefined ? skillLevel : (profile?.skill_level || '');
  const currentWeight = weightClass !== undefined ? weightClass : (profile?.weight_class || '');
  const currentGoals = trainingGoals !== undefined ? JSON.parse(trainingGoals) : JSON.parse(profile?.training_goals || '[]');
  const currentBio = bio !== undefined ? bio : (profile?.bio || '');
  const currentLocation = location !== undefined ? location : (profile?.location || '');

  let completeness = 0;
  if (currentSports.length > 0) completeness += 20;
  if (currentSkill) completeness += 20;
  if (currentWeight) completeness += 15;
  if (currentGoals.length > 0) completeness += 15;
  if (currentBio) completeness += 15;
  if (currentLocation) completeness += 15;

  const isComplete = completeness >= 70 ? 1 : 0;
  pUpdates.push('profile_complete = ?'); pValues.push(isComplete);
  pUpdates.push('updated_at = ?'); pValues.push(now);
  pValues.push(user.id);

  if (pUpdates.length > 2) { // more than just profile_complete and updated_at
    await env.DB.prepare(`UPDATE user_profiles SET ${pUpdates.join(', ')} WHERE user_id = ?`).bind(...pValues).run();
  }

  // Recompute matches after profile update
  await computeMatchesForUser(user.id, env);

  return corsJson({ ok: true, profile_completeness: completeness }, {}, request, env);
}

async function handleGetProfile(request, env, userId) {
  const profile = await env.DB.prepare(`
    SELECT u.id, u.display_name, u.city, u.avatar_url, u.role, u.created_at,
           p.sports, p.skill_level, p.weight_class, p.training_goals, p.experience_years, p.bio, p.availability, p.age, p.location
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(userId).first();

  if (!profile) return corsJson({ ok: false, error: 'User not found' }, { status: 404 }, request, env);

  return corsJson({
    ok: true,
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      city: profile.city || profile.location,
      avatar_url: profile.avatar_url,
      role: profile.role,
      sports: JSON.parse(profile.sports || '[]'),
      skill_level: profile.skill_level,
      weight_class: profile.weight_class,
      training_goals: JSON.parse(profile.training_goals || '[]'),
      experience_years: profile.experience_years,
      bio: profile.bio,
      availability: JSON.parse(profile.availability || '[]'),
      created_at: profile.created_at,
    }
  }, {}, request, env);
}

// ─── Partner Matching Algorithm ──────────────────────────────────────────────

function computeMatchScore(profileA, profileB) {
  let totalScore = 0;
  const explanation = {};

  // 1. Sport overlap (30%)
  const sportsA = JSON.parse(profileA.sports || '[]');
  const sportsB = JSON.parse(profileB.sports || '[]');
  const commonSports = sportsA.filter(s => sportsB.includes(s));
  const sportScore = sportsA.length > 0 && sportsB.length > 0
    ? (commonSports.length / Math.max(sportsA.length, sportsB.length))
    : 0;
  totalScore += sportScore * 30;
  explanation.sports = { score: Math.round(sportScore * 30), common: commonSports };

  // 2. Skill level compatibility (20%)
  const skillLevels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Pro': 4 };
  const skillA = skillLevels[profileA.skill_level] || 0;
  const skillB = skillLevels[profileB.skill_level] || 0;
  let skillScore = 0;
  if (skillA > 0 && skillB > 0) {
    const diff = Math.abs(skillA - skillB);
    if (diff === 0) skillScore = 1;
    else if (diff === 1) skillScore = 0.7;
    else if (diff === 2) skillScore = 0.3;
    else skillScore = 0.1;
  }
  totalScore += skillScore * 20;
  explanation.skill = { score: Math.round(skillScore * 20), levelA: profileA.skill_level, levelB: profileB.skill_level };

  // 3. Weight class proximity (15%)
  const weightOrder = [
    'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
    'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight', 'Super Heavyweight'
  ];
  const getWeightIndex = (wc) => {
    if (!wc) return -1;
    for (let i = 0; i < weightOrder.length; i++) {
      if (wc.toLowerCase().includes(weightOrder[i].toLowerCase())) return i;
    }
    return -1;
  };
  const wA = getWeightIndex(profileA.weight_class);
  const wB = getWeightIndex(profileB.weight_class);
  let weightScore = 0;
  if (wA >= 0 && wB >= 0) {
    const diff = Math.abs(wA - wB);
    if (diff === 0) weightScore = 1;
    else if (diff === 1) weightScore = 0.7;
    else if (diff === 2) weightScore = 0.4;
    else weightScore = 0.1;
  }
  totalScore += weightScore * 15;
  explanation.weight = { score: Math.round(weightScore * 15) };

  // 4. Location match (15%)
  const locA = (profileA.location || profileA.city || '').toLowerCase().trim();
  const locB = (profileB.location || profileB.city || '').toLowerCase().trim();
  let locationScore = 0;
  if (locA && locB) {
    if (locA === locB) locationScore = 1;
    else if (locA.split(',')[0] === locB.split(',')[0]) locationScore = 0.7;
    else if (locA.includes(locB) || locB.includes(locA)) locationScore = 0.5;
  }
  totalScore += locationScore * 15;
  explanation.location = { score: Math.round(locationScore * 15) };

  // 5. Training goal alignment (10%)
  const goalsA = JSON.parse(profileA.training_goals || '[]');
  const goalsB = JSON.parse(profileB.training_goals || '[]');
  const commonGoals = goalsA.filter(g => goalsB.includes(g));
  const goalScore = goalsA.length > 0 && goalsB.length > 0
    ? (commonGoals.length / Math.max(goalsA.length, goalsB.length))
    : 0;
  totalScore += goalScore * 10;
  explanation.goals = { score: Math.round(goalScore * 10), common: commonGoals };

  // 6. Availability overlap (10%)
  const availA = JSON.parse(profileA.availability || '[]');
  const availB = JSON.parse(profileB.availability || '[]');
  let availScore = 0;
  if (availA.length > 0 && availB.length > 0) {
    const overlap = availA.filter(a =>
      availB.some(b => b.day === a.day && b.time === a.time)
    );
    availScore = overlap.length / Math.max(availA.length, availB.length);
  }
  totalScore += availScore * 10;
  explanation.availability = { score: Math.round(availScore * 10) };

  return { score: Math.round(totalScore), explanation };
}

async function computeMatchesForUser(userId, env) {
  const myProfile = await env.DB.prepare(`
    SELECT p.*, u.city as user_city FROM user_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `).bind(userId).first();
  if (!myProfile) return;

  const others = await env.DB.prepare(`
    SELECT p.*, u.city as user_city, u.id as uid FROM user_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id != ?
  `).bind(userId).all();

  for (const other of (others.results || [])) {
    const { score, explanation } = computeMatchScore(myProfile, other);
    if (score < 10) continue; // Skip very low matches

    const userA = Math.min(userId, other.uid);
    const userB = Math.max(userId, other.uid);

    await env.DB.prepare(`
      INSERT INTO matches (user_a, user_b, score, explanation, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
      ON CONFLICT(user_a, user_b) DO UPDATE SET score = ?, explanation = ?, created_at = ?
    `).bind(userA, userB, score, JSON.stringify(explanation), isoNow(), score, JSON.stringify(explanation), isoNow()).run();
  }
}

// ─── Partners Routes ─────────────────────────────────────────────────────────

async function handleGetPartners(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const sport = url.searchParams.get('sport');
  const skill = url.searchParams.get('skill');
  const search = url.searchParams.get('search');
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  // Get matches for this user
  let query = `
    SELECT m.score, m.explanation, m.status,
           u.id, u.display_name, u.city, u.avatar_url,
           p.sports, p.skill_level, p.weight_class, p.training_goals, p.experience_years, p.bio, p.location
    FROM matches m
    JOIN users u ON (CASE WHEN m.user_a = ? THEN m.user_b ELSE m.user_a END) = u.id
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE (m.user_a = ? OR m.user_b = ?)
      AND m.status = 'active'
  `;
  const params = [user.id, user.id, user.id];

  // Check blocked users (both legacy blocked_users and new blocks tables)
  query += ` AND u.id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = ?)
             AND u.id NOT IN (SELECT blocker_id FROM blocked_users WHERE blocked_id = ?)
             AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
             AND u.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)`;
  params.push(user.id, user.id, user.id, user.id);

  query += ` ORDER BY m.score DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();

  let partners = (results.results || []).map(r => ({
    id: r.id,
    name: r.display_name,
    city: r.city || r.location,
    avatar_url: r.avatar_url,
    sport: (() => {
      const sports = JSON.parse(r.sports || '[]');
      return sports[0] || '';
    })(),
    sports: JSON.parse(r.sports || '[]'),
    skill: r.skill_level,
    weight: r.weight_class,
    goals: JSON.parse(r.training_goals || '[]'),
    experience: r.experience_years,
    bio: r.bio,
    location: r.location || r.city,
    match: r.score,
    explanation: JSON.parse(r.explanation || '{}'),
  }));

  // Apply client-side filters
  if (sport && sport !== 'All') {
    partners = partners.filter(p => p.sports.some(s => s.toLowerCase().includes(sport.toLowerCase())));
  }
  if (skill && skill !== 'All') {
    partners = partners.filter(p => p.skill === skill);
  }
  if (search) {
    const q = search.toLowerCase();
    partners = partners.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sport.toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    );
  }

  return corsJson({ ok: true, partners, total: partners.length }, {}, request, env);
}

async function handleGetPartnerDetail(request, env, partnerId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const partner = await env.DB.prepare(`
    SELECT u.id, u.display_name, u.city, u.avatar_url, u.instagram_username, u.created_at,
           p.sports, p.skill_level, p.weight_class, p.training_goals, p.experience_years, p.bio, p.availability, p.location
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(partnerId).first();

  if (!partner) return corsJson({ ok: false, error: 'Partner not found' }, { status: 404 }, request, env);

  // Get match score
  const userA = Math.min(user.id, partnerId);
  const userB = Math.max(user.id, partnerId);
  const match = await env.DB.prepare('SELECT score, explanation FROM matches WHERE user_a = ? AND user_b = ?').bind(userA, userB).first();

  return corsJson({
    ok: true,
    partner: {
      id: partner.id,
      name: partner.display_name,
      city: partner.city || partner.location,
      avatar_url: partner.avatar_url,
      sports: JSON.parse(partner.sports || '[]'),
      skill: partner.skill_level,
      weight: partner.weight_class,
      goals: JSON.parse(partner.training_goals || '[]'),
      experience: partner.experience_years,
      bio: partner.bio,
      availability: JSON.parse(partner.availability || '[]'),
      location: partner.location || partner.city,
      match: match ? match.score : 0,
      explanation: match ? JSON.parse(match.explanation || '{}') : {},
      instagram_username: partner.instagram_username || null,
      created_at: partner.created_at,
    }
  }, {}, request, env);
}

// ─── Gym Routes ──────────────────────────────────────────────────────────────

async function handleGetGyms(request, env) {
  const url = new URL(request.url);
  const sport = url.searchParams.get('sport');
  const city = url.searchParams.get('city');
  const search = url.searchParams.get('search');
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  let query = 'SELECT * FROM gyms WHERE 1=1';
  const params = [];

  if (city) { query += ' AND LOWER(city) LIKE ?'; params.push(`%${city.toLowerCase()}%`); }
  if (search) { query += ' AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ?)'; params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`); }

  query += ' ORDER BY rating DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();

  let gyms = (results.results || []).map(g => ({
    id: g.id,
    name: g.name,
    address: g.address,
    city: g.city,
    state: g.state,
    lat: g.lat,
    lng: g.lng,
    phone: g.phone,
    email: g.email,
    description: g.description,
    sports: JSON.parse(g.sports || '[]'),
    amenities: JSON.parse(g.amenities || '[]'),
    verified: g.verified === 1,
    premium: g.premium === 1,
    rating: g.rating,
    review_count: g.review_count,
    price: g.price,
  }));

  if (sport && sport !== 'All') {
    gyms = gyms.filter(g => g.sports.some(s => s.toLowerCase().includes(sport.toLowerCase())));
  }

  return corsJson({ ok: true, gyms, total: gyms.length }, {}, request, env);
}

async function handleGetGymDetail(request, env, gymId) {
  const gym = await env.DB.prepare('SELECT * FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);

  const sessions = await env.DB.prepare('SELECT * FROM gym_sessions WHERE gym_id = ? ORDER BY CASE day_of_week WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END').bind(gymId).all();

  const reviews = await env.DB.prepare(`
    SELECT r.*, u.display_name FROM gym_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.gym_id = ? ORDER BY r.created_at DESC LIMIT 20
  `).bind(gymId).all();

  return corsJson({
    ok: true,
    gym: {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      lat: gym.lat,
      lng: gym.lng,
      phone: gym.phone,
      email: gym.email,
      description: gym.description,
      sports: JSON.parse(gym.sports || '[]'),
      amenities: JSON.parse(gym.amenities || '[]'),
      verified: gym.verified === 1,
      premium: gym.premium === 1,
      rating: gym.rating,
      review_count: gym.review_count,
      price: gym.price,
      sessions: (sessions.results || []).map(s => ({
        id: s.id,
        day: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        max_slots: s.max_slots,
        current_slots: s.current_slots,
        available: s.max_slots - s.current_slots,
      })),
      reviews: (reviews.results || []).map(r => ({
        id: r.id,
        user_name: r.display_name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
    }
  }, {}, request, env);
}

// ─── Booking Routes ──────────────────────────────────────────────────────────

async function handleCreateBooking(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Rate limit: 20 bookings per hour per user
  const allowed = await checkRateLimit(env, `booking:${user.id}`, 20, 3600);
  if (!allowed) return corsJson({ ok: false, error: 'Too many bookings. Try again later.' }, { status: 429 }, request, env);

  const body = await readJson(request);
  if (!body || !body.session_id) {
    return corsJson({ ok: false, error: 'Session ID is required' }, { status: 400 }, request, env);
  }

  const session = await env.DB.prepare('SELECT * FROM gym_sessions WHERE id = ?').bind(body.session_id).first();
  if (!session) return corsJson({ ok: false, error: 'Session not found' }, { status: 404 }, request, env);

  if (session.current_slots >= session.max_slots) {
    return corsJson({ ok: false, error: 'Session is full' }, { status: 400 }, request, env);
  }

  // Check for existing booking
  const existing = await env.DB.prepare(
    'SELECT id FROM bookings WHERE user_id = ? AND session_id = ? AND status = ?'
  ).bind(user.id, body.session_id, 'confirmed').first();
  if (existing) {
    return corsJson({ ok: false, error: 'You already have a booking for this session' }, { status: 409 }, request, env);
  }

  // Check subscription for premium gyms
  const gym = await env.DB.prepare('SELECT premium FROM gyms WHERE id = ?').bind(session.gym_id).first();
  if (gym && gym.premium === 1) {
    const sub = await env.DB.prepare('SELECT plan FROM subscriptions WHERE user_id = ?').bind(user.id).first();
    if (!sub || sub.plan !== 'premium') {
      return corsJson({ ok: false, error: 'Premium subscription required for this gym' }, { status: 403 }, request, env);
    }
  }

  const now = isoNow();

  // Atomic slot increment: only succeeds if there's still capacity
  const slotUpdate = await env.DB.prepare(
    'UPDATE gym_sessions SET current_slots = current_slots + 1 WHERE id = ? AND current_slots < max_slots'
  ).bind(body.session_id).run();

  if (!slotUpdate.meta.changes || slotUpdate.meta.changes === 0) {
    return corsJson({ ok: false, error: 'Session is full' }, { status: 400 }, request, env);
  }

  await env.DB.prepare('INSERT INTO bookings (user_id, session_id, status, created_at) VALUES (?, ?, ?, ?)').bind(user.id, body.session_id, 'confirmed', now).run();

  // Create notification
  await env.DB.prepare(
    'INSERT INTO notifications (user_id, type, title, body, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, 'booking_confirmed', 'Booking Confirmed', 'Your gym session has been booked successfully.', now).run();

  return corsJson({ ok: true, message: 'Booking confirmed' }, { status: 201 }, request, env);
}

async function handleGetBookings(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const results = await env.DB.prepare(`
    SELECT b.*, gs.day_of_week, gs.start_time, gs.end_time, g.name as gym_name, g.city as gym_city
    FROM bookings b
    JOIN gym_sessions gs ON b.session_id = gs.id
    JOIN gyms g ON gs.gym_id = g.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).bind(user.id).all();

  return corsJson({
    ok: true,
    bookings: (results.results || []).map(b => ({
      id: b.id,
      gym_name: b.gym_name,
      gym_city: b.gym_city,
      day: b.day_of_week,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      created_at: b.created_at,
    }))
  }, {}, request, env);
}

async function handleCancelBooking(request, env, bookingId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const booking = await env.DB.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').bind(bookingId, user.id).first();
  if (!booking) return corsJson({ ok: false, error: 'Booking not found' }, { status: 404 }, request, env);

  await env.DB.prepare('UPDATE bookings SET status = ? WHERE id = ?').bind('cancelled', bookingId).run();
  await env.DB.prepare('UPDATE gym_sessions SET current_slots = MAX(0, current_slots - 1) WHERE id = ?').bind(booking.session_id).run();

  return corsJson({ ok: true, message: 'Booking cancelled' }, {}, request, env);
}

// ─── Messaging Routes ────────────────────────────────────────────────────────

async function handleGetConversations(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const results = await env.DB.prepare(`
    SELECT
      CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_id,
      u.display_name as other_name,
      u.avatar_url as other_avatar,
      m.content as last_message,
      m.created_at as last_message_at,
      m.sender_id as last_sender_id,
      (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND read = 0) as unread_count
    FROM messages m
    JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) = u.id
    WHERE m.id IN (
      SELECT MAX(id) FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
    )
    AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
    AND u.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)
    ORDER BY m.created_at DESC
  `).bind(user.id, user.id, user.id, user.id, user.id, user.id, user.id, user.id).all();

  return corsJson({
    ok: true,
    conversations: (results.results || []).map(c => ({
      user_id: c.other_id,
      name: c.other_name,
      avatar_url: c.other_avatar,
      last_message: c.last_message,
      last_message_at: c.last_message_at,
      is_mine: c.last_sender_id === user.id,
      unread_count: c.unread_count,
    }))
  }, {}, request, env);
}

async function handleGetMessages(request, env, otherUserId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const before = url.searchParams.get('before');

  let query = `
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
  `;
  const params = [user.id, otherUserId, otherUserId, user.id];

  if (before) {
    query += ' AND created_at < ?';
    params.push(before);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const results = await env.DB.prepare(query).bind(...params).all();

  // Mark messages as read
  await env.DB.prepare(
    'UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ? AND read = 0'
  ).bind(otherUserId, user.id).run();

  return corsJson({
    ok: true,
    messages: (results.results || []).reverse().map(m => ({
      id: m.id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      content: m.content,
      read: m.read === 1,
      created_at: m.created_at,
      is_mine: m.sender_id === user.id,
    }))
  }, {}, request, env);
}

async function handleSendMessage(request, env, receiverId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.content) {
    return corsJson({ ok: false, error: 'Message content is required' }, { status: 400 }, request, env);
  }

  // Check if blocked (legacy blocked_users and new blocks tables)
  const blocked = await env.DB.prepare(
    'SELECT id FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
  ).bind(user.id, receiverId, receiverId, user.id).first();
  const blocked2 = await env.DB.prepare(
    'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
  ).bind(user.id, receiverId, receiverId, user.id).first();
  if (blocked || blocked2) {
    return corsJson({ ok: false, error: 'Cannot send message to this user' }, { status: 403 }, request, env);
  }

  // Rate limit: 30 messages per user per 5 minutes
  const msgAllowed = await checkRateLimit(env, `msg:${user.id}`, 30, 300);
  if (!msgAllowed) {
    return corsJson({ ok: false, error: 'You are sending messages too quickly. Please wait.' }, { status: 429 }, request, env);
  }

  // Check receiver exists
  const receiver = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(receiverId).first();
  if (!receiver) return corsJson({ ok: false, error: 'User not found' }, { status: 404 }, request, env);

  const now = isoNow();
  const content = sanitize(body.content).slice(0, 2000);

  const result = await env.DB.prepare(
    'INSERT INTO messages (sender_id, receiver_id, content, read, created_at) VALUES (?, ?, ?, 0, ?)'
  ).bind(user.id, receiverId, content, now).run();

  // Create notification for receiver
  await env.DB.prepare(
    'INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(receiverId, 'new_message', 'New Message', `${user.display_name} sent you a message`, JSON.stringify({ sender_id: user.id }), now).run();

  return corsJson({
    ok: true,
    message: {
      id: result.meta.last_row_id,
      sender_id: user.id,
      receiver_id: parseInt(receiverId),
      content,
      read: false,
      created_at: now,
      is_mine: true,
    }
  }, { status: 201 }, request, env);
}

async function handleGetUnreadCount(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const result = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0'
  ).bind(user.id).first();

  return corsJson({ ok: true, unread: result?.count || 0 }, {}, request, env);
}

// ─── Subscription Routes ─────────────────────────────────────────────────────

async function handleGetSubscriptionStatus(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const sub = await env.DB.prepare('SELECT * FROM subscriptions WHERE user_id = ?').bind(user.id).first();

  if (sub) {
    return corsJson({
      ok: true,
      subscription: {
        plan: sub.plan,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_ends_at: sub.trial_ends_at,
      }
    }, {}, request, env);
  }

  // Check for active moderator grant as fallback
  const modGrant = await env.DB.prepare(
    "SELECT expires_at FROM moderator_grants WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')"
  ).bind(user.id).first();
  if (modGrant) {
    return corsJson({ ok: true, subscription: { active: true, plan: 'moderator', expires_at: modGrant.expires_at, source: 'moderator_grant', status: 'active' } }, {}, request, env);
  }

  return corsJson({ ok: true, subscription: { plan: 'free', status: 'active' } }, {}, request, env);
}

// ─── Stripe Integration ───────────────────────────────────────────────────

async function verifyStripeSignature(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return null;
  const sig = request.headers.get('stripe-signature');
  if (!sig) return null;

  const body = await request.text();
  // Parse signature header
  const parts = {};
  for (const item of sig.split(',')) {
    const [key, val] = item.split('=');
    parts[key.trim()] = val;
  }
  const timestamp = parts.t;
  const v1Sig = parts.v1;
  if (!timestamp || !v1Sig) return null;

  // Reject events older than 5 minutes (replay protection)
  const eventAge = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp));
  if (eventAge > 300) return null;

  // Verify HMAC
  const encoder = new TextEncoder();
  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(env.STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected !== v1Sig) return null;

  return JSON.parse(body);
}

async function handleStripeWebhook(request, env) {
  let event;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return corsJson({ ok: false, error: 'Webhook secret not configured' }, { status: 503 }, request, env);
  }
  event = await verifyStripeSignature(request.clone(), env);
  if (!event) return corsJson({ ok: false, error: 'Invalid signature' }, { status: 400 }, request, env);
  if (!event) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const now = isoNow();

  switch (event.type) {
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const stripeSubId = sub.id;
      const status = sub.status === 'active' ? 'active' : sub.status === 'trialing' ? 'active' : 'cancelled';
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
      const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null;

      await env.DB.prepare(`
        UPDATE subscriptions SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = ?
        WHERE stripe_subscription_id = ?
      `).bind(status, periodStart, periodEnd, now, stripeSubId).run();
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await env.DB.prepare(`
        UPDATE subscriptions SET plan = 'free', status = 'cancelled', updated_at = ?
        WHERE stripe_subscription_id = ?
      `).bind(now, sub.id).run();
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Handle donation checkout completions (mode === 'payment')
      if (session.mode === 'payment' && session.metadata?.donation_id) {
        await env.DB.prepare(`
          UPDATE support_donations SET status = 'completed', stripe_session_id = ?
          WHERE id = ?
        `).bind(session.id, parseInt(session.metadata.donation_id)).run().catch(() => {});
      }
      // Handle subscription checkout completions (mode === 'subscription')
      if (session.mode === 'subscription') {
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan || 'premium';
        if (userId) {
          await env.DB.prepare(`
            UPDATE subscriptions SET plan = ?, status = 'active', stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = ?
            WHERE user_id = ?
          `).bind(plan, customerId || '', subscriptionId || '', now, parseInt(userId)).run();
        }
      }
      break;
    }
  }

  return corsJson({ ok: true }, {}, request, env);
}

async function handleCreateCheckout(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  if (!env.STRIPE_SECRET_KEY) {
    return corsJson({ ok: false, error: 'Stripe not configured' }, { status: 503 }, request, env);
  }

  const body = await readJson(request);
  const plan = body?.plan || 'premium_athlete';

  const priceId = plan === 'premium_gym'
    ? (env.STRIPE_PRICE_PREMIUM_GYM || '')
    : (env.STRIPE_PRICE_PREMIUM_ATHLETE || '');

  if (!priceId) {
    return corsJson({ ok: false, error: 'Price not configured for this plan' }, { status: 400 }, request, env);
  }

  const frontendUrl = env.FRONTEND_URL || FRONTEND_URL;

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${frontendUrl}/app/settings?checkout=success`,
      'cancel_url': `${frontendUrl}/app/settings?checkout=cancelled`,
      'customer_email': user.email,
      'metadata[user_id]': String(user.id),
      'metadata[plan]': plan,
      'subscription_data[trial_period_days]': '30',
    }),
  });

  const session = await res.json();
  if (!res.ok) {
    return corsJson({ ok: false, error: session.error?.message || 'Stripe error' }, { status: 400 }, request, env);
  }

  return corsJson({ ok: true, url: session.url, session_id: session.id }, {}, request, env);
}

async function handleSubscriptionWebhook(request, env) {
  // Legacy webhook endpoint — redirect to Stripe handler
  return handleStripeWebhook(request, env);
}

// ─── Notification Routes ─────────────────────────────────────────────────────

async function handleGetNotifications(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const results = await env.DB.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(user.id).all();

  const unreadCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
  ).bind(user.id).first();

  return corsJson({
    ok: true,
    notifications: (results.results || []).map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: JSON.parse(n.data || '{}'),
      read: n.read === 1,
      created_at: n.created_at,
    })),
    unread_count: unreadCount?.count || 0,
  }, {}, request, env);
}

async function handleMarkNotificationsRead(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  await env.DB.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').bind(user.id).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Review Routes ───────────────────────────────────────────────────────────

async function handleCreateReview(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Rate limit: 10 reviews per hour per user
  const allowed = await checkRateLimit(env, `review:${user.id}`, 10, 3600);
  if (!allowed) return corsJson({ ok: false, error: 'Too many reviews. Try again later.' }, { status: 429 }, request, env);

  const body = await readJson(request);
  if (!body || !body.gym_id || !body.rating) {
    return corsJson({ ok: false, error: 'Gym ID and rating are required' }, { status: 400 }, request, env);
  }

  const rating = Math.min(5, Math.max(1, parseInt(body.rating)));
  const comment = sanitize(body.comment || '');
  const now = isoNow();

  // Check for existing review
  const existing = await env.DB.prepare(
    'SELECT id FROM gym_reviews WHERE user_id = ? AND gym_id = ?'
  ).bind(user.id, body.gym_id).first();

  if (existing) {
    await env.DB.prepare(
      'UPDATE gym_reviews SET rating = ?, comment = ?, created_at = ? WHERE id = ?'
    ).bind(rating, comment, now, existing.id).run();
  } else {
    await env.DB.prepare(
      'INSERT INTO gym_reviews (gym_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(body.gym_id, user.id, rating, comment, now).run();
  }

  // Update gym average rating
  const avgResult = await env.DB.prepare(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM gym_reviews WHERE gym_id = ?'
  ).bind(body.gym_id).first();

  await env.DB.prepare(
    'UPDATE gyms SET rating = ?, review_count = ? WHERE id = ?'
  ).bind(Math.round(avgResult.avg_rating * 10) / 10, avgResult.count, body.gym_id).run();

  return corsJson({ ok: true }, { status: 201 }, request, env);
}

// ─── Password Reset Routes ───────────────────────────────────────────────────

async function handleForgotPassword(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const email = sanitize(normalizeText(body.email)).toLowerCase();
  if (!email) return corsJson({ ok: false, error: 'Email is required' }, { status: 400 }, request, env);

  // Rate limit: 3 reset requests per email per hour
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `forgot:${ip}`, 3, 3600);
  if (!allowed) {
    // Always return success to prevent enumeration
    return corsJson({ ok: true }, {}, request, env);
  }

  const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first();
  if (user) {
    // Generate reset token (UUID) and set 1-hour expiry
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    await env.DB.prepare(
      'UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = ? WHERE id = ?'
    ).bind(resetToken, expires, isoNow(), user.id).run();

    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail(env, {
      to: email,
      subject: 'Reset your Training Partner password',
      html: passwordResetEmailHtml(resetUrl),
    });
  }

  // Always return success to prevent email enumeration
  return corsJson({ ok: true }, {}, request, env);
}

async function handleResetPassword(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const token = normalizeText(body.token);
  const password = body.password || '';

  if (!token || !password) {
    return corsJson({ ok: false, error: 'Token and new password are required' }, { status: 400 }, request, env);
  }
  if (password.length < 8 || password.length > 128) {
    return corsJson({ ok: false, error: 'Password must be 8-128 characters' }, { status: 400 }, request, env);
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return corsJson({ ok: false, error: 'Password must include uppercase, lowercase, and a number' }, { status: 400 }, request, env);
  }

  // Rate limit: 5 reset attempts per IP per 15 minutes
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `reset:${ip}`, 5, 900);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 }, request, env);
  }

  // Find user with valid, non-expired reset token
  const user = await env.DB.prepare(
    'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > ?'
  ).bind(token, isoNow()).first();

  if (!user) {
    return corsJson({ ok: false, error: 'Invalid or expired reset token' }, { status: 400 }, request, env);
  }

  // Hash new password and clear reset token
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = isoNow();

  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, password_salt = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, salt, now, user.id).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Email Verification Route ────────────────────────────────────────────────

async function handleVerifyEmail(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return corsJson({ ok: false, error: 'Verification token is required' }, { status: 400 }, request, env);
  }

  const user = await env.DB.prepare(
    'SELECT id FROM users WHERE verification_token = ? AND email_verified = 0'
  ).bind(token).first();

  if (!user) {
    return corsJson({ ok: false, error: 'Invalid or already used verification token' }, { status: 400 }, request, env);
  }

  await env.DB.prepare(
    'UPDATE users SET email_verified = 1, verification_token = NULL, updated_at = ? WHERE id = ?'
  ).bind(isoNow(), user.id).run();

  return corsJson({ ok: true, message: 'Email verified successfully' }, {}, request, env);
}

async function handleResendVerification(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  if (user.email_verified) {
    return corsJson({ ok: false, error: 'Email is already verified' }, { status: 400 }, request, env);
  }

  // Rate limit: 3 resends per user per hour
  const allowed = await checkRateLimit(env, `verify-resend:${user.id}`, 3, 3600);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many requests. Try again later.' }, { status: 429 }, request, env);
  }

  const verificationToken = crypto.randomUUID();
  await env.DB.prepare(
    'UPDATE users SET verification_token = ?, updated_at = ? WHERE id = ?'
  ).bind(verificationToken, isoNow(), user.id).run();

  const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  await sendEmail(env, {
    to: user.email,
    subject: 'Verify your Training Partner email',
    html: verificationEmailHtml(verifyUrl),
  });

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Report User Route ──────────────────────────────────────────────────────

async function handleReportUser(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.user_id) {
    return corsJson({ ok: false, error: 'User ID is required' }, { status: 400 }, request, env);
  }

  const reportedId = parseInt(body.user_id);
  if (reportedId === user.id) {
    return corsJson({ ok: false, error: 'Cannot report yourself' }, { status: 400 }, request, env);
  }

  // Rate limit: 5 reports per user per day
  const allowed = await checkRateLimit(env, `report:${user.id}`, 5, 86400);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many reports. Try again later.' }, { status: 429 }, request, env);
  }

  // Check reported user exists
  const reported = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(reportedId).first();
  if (!reported) {
    return corsJson({ ok: false, error: 'User not found' }, { status: 404 }, request, env);
  }

  const validReasons = ['harassment', 'inappropriate_content', 'fake_identity', 'underage', 'threatening_behavior', 'spam', 'other'];
  const reason = validReasons.includes(body.reason) ? body.reason : 'other';
  const details = sanitize(body.details || '').slice(0, 2000);
  const now = isoNow();

  await env.DB.prepare(
    'INSERT INTO reports (reporter_id, reported_id, reason, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(user.id, reportedId, reason, details, 'pending', now).run();

  // Create a notification for admin review (user_id=1 assumed admin for now)
  await env.DB.prepare(
    'INSERT INTO notifications (user_id, type, title, body, data, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
  ).bind(1, 'report', 'New User Report', `${user.display_name} reported user #${reportedId}: ${reason}`, JSON.stringify({ reporter_id: user.id, reported_id: reportedId }), now).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Account Deletion Route ──────────────────────────────────────────────────

async function handleDeleteAccount(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  const confirmation = body?.confirmation || '';

  if (confirmation !== 'DELETE') {
    return corsJson({ ok: false, error: 'Please type DELETE to confirm account deletion' }, { status: 400 }, request, env);
  }

  // Delete user data in order (respecting foreign keys)
  const userId = user.id;
  const now = isoNow();

  try {
    // Delete messages
    await env.DB.prepare('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?').bind(userId, userId).run();
    // Delete bookings
    await env.DB.prepare('DELETE FROM bookings WHERE user_id = ?').bind(userId).run();
    // Delete notifications
    await env.DB.prepare('DELETE FROM notifications WHERE user_id = ?').bind(userId).run();
    // Delete reports (both as reporter and reported)
    await env.DB.prepare('DELETE FROM reports WHERE reporter_id = ? OR reported_id = ?').bind(userId, userId).run();
    // Delete blocked users (both legacy and new tables)
    await env.DB.prepare('DELETE FROM blocked_users WHERE blocker_id = ? OR blocked_id = ?').bind(userId, userId).run();
    await env.DB.prepare('DELETE FROM blocks WHERE blocker_id = ? OR blocked_id = ?').bind(userId, userId).run();
    // Delete gym reviews
    await env.DB.prepare('DELETE FROM gym_reviews WHERE user_id = ?').bind(userId).run();
    // Delete favorite gyms
    await env.DB.prepare('DELETE FROM favorite_gyms WHERE user_id = ?').bind(userId).run();
    // Delete subscription
    await env.DB.prepare('DELETE FROM subscriptions WHERE user_id = ?').bind(userId).run();
    // Delete profile
    await env.DB.prepare('DELETE FROM user_profiles WHERE user_id = ?').bind(userId).run();
    // Delete user
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    return corsJson({ ok: true, message: 'Account deleted' }, {}, request, env);
  } catch (e) {
    console.error('Account deletion error:', e);
    return corsJson({ ok: false, error: 'Failed to delete account' }, { status: 500 }, request, env);
  }
}

// ─── Avatar Upload Route ─────────────────────────────────────────────────────
// TODO: Migrate to Cloudflare R2 for image storage post-launch

async function handleUploadAvatar(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.avatar) {
    return corsJson({ ok: false, error: 'Avatar data is required' }, { status: 400 }, request, env);
  }

  // Accept base64 data URL (data:image/...) up to ~50KB
  // TODO: Post-launch — migrate to Cloudflare R2 for image storage
  const avatar = body.avatar;
  if (!avatar.startsWith('data:image/')) {
    return corsJson({ ok: false, error: 'Invalid image format. Must be a data URL.' }, { status: 400 }, request, env);
  }

  // Validate MIME type — only allow common image formats
  const mimeMatch = avatar.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/);
  if (!mimeMatch) {
    return corsJson({ ok: false, error: 'Unsupported image type. Use JPEG, PNG, GIF, or WebP.' }, { status: 400 }, request, env);
  }

  // Rough size check (~50KB base64 = ~68000 chars)
  if (avatar.length > 68000) {
    return corsJson({ ok: false, error: 'Image too large. Maximum ~50KB.' }, { status: 400 }, request, env);
  }

  // Rate limit: 10 uploads per user per hour
  const allowed = await checkRateLimit(env, `avatar:${user.id}`, 10, 3600);
  if (!allowed) {
    return corsJson({ ok: false, error: 'Too many uploads. Try again later.' }, { status: 429 }, request, env);
  }

  await env.DB.prepare(
    'UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?'
  ).bind(avatar, isoNow(), user.id).run()

  return corsJson({ ok: true, avatar_url: avatar }, {}, request, env);
}

// POST /api/upload-image — generic image upload to R2
async function handleImageUpload(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const purpose = formData.get('purpose') || 'general';

    if (!file || !file.size) {
      return corsJson({ ok: false, error: 'No file provided' }, { status: 400 }, request, env);
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return corsJson({ ok: false, error: 'Unsupported image type' }, { status: 400 }, request, env);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return corsJson({ ok: false, error: 'Image too large (max 5MB)' }, { status: 400 }, request, env);
    }

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const key = `${purpose}/${user.id}/${Date.now()}.${ext}`;
    const data = await file.arrayBuffer();
    const url = await uploadImageToR2(env, key, data, file.type);

    // Log for moderation review
    await env.DB.prepare(
      'INSERT INTO image_reviews (image_key, uploader_id, status) VALUES (?, ?, ?)'
    ).bind(key, user.id, 'approved').run();

    return corsJson({ ok: true, url, key }, {}, request, env);
  } catch (err) {
    return corsJson({ ok: false, error: err.message }, { status: 500 }, request, env);
  }
}

// ─── Moderator Admin Endpoints ──────────────────────────────────────────────

// GET /api/admin/moderators — list all moderators
async function handleListModerators(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'admin') return corsJson({ ok: false, error: 'Admin only' }, { status: 403 }, request, env);
  const mods = await env.DB.prepare(
    "SELECT mg.*, u.display_name, u.email FROM moderator_grants mg JOIN users u ON u.id = mg.user_id ORDER BY mg.granted_at DESC"
  ).all();
  return corsJson({ ok: true, moderators: mods.results }, {}, request, env);
}

// POST /api/admin/moderators/grant — grant moderator status
async function handleGrantModerator(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'admin') return corsJson({ ok: false, error: 'Admin only' }, { status: 403 }, request, env);
  const { user_id, months, notes } = await readJson(request);
  if (!user_id || !months) return corsJson({ ok: false, error: 'user_id and months required' }, { status: 400 }, request, env);
  const expires = new Date();
  expires.setMonth(expires.getMonth() + months);
  await env.DB.prepare(
    "INSERT OR REPLACE INTO moderator_grants (user_id, granted_by, expires_at, status, notes) VALUES (?, ?, ?, 'active', ?)"
  ).bind(user_id, user.id, expires.toISOString(), notes || '').run();
  return corsJson({ ok: true }, {}, request, env);
}

// POST /api/admin/moderators/revoke — revoke moderator status
async function handleRevokeModerator(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'admin') return corsJson({ ok: false, error: 'Admin only' }, { status: 403 }, request, env);
  const { user_id } = await readJson(request);
  await env.DB.prepare("UPDATE moderator_grants SET status = 'revoked' WHERE user_id = ?").bind(user_id).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Moderation Queue Endpoints ─────────────────────────────────────────────

// GET /api/moderation/queue — flagged images for review
async function handleModerationQueue(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const isMod = await isModeratorOrAdmin(env, user.id);
  if (!isMod) return corsJson({ ok: false, error: 'Moderator access required' }, { status: 403 }, request, env);
  const flagged = await env.DB.prepare(
    "SELECT ir.*, u.display_name, u.email FROM image_reviews ir JOIN users u ON u.id = ir.uploader_id WHERE ir.status = 'flagged' ORDER BY ir.created_at DESC LIMIT 50"
  ).all();
  return corsJson({ ok: true, items: flagged.results }, {}, request, env);
}

// POST /api/moderation/review — approve or reject an image
async function handleModerationReview(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const isMod = await isModeratorOrAdmin(env, user.id);
  if (!isMod) return corsJson({ ok: false, error: 'Moderator access required' }, { status: 403 }, request, env);
  const { image_id, action } = await readJson(request);
  if (!['approved', 'rejected'].includes(action)) {
    return corsJson({ ok: false, error: 'action must be approved or rejected' }, { status: 400 }, request, env);
  }
  await env.DB.prepare(
    "UPDATE image_reviews SET status = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?"
  ).bind(action, user.id, image_id).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Block User Route ────────────────────────────────────────────────────────

async function handleBlockUser(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const method = request.method;

  // GET /api/block — list blocked users (delegates to blocks table)
  if (method === 'GET') {
    const results = await env.DB.prepare(`
      SELECT b.id, b.blocked_id, b.created_at,
             u.display_name, u.avatar_url
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = ?
      ORDER BY b.created_at DESC
    `).bind(user.id).all();

    return corsJson({ ok: true, blocks: (results.results || []).map(b => ({
      id: b.id,
      user_id: b.blocked_id,
      name: b.display_name,
      avatar_url: b.avatar_url,
      created_at: b.created_at,
    })) }, {}, request, env);
  }

  // DELETE /api/block — unblock user (delegates to blocks table)
  if (method === 'DELETE') {
    const body = await readJson(request);
    if (!body || !body.user_id) {
      return corsJson({ ok: false, error: 'User ID is required' }, { status: 400 }, request, env);
    }
    await env.DB.prepare(
      'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
    ).bind(user.id, body.user_id).run();
    return corsJson({ ok: true }, {}, request, env);
  }

  // POST /api/block — block user (delegates to blocks table)
  // Rate limit: 20 blocks per hour per user
  const allowed = await checkRateLimit(env, `block:${user.id}`, 20, 3600);
  if (!allowed) return corsJson({ ok: false, error: 'Too many block requests. Try again later.' }, { status: 429 }, request, env);

  const body = await readJson(request);
  if (!body || !body.user_id) {
    return corsJson({ ok: false, error: 'User ID is required' }, { status: 400 }, request, env);
  }

  const blockedId = parseInt(body.user_id);
  if (blockedId === user.id) {
    return corsJson({ ok: false, error: 'You cannot block yourself' }, { status: 400 }, request, env);
  }

  const now = isoNow();
  try {
    await env.DB.prepare(
      'INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)'
    ).bind(user.id, blockedId, now).run();
  } catch (e) {
    // Handle duplicate gracefully
    if (e.message && e.message.includes('UNIQUE')) {
      return corsJson({ ok: true }, {}, request, env);
    }
    throw e;
  }

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Trust & Safety: Identity Verification ──────────────────────────────────

async function handleSubmitIdentity(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const idPhoto = body.id_photo;
  const selfiePhoto = body.selfie_photo;

  if (!idPhoto || !selfiePhoto) {
    return corsJson({ ok: false, error: 'Both id_photo and selfie_photo are required' }, { status: 400 }, request, env);
  }

  // Validate max 200KB per photo (base64 ~1.37x original, 200KB = ~273000 base64 chars)
  if (idPhoto.length > 273000) {
    return corsJson({ ok: false, error: 'ID photo exceeds maximum size of 200KB' }, { status: 400 }, request, env);
  }
  if (selfiePhoto.length > 273000) {
    return corsJson({ ok: false, error: 'Selfie photo exceeds maximum size of 200KB' }, { status: 400 }, request, env);
  }

  // Check if user already has a pending or approved verification
  const existing = await env.DB.prepare(
    "SELECT id, status FROM identity_verifications WHERE user_id = ? AND status IN ('pending', 'approved')"
  ).bind(user.id).first();
  if (existing) {
    return corsJson({ ok: false, error: `You already have a ${existing.status} verification` }, { status: 409 }, request, env);
  }

  const now = isoNow();
  await env.DB.prepare(
    'INSERT INTO identity_verifications (user_id, id_photo, selfie_photo, status, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, idPhoto, selfiePhoto, 'pending', now).run();

  return corsJson({ ok: true, status: 'pending' }, {}, request, env);
}

async function handleGetIdentityStatus(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const verification = await env.DB.prepare(
    'SELECT status, created_at, reviewed_at, reviewer_notes FROM identity_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1'
  ).bind(user.id).first();

  if (!verification) {
    return corsJson({ ok: true, verification: null }, {}, request, env);
  }

  return corsJson({ ok: true, verification: {
    status: verification.status,
    created_at: verification.created_at,
    reviewed_at: verification.reviewed_at,
    reviewer_notes: verification.reviewer_notes,
  } }, {}, request, env);
}

async function handleDeleteIdentityData(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  await env.DB.prepare('DELETE FROM identity_verifications WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('UPDATE users SET verified = 0 WHERE id = ?').bind(user.id).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Trust & Safety: Reputation / Session Ratings ────────────────────────────

async function handleSubmitRating(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const ratedId = parseInt(body.rated_id);
  const rating = body.rating;

  if (!ratedId || (rating !== 1 && rating !== -1)) {
    return corsJson({ ok: false, error: 'rated_id and rating (1 or -1) are required' }, { status: 400 }, request, env);
  }

  if (ratedId === user.id) {
    return corsJson({ ok: false, error: 'You cannot rate yourself' }, { status: 400 }, request, env);
  }

  // Mutual unlock check: verify both users checked in at same gym on same day
  const colocated = await env.DB.prepare(`
    SELECT DISTINCT c1.gym_id FROM checkins c1
    JOIN checkins c2 ON c1.gym_id = c2.gym_id AND DATE(c1.created_at) = DATE(c2.created_at)
    WHERE c1.user_id = ? AND c2.user_id = ? AND DATE(c1.created_at) = DATE('now')
  `).bind(user.id, ratedId).first();

  if (!colocated) {
    return corsJson({ ok: false, error: "You can only rate someone you've trained with today" }, { status: 403 }, request, env);
  }

  const now = isoNow();
  try {
    await env.DB.prepare(
      'INSERT INTO session_ratings (rater_id, rated_id, gym_id, rating, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(user.id, ratedId, colocated.gym_id, rating, now).run();
  } catch (e) {
    // Handle unique constraint violation (already rated today)
    if (e.message && e.message.includes('UNIQUE')) {
      return corsJson({ ok: false, error: 'You have already rated this user today' }, { status: 409 }, request, env);
    }
    throw e;
  }

  return corsJson({ ok: true }, {}, request, env);
}

async function handleGetTrustScore(request, env, ratedUserId) {
  // Count total check-ins for the rated user
  const checkinCount = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM checkins WHERE user_id = ?'
  ).bind(ratedUserId).first();

  const count = checkinCount ? checkinCount.cnt : 0;

  if (count < 10) {
    return corsJson({ ok: true, score: null, locked: true, sessions_remaining: 10 - count }, {}, request, env);
  }

  // Calculate trust score
  const stats = await env.DB.prepare(
    'SELECT COUNT(*) as total, SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as thumbs_up FROM session_ratings WHERE rated_id = ?'
  ).bind(ratedUserId).first();

  const total = stats ? stats.total : 0;
  const thumbsUp = stats ? stats.thumbs_up : 0;
  const percentage = total > 0 ? Math.round((thumbsUp / total) * 100) : null;

  return corsJson({ ok: true, score: { percentage, total_ratings: total, locked: false } }, {}, request, env);
}

async function handleCanRate(request, env, ratedUserId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Check if both users checked in at same gym today
  const colocated = await env.DB.prepare(`
    SELECT DISTINCT c1.gym_id FROM checkins c1
    JOIN checkins c2 ON c1.gym_id = c2.gym_id AND DATE(c1.created_at) = DATE(c2.created_at)
    WHERE c1.user_id = ? AND c2.user_id = ? AND DATE(c1.created_at) = DATE('now')
  `).bind(user.id, ratedUserId).first();

  if (!colocated) {
    return corsJson({ ok: true, can_rate: false, reason: 'You must train at the same gym today to rate this user' }, {}, request, env);
  }

  // Check if already rated today
  const alreadyRated = await env.DB.prepare(
    "SELECT id FROM session_ratings WHERE rater_id = ? AND rated_id = ? AND DATE(created_at) = DATE('now')"
  ).bind(user.id, ratedUserId).first();

  if (alreadyRated) {
    return corsJson({ ok: true, can_rate: false, reason: 'You have already rated this user today' }, {}, request, env);
  }

  return corsJson({ ok: true, can_rate: true, reason: 'Eligible to rate' }, {}, request, env);
}

// ─── Trust & Safety: Block System ────────────────────────────────────────────

async function handleTsBlockUser(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.blocked_id) {
    return corsJson({ ok: false, error: 'blocked_id is required' }, { status: 400 }, request, env);
  }

  const blockedId = parseInt(body.blocked_id);
  if (blockedId === user.id) {
    return corsJson({ ok: false, error: 'You cannot block yourself' }, { status: 400 }, request, env);
  }

  const now = isoNow();
  try {
    await env.DB.prepare(
      'INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)'
    ).bind(user.id, blockedId, now).run();
  } catch (e) {
    // Handle duplicate gracefully
    if (e.message && e.message.includes('UNIQUE')) {
      return corsJson({ ok: true }, {}, request, env);
    }
    throw e;
  }

  return corsJson({ ok: true }, {}, request, env);
}

async function handleTsUnblockUser(request, env, blockedUserId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  await env.DB.prepare(
    'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
  ).bind(user.id, blockedUserId).run();

  return corsJson({ ok: true }, {}, request, env);
}

async function handleGetBlocks(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const results = await env.DB.prepare(`
    SELECT b.id, b.blocked_id, b.created_at,
           u.display_name, u.avatar_url
    FROM blocks b
    JOIN users u ON b.blocked_id = u.id
    WHERE b.blocker_id = ?
    ORDER BY b.created_at DESC
  `).bind(user.id).all();

  return corsJson({ ok: true, blocks: (results.results || []).map(b => ({
    id: b.id,
    blocked_id: b.blocked_id,
    display_name: b.display_name,
    avatar_url: b.avatar_url,
    created_at: b.created_at,
  })) }, {}, request, env);
}

// ─── Trust & Safety: Emergency Contact ───────────────────────────────────────

async function handleUpdateEmergencyContact(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const name = sanitize(body.name || '').slice(0, 100);
  const phone = sanitize(body.phone || '').slice(0, 30);
  const relation = sanitize(body.relation || '').slice(0, 50);

  await env.DB.prepare(
    'UPDATE users SET emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?, updated_at = ? WHERE id = ?'
  ).bind(name || null, phone || null, relation || null, isoNow(), user.id).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Trust & Safety: Admin Identity Review ───────────────────────────────────

async function handleAdminGetPendingIdentities(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const results = await env.DB.prepare(`
    SELECT iv.id, iv.user_id, iv.id_photo, iv.selfie_photo, iv.status, iv.created_at,
           u.display_name, u.email, u.avatar_url
    FROM identity_verifications iv
    JOIN users u ON iv.user_id = u.id
    WHERE iv.status = 'pending'
    ORDER BY iv.created_at ASC
  `).all();

  return corsJson({ ok: true, verifications: results.results || [] }, {}, request, env);
}

async function handleAdminReviewIdentity(request, env, verificationId) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const status = body.status;
  if (status !== 'approved' && status !== 'rejected') {
    return corsJson({ ok: false, error: 'Status must be approved or rejected' }, { status: 400 }, request, env);
  }

  const reviewerNotes = sanitize(body.reviewer_notes || '').slice(0, 1000);
  const now = isoNow();

  // Get the verification to find the user
  const verification = await env.DB.prepare('SELECT user_id FROM identity_verifications WHERE id = ?').bind(verificationId).first();
  if (!verification) {
    return corsJson({ ok: false, error: 'Verification not found' }, { status: 404 }, request, env);
  }

  await env.DB.prepare(
    'UPDATE identity_verifications SET status = ?, reviewer_notes = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?'
  ).bind(status, reviewerNotes, user.id, now, verificationId).run();

  if (status === 'approved') {
    await env.DB.prepare('UPDATE users SET verified = 1 WHERE id = ?').bind(verification.user_id).run();
  }

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Admin Routes ────────────────────────────────────────────────────────────

async function requireAdmin(request, env) {
  const user = await getUser(request, env);
  if (!user) return { error: corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env) };
  if (user.role !== 'admin') {
    return { error: corsJson({ ok: false, error: 'Forbidden' }, { status: 403 }, request, env) };
  }
  return { user };
}

async function handleAdminStats(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const [userCount, profileCount, gymCount, messageCount, reportCount, bookingCount] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM user_profiles WHERE profile_complete = 1').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM gyms').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM messages').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM reports WHERE status = ?').bind('pending').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM bookings WHERE status = ?').bind('confirmed').first(),
  ]);

  // Recent signups (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const recentSignups = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM users WHERE created_at > ?'
  ).bind(weekAgo).first();

  return corsJson({
    ok: true,
    stats: {
      total_users: userCount?.cnt || 0,
      complete_profiles: profileCount?.cnt || 0,
      total_gyms: gymCount?.cnt || 0,
      total_messages: messageCount?.cnt || 0,
      pending_reports: reportCount?.cnt || 0,
      active_bookings: bookingCount?.cnt || 0,
      recent_signups: recentSignups?.cnt || 0,
    }
  }, {}, request, env);
}

async function handleAdminUsers(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const search = url.searchParams.get('search') || '';

  let query = 'SELECT id, email, display_name, role, city, email_verified, created_at FROM users';
  const params = [];

  if (search) {
    query += ' WHERE display_name LIKE ? OR email LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const users = await env.DB.prepare(query).bind(...params).all();
  const total = await env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first();

  return corsJson({
    ok: true,
    users: users.results || [],
    total: total?.cnt || 0,
  }, {}, request, env);
}

async function handleAdminReports(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';

  const reports = await env.DB.prepare(`
    SELECT r.*,
      reporter.display_name as reporter_name, reporter.email as reporter_email,
      reported.display_name as reported_name, reported.email as reported_email
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN users reported ON r.reported_id = reported.id
    WHERE r.status = ?
    ORDER BY r.created_at DESC
    LIMIT 50
  `).bind(status).all();

  return corsJson({
    ok: true,
    reports: reports.results || [],
  }, {}, request, env);
}

async function handleAdminResolveReport(request, env, reportId) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const body = await readJson(request);
  const newStatus = body?.status || 'resolved';
  const now = isoNow();

  await env.DB.prepare(
    'UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?'
  ).bind(newStatus, user.id, now, reportId).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Existing Routes (kept) ──────────────────────────────────────────────────

async function ensureSchema(env) {
  if (!env.DB) return;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS founding_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL,
      city TEXT, sport TEXT, goal TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new'
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS waitlist_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL, name TEXT, email TEXT NOT NULL, role TEXT,
      city TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new'
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS open_mats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, city TEXT NOT NULL, sport TEXT NOT NULL,
      venue TEXT, day_of_week TEXT, notes TEXT, is_active INTEGER NOT NULL DEFAULT 1
    )
  `).run();
}

async function listOpenMats(env) {
  if (!env.DB) return [];
  await ensureSchema(env);
  const rows = await env.DB.prepare('SELECT * FROM open_mats WHERE is_active = 1 ORDER BY city, title').all();
  return rows.results || [];
}

async function handleFoundingApply(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'invalid_json' }, { status: 400 }, request, env);
  const name = sanitize(body.name);
  const email = sanitize(body.email).toLowerCase();
  const role = sanitize(body.role);
  if (!name || !email || !role) return corsJson({ ok: false, error: 'missing_required_fields' }, { status: 400 }, request, env);
  if (env.DB) {
    await ensureSchema(env);
    await env.DB.prepare(`INSERT INTO founding_applications (created_at, name, email, role, city, sport, goal, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(isoNow(), name, email, role, sanitize(body.city), sanitize(body.sport), sanitize(body.goal), sanitize(body.notes)).run();
  }
  return corsJson({ ok: true, status: 'received' }, {}, request, env);
}

async function handleWaitlist(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'invalid_json' }, { status: 400 }, request, env);
  const email = sanitize(body.email).toLowerCase();
  if (!email) return corsJson({ ok: false, error: 'missing_email' }, { status: 400 }, request, env);
  if (env.DB) {
    await ensureSchema(env);
    await env.DB.prepare(`INSERT INTO waitlist_signups (created_at, name, email, role, city, notes) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(isoNow(), sanitize(body.name), email, sanitize(body.role), sanitize(body.city), sanitize(body.notes)).run();
  }
  return corsJson({ ok: true, status: 'received' }, {}, request, env);
}

// ─── Community Posts ─────────────────────────────────────────────────────────

async function handleGetPosts(request, env) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || '';
  const sport = url.searchParams.get('sport') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let where = [];
  let params = [];
  if (type) { where.push('p.type = ?'); params.push(type); }
  if (sport) { where.push('p.sport = ?'); params.push(sport); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM posts p ${whereClause}`).bind(...params).first();
  const results = await env.DB.prepare(`
    SELECT p.*, u.display_name as author_name, u.avatar_url as author_avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  // Check if current user liked each post
  const user = await getUser(request, env);
  const posts = (results.results || []).map(p => ({
    id: p.id,
    user_id: p.user_id,
    author_name: p.author_name,
    author_avatar: p.author_avatar,
    title: p.title,
    body: p.body,
    type: p.type,
    sport: p.sport,
    media_url: p.media_url,
    likes_count: p.likes_count,
    liked: false,
    created_at: p.created_at,
  }));

  if (user && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const likes = await env.DB.prepare(
      `SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN (${postIds.map(() => '?').join(',')})`
    ).bind(user.id, ...postIds).all();
    const likedSet = new Set((likes.results || []).map(l => l.post_id));
    posts.forEach(p => { p.liked = likedSet.has(p.id); });
  }

  return corsJson({ ok: true, posts, total: countResult?.total || 0 }, {}, request, env);
}

async function handleCreatePost(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const title = sanitize(body.title).slice(0, 200);
  const postBody = sanitize(body.body).slice(0, 5000);
  const type = ['article', 'tip', 'question', 'event'].includes(body.type) ? body.type : 'article';
  const sport = sanitize(body.sport || '').slice(0, 50);
  const mediaUrl = sanitize(body.media_url || '').slice(0, 500);

  if (!title || !postBody) {
    return corsJson({ ok: false, error: 'Title and body are required' }, { status: 400 }, request, env);
  }
  if (title.length < 3) {
    return corsJson({ ok: false, error: 'Title must be at least 3 characters' }, { status: 400 }, request, env);
  }

  // Rate limit: 10 posts per user per hour
  const allowed = await checkRateLimit(env, `post:${user.id}`, 10, 3600);
  if (!allowed) return corsJson({ ok: false, error: 'Too many posts. Try again later.' }, { status: 429 }, request, env);

  const now = isoNow();
  const result = await env.DB.prepare(`
    INSERT INTO posts (user_id, title, body, type, sport, media_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(user.id, title, postBody, type, sport, mediaUrl, now, now).run();

  return corsJson({ ok: true, post_id: result.meta.last_row_id }, { status: 201 }, request, env);
}

async function handleGetPost(request, env, postId) {
  const post = await env.DB.prepare(`
    SELECT p.*, u.display_name as author_name, u.avatar_url as author_avatar
    FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).bind(postId).first();
  if (!post) return corsJson({ ok: false, error: 'Post not found' }, { status: 404 }, request, env);

  const user = await getUser(request, env);
  let liked = false;
  if (user) {
    const like = await env.DB.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').bind(postId, user.id).first();
    liked = !!like;
  }

  return corsJson({ ok: true, post: { ...post, liked } }, {}, request, env);
}

async function handleDeletePost(request, env, postId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
  if (!post) return corsJson({ ok: false, error: 'Post not found' }, { status: 404 }, request, env);
  if (post.user_id !== user.id && user.role !== 'admin') {
    return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);
  }

  await env.DB.prepare('DELETE FROM post_likes WHERE post_id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
  return corsJson({ ok: true }, {}, request, env);
}

async function handleToggleLike(request, env, postId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const existing = await env.DB.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').bind(postId, user.id).first();
  if (existing) {
    await env.DB.prepare('DELETE FROM post_likes WHERE id = ?').bind(existing.id).run();
  } else {
    // Use INSERT OR IGNORE to prevent duplicate likes from concurrent requests
    await env.DB.prepare('INSERT OR IGNORE INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)').bind(postId, user.id, isoNow()).run();
  }
  // Sync count from actual rows to prevent drift
  const countResult = await env.DB.prepare('SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = ?').bind(postId).first();
  const newCount = countResult?.cnt || 0;
  await env.DB.prepare('UPDATE posts SET likes_count = ? WHERE id = ?').bind(newCount, postId).run();
  return corsJson({ ok: true, liked: !existing, likes_count: newCount }, {}, request, env);
}

// ─── Gym Documents & Private Lessons ──────────────────────────────────────

async function handleGetGymDocuments(request, env, gymId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Only gym owner or admin can view documents
  const gym = await env.DB.prepare('SELECT owner_id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);
  if (gym.owner_id !== user.id && user.role !== 'admin') {
    return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);
  }

  const docs = await env.DB.prepare('SELECT id, gym_id, type, name, verified, uploaded_at FROM gym_documents WHERE gym_id = ? ORDER BY uploaded_at DESC').bind(gymId).all();
  return corsJson({ ok: true, documents: docs.results || [] }, {}, request, env);
}

async function handleUploadGymDocument(request, env, gymId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const gym = await env.DB.prepare('SELECT owner_id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);
  if (gym.owner_id !== user.id) {
    return corsJson({ ok: false, error: 'Only gym owners can upload documents' }, { status: 403 }, request, env);
  }

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const type = ['insurance', 'certification', 'license', 'other'].includes(body.type) ? body.type : 'other';
  const name = sanitize(body.name || type);
  const fileData = body.file_data || '';

  if (!fileData) return corsJson({ ok: false, error: 'file_data is required' }, { status: 400 }, request, env);

  // Validate content type — only allow images and PDFs
  const allowedDocMimes = /^data:(image\/(jpeg|jpg|png|gif|webp)|application\/pdf);base64,/;
  if (!allowedDocMimes.test(fileData)) {
    return corsJson({ ok: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF' }, { status: 400 }, request, env);
  }

  // Limit file size (~200KB base64)
  if (fileData.length > 275000) {
    return corsJson({ ok: false, error: 'File too large. Max 200KB.' }, { status: 400 }, request, env);
  }

  const result = await env.DB.prepare(`
    INSERT INTO gym_documents (gym_id, type, name, file_data, uploaded_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(gymId, type, name, fileData, isoNow()).run();

  return corsJson({ ok: true, document_id: result.meta.last_row_id }, { status: 201 }, request, env);
}

async function handleDeleteGymDocument(request, env, gymId, docId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const gym = await env.DB.prepare('SELECT owner_id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym || (gym.owner_id !== user.id && user.role !== 'admin')) {
    return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);
  }

  await env.DB.prepare('DELETE FROM gym_documents WHERE id = ? AND gym_id = ?').bind(docId, gymId).run();
  return corsJson({ ok: true }, {}, request, env);
}

async function handleGetPrivateLessons(request, env, gymId) {
  const lessons = await env.DB.prepare(`
    SELECT pl.*, u.display_name as coach_name, u.avatar_url as coach_avatar
    FROM private_lessons pl JOIN users u ON pl.coach_user_id = u.id
    WHERE pl.gym_id = ? AND pl.available = 1
    ORDER BY pl.created_at DESC
  `).bind(gymId).all();

  return corsJson({ ok: true, lessons: (lessons.results || []).map(l => ({
    id: l.id, gym_id: l.gym_id, coach_user_id: l.coach_user_id,
    coach_name: l.coach_name, coach_avatar: l.coach_avatar,
    sport: l.sport, title: l.title, description: l.description,
    price_cents: l.price_cents, duration_minutes: l.duration_minutes,
    available: l.available, created_at: l.created_at,
  })) }, {}, request, env);
}

async function handleCreatePrivateLesson(request, env, gymId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const gym = await env.DB.prepare('SELECT owner_id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);
  if (gym.owner_id !== user.id) {
    return corsJson({ ok: false, error: 'Only gym owners can create lessons' }, { status: 403 }, request, env);
  }

  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  const sport = sanitize(body.sport);
  const title = sanitize(body.title);
  const description = sanitize(body.description || '');
  const priceCents = parseInt(body.price_cents) || 0;
  const durationMinutes = parseInt(body.duration_minutes) || 60;
  const coachUserId = body.coach_user_id || user.id;

  if (!sport || !title) return corsJson({ ok: false, error: 'Sport and title are required' }, { status: 400 }, request, env);

  const now = isoNow();
  const result = await env.DB.prepare(`
    INSERT INTO private_lessons (gym_id, coach_user_id, sport, title, description, price_cents, duration_minutes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(gymId, coachUserId, sport, title, description, priceCents, durationMinutes, now, now).run();

  return corsJson({ ok: true, lesson_id: result.meta.last_row_id }, { status: 201 }, request, env);
}

// ─── Post Comments ───────────────────────────────────────────────────────────

async function handleGetPostComments(request, env, postId) {
  const comments = await env.DB.prepare(`
    SELECT c.*, u.display_name as author_name, u.avatar_url as author_avatar
    FROM post_comments c JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).bind(postId).all();
  return corsJson({ ok: true, comments: comments.results || [] }, {}, request, env);
}

async function handleCreatePostComment(request, env, postId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Rate limit: 30 comments per 5 minutes per user
  const allowed = await checkRateLimit(env, `comment:${user.id}`, 30, 300);
  if (!allowed) return corsJson({ ok: false, error: 'Too many comments. Try again later.' }, { status: 429 }, request, env);

  const body = await readJson(request);
  if (!body || !body.body?.trim()) return corsJson({ ok: false, error: 'Comment body required' }, { status: 400 }, request, env);
  const parentId = body.parent_id || null;
  const now = isoNow();
  const result = await env.DB.prepare(`
    INSERT INTO post_comments (post_id, user_id, body, parent_id, created_at) VALUES (?, ?, ?, ?, ?)
  `).bind(postId, user.id, sanitize(body.body).slice(0, 2000), parentId, now).run();
  return corsJson({ ok: true, comment_id: result.meta.last_row_id }, { status: 201 }, request, env);
}

async function handleDeletePostComment(request, env, commentId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const comment = await env.DB.prepare('SELECT * FROM post_comments WHERE id = ?').bind(commentId).first();
  if (!comment) return corsJson({ ok: false, error: 'Comment not found' }, { status: 404 }, request, env);
  if (comment.user_id !== user.id && user.role !== 'admin') return corsJson({ ok: false, error: 'Forbidden' }, { status: 403 }, request, env);
  await env.DB.prepare('DELETE FROM post_comments WHERE id = ?').bind(commentId).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Feedback System ─────────────────────────────────────────────────────────

async function handleSubmitFeedback(request, env) {
  const user = await requireAuth(request, env).catch(() => null);
  const body = await readJson(request);
  if (!body || !body.body?.trim()) return corsJson({ ok: false, error: 'Feedback body required' }, { status: 400 }, request, env);
  const now = isoNow();
  const result = await env.DB.prepare(`
    INSERT INTO feedback (user_id, type, rating, title, body, page, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user?.id || null,
    sanitize(body.type || 'general'),
    body.rating || null,
    sanitize(body.title || '').slice(0, 200),
    sanitize(body.body).slice(0, 5000),
    sanitize(body.page || ''),
    request.headers.get('User-Agent') || '',
    now
  ).run();
  return corsJson({ ok: true, feedback_id: result.meta.last_row_id }, { status: 201 }, request, env);
}

async function handleGetFeedback(request, env) {
  const user = await requireAuth(request, env);
  if (!user || user.role !== 'admin') return corsJson({ ok: false, error: 'Forbidden' }, { status: 403 }, request, env);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'new';
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);
  const feedback = await env.DB.prepare(`
    SELECT f.*, u.display_name as user_name, u.email as user_email
    FROM feedback f LEFT JOIN users u ON f.user_id = u.id
    WHERE f.status = ? ORDER BY f.created_at DESC LIMIT ?
  `).bind(status, limit).all();
  return corsJson({ ok: true, feedback: feedback.results || [] }, {}, request, env);
}

// ─── Invite Codes (Alpha Launch) ─────────────────────────────────────────────

async function handleValidateInviteCode(request, env) {
  const body = await readJson(request);
  if (!body?.code) return corsJson({ ok: false, error: 'Invite code required' }, { status: 400 }, request, env);
  const code = await env.DB.prepare(`
    SELECT * FROM invite_codes WHERE code = ? AND is_active = 1
  `).bind(body.code.trim().toUpperCase()).first();
  if (!code) return corsJson({ ok: false, error: 'Invalid invite code' }, { status: 404 }, request, env);
  if (code.current_uses >= code.max_uses) return corsJson({ ok: false, error: 'Invite code is full' }, { status: 410 }, request, env);
  if (code.expires_at && new Date(code.expires_at) < new Date()) return corsJson({ ok: false, error: 'Invite code expired' }, { status: 410 }, request, env);
  return corsJson({ ok: true, valid: true, remaining: code.max_uses - code.current_uses }, {}, request, env);
}

async function handleRedeemInviteCode(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.code) return corsJson({ ok: false, error: 'Invite code required' }, { status: 400 }, request, env);
  const code = await env.DB.prepare('SELECT * FROM invite_codes WHERE code = ? AND is_active = 1').bind(body.code.trim().toUpperCase()).first();
  if (!code || code.current_uses >= code.max_uses) return corsJson({ ok: false, error: 'Invalid or full invite code' }, { status: 400 }, request, env);
  const existing = await env.DB.prepare('SELECT id FROM invite_redemptions WHERE code_id = ? AND user_id = ?').bind(code.id, user.id).first();
  if (existing) return corsJson({ ok: true, message: 'Already redeemed' }, {}, request, env);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO invite_redemptions (code_id, user_id, created_at) VALUES (?, ?, ?)').bind(code.id, user.id, isoNow()),
    env.DB.prepare('UPDATE invite_codes SET current_uses = current_uses + 1 WHERE id = ?').bind(code.id),
  ]);
  return corsJson({ ok: true, message: 'Invite code redeemed' }, {}, request, env);
}

async function handleCreateInviteCode(request, env) {
  const user = await requireAuth(request, env);
  if (!user || user.role !== 'admin') return corsJson({ ok: false, error: 'Forbidden' }, { status: 403 }, request, env);
  const body = await readJson(request);
  const code = (body?.code || generateInviteCode()).toUpperCase();
  const maxUses = parseInt(body?.max_uses) || 10;
  const expiresAt = body?.expires_at || null;
  const now = isoNow();
  await env.DB.prepare(`
    INSERT INTO invite_codes (code, created_by, max_uses, expires_at, created_at) VALUES (?, ?, ?, ?, ?)
  `).bind(code, user.id, maxUses, expiresAt, now).run();
  return corsJson({ ok: true, code }, { status: 201 }, request, env);
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TP-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─── User Invite Codes (Alpha) ──────────────────────────────────────────────

async function handleGetMyInviteCodes(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const codes = await env.DB.prepare(
    'SELECT code, max_uses, current_uses AS times_used, created_at FROM invite_codes WHERE created_by = ? ORDER BY created_at DESC'
  ).bind(user.id).all();
  return corsJson({ ok: true, codes: codes.results.map(c => ({ ...c, max_uses: c.max_uses || 5 })) }, {}, request, env);
}

async function handleGenerateUserInviteCode(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  // Limit: 10 codes per user
  const existing = await env.DB.prepare('SELECT COUNT(*) AS cnt FROM invite_codes WHERE created_by = ?').bind(user.id).first();
  if (existing.cnt >= 10) return corsJson({ ok: false, error: 'Maximum 10 invite codes per user' }, { status: 400 }, request, env);
  const code = generateInviteCode();
  const now = isoNow();
  await env.DB.prepare(
    'INSERT INTO invite_codes (code, created_by, max_uses, created_at) VALUES (?, ?, 5, ?)'
  ).bind(code, user.id, now).run();
  return corsJson({ ok: true, invite: { code, max_uses: 5, times_used: 0, created_at: now } }, { status: 201 }, request, env);
}

// ─── Support / Donations ─────────────────────────────────────────────────────

async function handleCreateSupportDonation(request, env) {
  const body = await readJson(request);
  if (!body || !body.amount_cents) {
    return corsJson({ ok: false, error: 'Donation amount is required' }, { status: 400 }, request, env);
  }
  const amountCents = Number(body.amount_cents);
  if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > 1000000) {
    return corsJson({ ok: false, error: 'Donation must be between $1.00 and $10,000.00' }, { status: 400 }, request, env);
  }
  const user = await requireAuth(request, env).catch(() => null);
  const now = isoNow();
  const result = await env.DB.prepare(`
    INSERT INTO support_donations (user_id, donor_name, donor_email, amount_cents, message, cause, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).bind(
    user?.id || null,
    sanitize(body.donor_name || user?.display_name || 'Anonymous').slice(0, 100),
    sanitize(body.donor_email || user?.email || '').slice(0, 200),
    amountCents,
    sanitize(body.message || '').slice(0, 500),
    sanitize(body.cause || 'tma'),
    now
  ).run();
  const donationId = result.meta.last_row_id;

  // Create Stripe checkout session for one-time donation
  if (!env.STRIPE_SECRET_KEY) {
    // No Stripe configured — return pending donation without checkout URL
    return corsJson({ ok: true, donation_id: donationId, status: 'pending' }, { status: 201 }, request, env);
  }

  const frontendUrl = env.FRONTEND_URL || FRONTEND_URL;
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(amountCents),
        'line_items[0][price_data][product_data][name]': 'Donation to The Mat Association',
        'line_items[0][price_data][product_data][description]': 'Support youth wrestling and combat sports programs',
        'line_items[0][quantity]': '1',
        'success_url': `${frontendUrl}/app/support?donation=success`,
        'cancel_url': `${frontendUrl}/app/support?donation=cancelled`,
        ...(user?.email ? { 'customer_email': user.email } : {}),
        'metadata[donation_id]': String(donationId),
        'metadata[cause]': sanitize(body.cause || 'tma'),
        ...(user?.id ? { 'metadata[user_id]': String(user.id) } : {}),
      }),
    });

    const session = await res.json();
    if (!res.ok) {
      // Stripe error — still return donation as pending (user can retry)
      return corsJson({ ok: true, donation_id: donationId, status: 'pending', error: session.error?.message }, { status: 201 }, request, env);
    }

    // Update donation with Stripe session ID for tracking
    await env.DB.prepare('UPDATE support_donations SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, donationId).run().catch(() => {});

    return corsJson({ ok: true, donation_id: donationId, url: session.url, session_id: session.id }, { status: 201 }, request, env);
  } catch (err) {
    // Network error to Stripe — return pending donation
    return corsJson({ ok: true, donation_id: donationId, status: 'pending' }, { status: 201 }, request, env);
  }
}

async function handleGetSupportStats(request, env) {
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_donations,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN amount_cents ELSE 0 END), 0) as total_raised_cents,
      COUNT(DISTINCT user_id) as unique_donors
    FROM support_donations
  `).first();
  return corsJson({ ok: true, stats }, {}, request, env);
}

// ─── Milo AI Monitoring Endpoints ────────────────────────────────────────────

async function handleMiloHealthCheck(request, env) {
  // API key auth for Milo — fail-closed: deny if key not configured or doesn't match
  const apiKey = request.headers.get('X-Milo-Key');
  if (!env.MILO_API_KEY || apiKey !== env.MILO_API_KEY) {
    return corsJson({ ok: false, error: 'Invalid API key' }, { status: 401 }, request, env);
  }
  const now = isoNow();
  const [users, messages, bookings, reports, feedback, posts] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM messages WHERE created_at > datetime(?, "-24 hours")').bind(now).first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM bookings WHERE created_at > datetime(?, "-24 hours")').bind(now).first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM reports WHERE status = "pending"').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM feedback WHERE status = "new"').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM posts WHERE created_at > datetime(?, "-24 hours")').bind(now).first(),
  ]);
  return corsJson({
    ok: true,
    timestamp: now,
    metrics: {
      total_users: users?.c || 0,
      messages_24h: messages?.c || 0,
      bookings_24h: bookings?.c || 0,
      pending_reports: reports?.c || 0,
      new_feedback: feedback?.c || 0,
      posts_24h: posts?.c || 0,
    },
    status: 'healthy',
  }, {}, request, env);
}

async function handleMiloMetrics(request, env) {
  const apiKey = request.headers.get('X-Milo-Key');
  if (!env.MILO_API_KEY || apiKey !== env.MILO_API_KEY) {
    return corsJson({ ok: false, error: 'Invalid API key' }, { status: 401 }, request, env);
  }
  const now = isoNow();
  const [
    totalUsers, newUsers7d, profileCompletion, topSports, activeGyms,
    subStats, recentFeedback, errorRate
  ] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE created_at > datetime(?, "-7 days")').bind(now).first(),
    env.DB.prepare('SELECT AVG(profile_complete) as avg FROM user_profiles').first(),
    env.DB.prepare(`SELECT sports, COUNT(*) as c FROM user_profiles WHERE sports IS NOT NULL GROUP BY sports ORDER BY c DESC LIMIT 5`).all(),
    env.DB.prepare('SELECT COUNT(*) as c FROM gyms').first(),
    env.DB.prepare(`SELECT plan, COUNT(*) as c FROM subscriptions GROUP BY plan`).all(),
    env.DB.prepare('SELECT id, type, rating, title, body, created_at FROM feedback WHERE status = "new" ORDER BY created_at DESC LIMIT 10').all(),
    env.DB.prepare('SELECT COUNT(*) as c FROM feedback WHERE type = "bug" AND created_at > datetime(?, "-7 days")').bind(now).first(),
  ]);
  return corsJson({
    ok: true,
    timestamp: now,
    overview: {
      total_users: totalUsers?.c || 0,
      new_users_7d: newUsers7d?.c || 0,
      avg_profile_completion: Math.round(profileCompletion?.avg || 0),
      total_gyms: activeGyms?.c || 0,
      bug_reports_7d: errorRate?.c || 0,
    },
    subscriptions: subStats?.results || [],
    top_sports: topSports?.results || [],
    recent_feedback: recentFeedback?.results || [],
  }, {}, request, env);
}

async function handleMiloRecordMetric(request, env) {
  const apiKey = request.headers.get('X-Milo-Key');
  if (!env.MILO_API_KEY || apiKey !== env.MILO_API_KEY) {
    return corsJson({ ok: false, error: 'Invalid API key' }, { status: 401 }, request, env);
  }
  const body = await readJson(request);
  if (!body?.key || !body?.value) return corsJson({ ok: false, error: 'Key and value required' }, { status: 400 }, request, env);
  await env.DB.prepare('INSERT INTO app_metrics (metric_key, metric_value, recorded_at) VALUES (?, ?, ?)').bind(
    sanitize(body.key), sanitize(String(body.value)), isoNow()
  ).run();
  return corsJson({ ok: true }, { status: 201 }, request, env);
}

// ─── Gym Owner Profile Management ────────────────────────────────────────────

async function handleGetMyGym(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const gym = await env.DB.prepare('SELECT * FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found for this account' }, { status: 404 }, request, env);
  // Parse JSON fields
  try { gym.sports = JSON.parse(gym.sports || '[]'); } catch { gym.sports = []; }
  try { gym.amenities = JSON.parse(gym.amenities || '[]'); } catch { gym.amenities = []; }
  // Get sessions, reviews, documents
  const [sessions, reviews, docs] = await Promise.all([
    env.DB.prepare('SELECT * FROM gym_sessions WHERE gym_id = ? ORDER BY day_of_week, start_time').bind(gym.id).all(),
    env.DB.prepare(`SELECT r.*, u.display_name as user_name FROM gym_reviews r JOIN users u ON r.user_id = u.id WHERE r.gym_id = ? ORDER BY r.created_at DESC LIMIT 20`).bind(gym.id).all(),
    env.DB.prepare('SELECT id, type, name, verified, uploaded_at FROM gym_documents WHERE gym_id = ?').bind(gym.id).all(),
  ]);
  return corsJson({
    ok: true,
    gym: { ...gym, sessions: sessions.results || [], reviews: reviews.results || [], documents: docs.results || [] }
  }, {}, request, env);
}

async function handleUpdateMyGym(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const gym = await env.DB.prepare('SELECT id FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found' }, { status: 404 }, request, env);
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);
  const updates = [];
  const params = [];
  const allowedFields = ['name', 'address', 'city', 'state', 'phone', 'email', 'description', 'price'];
  for (const f of allowedFields) {
    if (body[f] !== undefined) { updates.push(`${f} = ?`); params.push(sanitize(String(body[f]))); }
  }
  if (body.sports) { updates.push('sports = ?'); params.push(JSON.stringify(body.sports)); }
  if (body.amenities) { updates.push('amenities = ?'); params.push(JSON.stringify(body.amenities)); }
  if (body.lat !== undefined) { updates.push('lat = ?'); params.push(parseFloat(body.lat) || 0); }
  if (body.lng !== undefined) { updates.push('lng = ?'); params.push(parseFloat(body.lng) || 0); }
  if (body.checkin_radius_m !== undefined) {
    const radius = Math.max(50, Math.min(1000, parseInt(body.checkin_radius_m) || 200));
    updates.push('checkin_radius_m = ?'); params.push(radius);
  }
  if (updates.length === 0) return corsJson({ ok: false, error: 'No fields to update' }, { status: 400 }, request, env);
  updates.push('updated_at = ?');
  params.push(isoNow());
  params.push(gym.id);
  await env.DB.prepare(`UPDATE gyms SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Gym Membership / Affiliation System ─────────────────────────────────────

// Helper: check if user is gym owner or admin/staff
async function requireGymRole(env, userId, gymId, roles = ['owner']) {
  if (roles.includes('owner')) {
    const gym = await env.DB.prepare('SELECT id FROM gyms WHERE id = ? AND owner_id = ?').bind(gymId, userId).first();
    if (gym) return 'owner';
  }
  if (roles.some(r => r !== 'owner')) {
    const member = await env.DB.prepare('SELECT role FROM gym_members WHERE gym_id = ? AND user_id = ? AND status = ?').bind(gymId, userId, 'approved').first();
    if (member && roles.includes(member.role)) return member.role;
  }
  return null;
}

// User requests to join a gym (or gym invites a user)
async function handleRequestGymMembership(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id) return corsJson({ ok: false, error: 'gym_id required' }, { status: 400 }, request, env);

  // Check gym exists
  const gym = await env.DB.prepare('SELECT id, owner_id FROM gyms WHERE id = ?').bind(body.gym_id).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);

  // Check user doesn't already have 5 approved gym affiliations
  const memberCount = await env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_members WHERE user_id = ? AND status = ?').bind(user.id, 'approved').first();
  if (memberCount && memberCount.cnt >= 5) return corsJson({ ok: false, error: 'Maximum 5 gym affiliations allowed' }, { status: 400 }, request, env);

  // Check if already exists
  const existing = await env.DB.prepare('SELECT id, status FROM gym_members WHERE gym_id = ? AND user_id = ?').bind(body.gym_id, user.id).first();
  if (existing) {
    if (existing.status === 'approved') return corsJson({ ok: false, error: 'Already a member' }, { status: 400 }, request, env);
    if (existing.status === 'pending') return corsJson({ ok: false, error: 'Request already pending' }, { status: 400 }, request, env);
    // Re-request if previously rejected
    await env.DB.prepare('UPDATE gym_members SET status = ?, requested_by = ?, updated_at = ? WHERE id = ?').bind('pending', 'user', isoNow(), existing.id).run();
    return corsJson({ ok: true, message: 'Membership re-requested' }, { status: 200 }, request, env);
  }

  await env.DB.prepare('INSERT INTO gym_members (gym_id, user_id, role, status, requested_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
    body.gym_id, user.id, 'member', 'pending', 'user', isoNow(), isoNow()
  ).run();

  // Notify gym owner
  if (gym.owner_id) {
    await env.DB.prepare('INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(
      gym.owner_id, 'gym_member_request', 'New Membership Request',
      `${user.display_name} wants to join your gym`,
      JSON.stringify({ gym_id: body.gym_id, user_id: user.id }), isoNow()
    ).run();
  }

  return corsJson({ ok: true, message: 'Membership requested' }, { status: 201 }, request, env);
}

// Gym owner invites a user to join
async function handleInviteGymMember(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id || !body?.user_id) return corsJson({ ok: false, error: 'gym_id and user_id required' }, { status: 400 }, request, env);

  // Verify caller is gym owner or admin
  const role = await requireGymRole(env, user.id, body.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized for this gym' }, { status: 403 }, request, env);

  // Check target user exists
  const target = await env.DB.prepare('SELECT id, display_name FROM users WHERE id = ?').bind(body.user_id).first();
  if (!target) return corsJson({ ok: false, error: 'User not found' }, { status: 404 }, request, env);

  // Check existing
  const existing = await env.DB.prepare('SELECT id, status FROM gym_members WHERE gym_id = ? AND user_id = ?').bind(body.gym_id, body.user_id).first();
  if (existing) {
    if (existing.status === 'approved') return corsJson({ ok: false, error: 'User already a member' }, { status: 400 }, request, env);
    await env.DB.prepare('UPDATE gym_members SET status = ?, requested_by = ?, updated_at = ? WHERE id = ?').bind('pending', 'gym', isoNow(), existing.id).run();
  } else {
    await env.DB.prepare('INSERT INTO gym_members (gym_id, user_id, role, status, requested_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
      body.gym_id, body.user_id, body.role || 'member', 'pending', 'gym', isoNow(), isoNow()
    ).run();
  }

  // Notify the invited user
  const gym = await env.DB.prepare('SELECT name FROM gyms WHERE id = ?').bind(body.gym_id).first();
  await env.DB.prepare('INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(
    body.user_id, 'gym_invite', 'Gym Invitation',
    `${gym?.name || 'A gym'} invited you to join`,
    JSON.stringify({ gym_id: body.gym_id }), isoNow()
  ).run();

  return corsJson({ ok: true, message: 'Invitation sent' }, { status: 201 }, request, env);
}

// Approve or reject a membership (gym owner approves user requests, user approves gym invites)
async function handleRespondGymMembership(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.membership_id || !body?.action) return corsJson({ ok: false, error: 'membership_id and action (approve/reject) required' }, { status: 400 }, request, env);
  if (!['approve', 'reject'].includes(body.action)) return corsJson({ ok: false, error: 'action must be approve or reject' }, { status: 400 }, request, env);

  const membership = await env.DB.prepare('SELECT * FROM gym_members WHERE id = ?').bind(body.membership_id).first();
  if (!membership || membership.status !== 'pending') return corsJson({ ok: false, error: 'No pending membership found' }, { status: 404 }, request, env);

  // Authorization: gym side approves user requests, user side approves gym invites
  if (membership.requested_by === 'user') {
    // Gym owner/admin must approve
    const role = await requireGymRole(env, user.id, membership.gym_id, ['owner', 'admin']);
    if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);
  } else {
    // User must approve gym invite
    if (user.id !== membership.user_id) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);
  }

  const newStatus = body.action === 'approve' ? 'approved' : 'rejected';

  // If approving, check 5-gym limit for the member
  if (newStatus === 'approved') {
    const memberCount = await env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_members WHERE user_id = ? AND status = ?').bind(membership.user_id, 'approved').first();
    if (memberCount && memberCount.cnt >= 5) return corsJson({ ok: false, error: 'User already has 5 gym affiliations' }, { status: 400 }, request, env);
  }

  await env.DB.prepare('UPDATE gym_members SET status = ?, updated_at = ? WHERE id = ?').bind(newStatus, isoNow(), membership.id).run();

  // Notify the other party
  const gym = await env.DB.prepare('SELECT name, owner_id FROM gyms WHERE id = ?').bind(membership.gym_id).first();
  const notifyUserId = membership.requested_by === 'user' ? membership.user_id : gym?.owner_id;
  if (notifyUserId) {
    await env.DB.prepare('INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(
      notifyUserId, 'gym_membership_response',
      newStatus === 'approved' ? 'Membership Approved!' : 'Membership Declined',
      newStatus === 'approved' ? `You're now affiliated with ${gym?.name || 'a gym'}` : `Your membership request was declined`,
      JSON.stringify({ gym_id: membership.gym_id, status: newStatus }), isoNow()
    ).run();
  }

  return corsJson({ ok: true, status: newStatus }, {}, request, env);
}

// Get gym members (for gym owners/admins)
async function handleGetGymMembers(request, env, gymId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const role = await requireGymRole(env, user.id, gymId, ['owner', 'admin', 'staff']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'approved';

  const members = await env.DB.prepare(`
    SELECT gm.*, u.display_name, u.email, u.avatar_url, u.city
    FROM gym_members gm JOIN users u ON gm.user_id = u.id
    WHERE gm.gym_id = ? AND gm.status = ?
    ORDER BY gm.created_at DESC
  `).bind(gymId, status).all();

  return corsJson({ ok: true, members: members.results || [] }, {}, request, env);
}

// Get user's gym affiliations
async function handleGetMyGymMemberships(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const memberships = await env.DB.prepare(`
    SELECT gm.*, g.name as gym_name, g.city as gym_city, g.sports as gym_sports, g.lat, g.lng, g.rating, g.review_count
    FROM gym_members gm JOIN gyms g ON gm.gym_id = g.id
    WHERE gm.user_id = ?
    ORDER BY gm.status ASC, gm.created_at DESC
  `).bind(user.id).all();

  const results = (memberships.results || []).map(m => {
    try { m.gym_sports = JSON.parse(m.gym_sports || '[]'); } catch { m.gym_sports = []; }
    return m;
  });

  return corsJson({ ok: true, memberships: results }, {}, request, env);
}

// Remove a member (gym owner/admin) or leave a gym (member)
async function handleRemoveGymMember(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.membership_id) return corsJson({ ok: false, error: 'membership_id required' }, { status: 400 }, request, env);

  const membership = await env.DB.prepare('SELECT * FROM gym_members WHERE id = ?').bind(body.membership_id).first();
  if (!membership) return corsJson({ ok: false, error: 'Membership not found' }, { status: 404 }, request, env);

  // User can leave, or gym owner/admin can remove
  if (membership.user_id === user.id) {
    await env.DB.prepare('DELETE FROM gym_members WHERE id = ?').bind(body.membership_id).run();
    return corsJson({ ok: true, message: 'Left gym' }, {}, request, env);
  }

  const role = await requireGymRole(env, user.id, membership.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  await env.DB.prepare('DELETE FROM gym_members WHERE id = ?').bind(body.membership_id).run();
  return corsJson({ ok: true, message: 'Member removed' }, {}, request, env);
}

// Update member role (owner only — promote to admin/staff or demote)
async function handleUpdateGymMemberRole(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.membership_id || !body?.role) return corsJson({ ok: false, error: 'membership_id and role required' }, { status: 400 }, request, env);
  if (!['member', 'admin', 'staff'].includes(body.role)) return corsJson({ ok: false, error: 'Invalid role' }, { status: 400 }, request, env);

  const membership = await env.DB.prepare('SELECT * FROM gym_members WHERE id = ? AND status = ?').bind(body.membership_id, 'approved').first();
  if (!membership) return corsJson({ ok: false, error: 'Approved membership not found' }, { status: 404 }, request, env);

  // Only owner can change roles
  const role = await requireGymRole(env, user.id, membership.gym_id, ['owner']);
  if (!role) return corsJson({ ok: false, error: 'Only gym owner can change roles' }, { status: 403 }, request, env);

  await env.DB.prepare('UPDATE gym_members SET role = ?, updated_at = ? WHERE id = ?').bind(body.role, isoNow(), body.membership_id).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Check-In System ─────────────────────────────────────────────────────────

async function handleCheckin(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id) return corsJson({ ok: false, error: 'gym_id required' }, { status: 400 }, request, env);

  // Verify gym exists
  const gym = await env.DB.prepare('SELECT id, name FROM gyms WHERE id = ?').bind(body.gym_id).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);

  // Prevent duplicate check-ins within 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare('SELECT id FROM checkins WHERE user_id = ? AND gym_id = ? AND created_at > ?').bind(user.id, body.gym_id, twoHoursAgo).first();
  if (recent) return corsJson({ ok: false, error: 'Already checked in recently' }, { status: 400 }, request, env);

  const method = body.method || 'manual';
  const points = 10; // base points per check-in

  await env.DB.prepare('INSERT INTO checkins (user_id, gym_id, points, method, created_at) VALUES (?, ?, ?, ?, ?)').bind(
    user.id, body.gym_id, points, method, isoNow()
  ).run();

  // Get total points for this user
  const totalPoints = await env.DB.prepare('SELECT SUM(points) as total FROM checkins WHERE user_id = ?').bind(user.id).first();

  return corsJson({
    ok: true,
    points_earned: points,
    total_points: totalPoints?.total || points,
    gym_name: gym.name,
  }, { status: 201 }, request, env);
}

// ─── QR Code Check-in Endpoints ───────────────────────────────────────────

// Resolve a checkin code to gym info (public)
async function handleResolveCheckinCode(request, env, code) {
  const gym = await env.DB.prepare(
    'SELECT id, name, city, state, lat, lng FROM gyms WHERE checkin_code = ?'
  ).bind(code).first();
  if (!gym) return corsJson({ ok: false, error: 'Invalid check-in code' }, { status: 404 }, request, env);
  return corsJson({ ok: true, gym }, {}, request, env);
}

// Verify QR check-in with GPS (auth required)
async function handleQrCheckinVerify(request, env, code) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (body?.lat == null || body?.lng == null) {
    return corsJson({ ok: false, error: 'Location (lat, lng) required' }, { status: 400 }, request, env);
  }

  const gym = await env.DB.prepare(
    'SELECT id, name, address, city, state, lat, lng, checkin_radius_m FROM gyms WHERE checkin_code = ?'
  ).bind(code).first();
  if (!gym) return corsJson({ ok: false, error: 'Invalid check-in code' }, { status: 404 }, request, env);

  // GPS verification
  if (!gym.lat || !gym.lng) {
    return corsJson({ ok: false, error: 'This gym hasn\'t set up location-based check-in yet' }, { status: 500 }, request, env);
  }
  const distance = haversineDistance(gym.lat, gym.lng, body.lat, body.lng);
  const radius = gym.checkin_radius_m || 200;
  if (distance > radius) {
    return corsJson({
      ok: false, error: 'too_far',
      distance_m: Math.round(distance),
      gym_name: gym.name,
      address: gym.address || `${gym.city}, ${gym.state}`,
    }, { status: 403 }, request, env);
  }

  // Rate limit: 1 per user per gym per 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare(
    'SELECT id, created_at FROM checkins WHERE user_id = ? AND gym_id = ? AND created_at > ?'
  ).bind(user.id, gym.id, twoHoursAgo).first();
  if (recent) {
    return corsJson({
      ok: false, error: 'already_checked_in',
      gym_name: gym.name,
      checked_in_at: recent.created_at,
    }, { status: 429 }, request, env);
  }

  // Insert check-in
  const points = 10;
  await env.DB.prepare(
    'INSERT INTO checkins (user_id, gym_id, points, method, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, gym.id, points, 'qr', isoNow()).run();

  const totalPoints = await env.DB.prepare('SELECT SUM(points) as total FROM checkins WHERE user_id = ?').bind(user.id).first();

  return corsJson({
    ok: true,
    gym_name: gym.name,
    points_earned: points,
    total_points: totalPoints?.total || points,
  }, { status: 201 }, request, env);
}

// Guest QR check-in (public, no auth)
async function handleQrCheckinGuest(request, env, code) {
  const body = await readJson(request);
  if (!body?.name?.trim()) return corsJson({ ok: false, error: 'Name is required' }, { status: 400 }, request, env);
  if (!body?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return corsJson({ ok: false, error: 'Valid email is required' }, { status: 400 }, request, env);
  }
  if (body?.lat == null || body?.lng == null) {
    return corsJson({ ok: false, error: 'Location (lat, lng) required' }, { status: 400 }, request, env);
  }

  const gym = await env.DB.prepare(
    'SELECT id, name, address, city, state, lat, lng, checkin_radius_m FROM gyms WHERE checkin_code = ?'
  ).bind(code).first();
  if (!gym) return corsJson({ ok: false, error: 'Invalid check-in code' }, { status: 404 }, request, env);

  // GPS verification
  if (!gym.lat || !gym.lng) {
    return corsJson({ ok: false, error: 'This gym hasn\'t set up location-based check-in yet' }, { status: 500 }, request, env);
  }
  const distance = haversineDistance(gym.lat, gym.lng, body.lat, body.lng);
  const radius = gym.checkin_radius_m || 200;
  if (distance > radius) {
    return corsJson({
      ok: false, error: 'too_far',
      distance_m: Math.round(distance),
      gym_name: gym.name,
      address: gym.address || `${gym.city}, ${gym.state}`,
    }, { status: 403 }, request, env);
  }

  // Rate limit: 1 per email per gym per 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentGuest = await env.DB.prepare(
    'SELECT id FROM guest_checkins WHERE email = ? AND gym_id = ? AND created_at > ?'
  ).bind(body.email.trim().toLowerCase(), gym.id, oneDayAgo).first();
  if (recentGuest) {
    return corsJson({ ok: false, error: 'This email was already used to check in today' }, { status: 429 }, request, env);
  }

  // IP-based backstop: max 10 guest check-ins per IP per day
  const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const ipKey = `guest_ip:${clientIP}`;
  const ipWindow = await env.DB.prepare(
    'SELECT count FROM rate_limits WHERE key = ? AND window_start > ?'
  ).bind(ipKey, oneDayAgo).first();
  if (ipWindow && ipWindow.count >= 10) {
    return corsJson({ ok: false, error: 'Too many guest check-ins from this location today' }, { status: 429 }, request, env);
  }
  // Update IP rate limit
  if (ipWindow) {
    await env.DB.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ? AND window_start > ?').bind(ipKey, oneDayAgo).run();
  } else {
    await env.DB.prepare('INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)').bind(ipKey, isoNow()).run();
  }

  // Insert guest check-in
  await env.DB.prepare(
    'INSERT INTO guest_checkins (gym_id, name, email, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(gym.id, body.name.trim(), body.email.trim().toLowerCase(), body.lat, body.lng, isoNow()).run();

  return corsJson({ ok: true, gym_name: gym.name }, { status: 201 }, request, env);
}

// Regenerate gym's check-in code (gym_owner only)
async function handleRegenerateCheckinCode(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'gym_owner') return corsJson({ ok: false, error: 'Only gym owners can regenerate codes' }, { status: 403 }, request, env);

  const gym = await env.DB.prepare('SELECT id FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found for this owner' }, { status: 404 }, request, env);

  // Rate limit: 1 per hour via rate_limits table
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const regenKey = `regen:${gym.id}`;
  const recentRegen = await env.DB.prepare(
    'SELECT count FROM rate_limits WHERE key = ? AND window_start > ?'
  ).bind(regenKey, oneHourAgo).first();
  if (recentRegen) {
    return corsJson({ ok: false, error: 'Code can only be regenerated once per hour' }, { status: 429 }, request, env);
  }

  const newCode = generateCheckinCode();
  await env.DB.prepare('UPDATE gyms SET checkin_code = ? WHERE id = ?').bind(newCode, gym.id).run();
  await env.DB.prepare('INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)').bind(regenKey, isoNow()).run();

  return corsJson({ ok: true, checkin_code: newCode }, {}, request, env);
}

// Get gym's check-in code (gym_owner only, for QR display)
async function handleGetCheckinCode(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'gym_owner') return corsJson({ ok: false, error: 'Only gym owners can view check-in codes' }, { status: 403 }, request, env);

  const gym = await env.DB.prepare('SELECT id, checkin_code, checkin_radius_m FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found for this owner' }, { status: 404 }, request, env);

  // Auto-generate code if none exists
  let code = gym.checkin_code;
  if (!code) {
    code = generateCheckinCode();
    await env.DB.prepare('UPDATE gyms SET checkin_code = ? WHERE id = ?').bind(code, gym.id).run();
  }

  return corsJson({
    ok: true,
    checkin_code: code,
    checkin_radius_m: gym.checkin_radius_m || 200,
    gym_id: gym.id,
  }, {}, request, env);
}

// Get guest check-in list for gym owner
async function handleGetGuestCheckins(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  if (user.role !== 'gym_owner') return corsJson({ ok: false, error: 'Only gym owners can view guest check-ins' }, { status: 403 }, request, env);

  const gym = await env.DB.prepare('SELECT id FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found for this owner' }, { status: 404 }, request, env);

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  const guests = await env.DB.prepare(
    'SELECT id, name, email, created_at FROM guest_checkins WHERE gym_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(gym.id, limit).all();

  return corsJson({ ok: true, guests: guests.results || [] }, {}, request, env);
}

// ─── End QR Code Check-in Endpoints ──────────────────────────────────────

// Get user's check-in history
async function handleGetCheckins(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const checkins = await env.DB.prepare(`
    SELECT c.*, g.name as gym_name, g.city as gym_city, g.lat, g.lng, g.sports as gym_sports
    FROM checkins c JOIN gyms g ON c.gym_id = g.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(user.id, limit, offset).all();

  const totalPoints = await env.DB.prepare('SELECT SUM(points) as total, COUNT(*) as count FROM checkins WHERE user_id = ?').bind(user.id).first();

  // Get unique gyms visited
  const uniqueGyms = await env.DB.prepare('SELECT COUNT(DISTINCT gym_id) as count FROM checkins WHERE user_id = ?').bind(user.id).first();

  const results = (checkins.results || []).map(c => {
    try { c.gym_sports = JSON.parse(c.gym_sports || '[]'); } catch { c.gym_sports = []; }
    return c;
  });

  return corsJson({
    ok: true,
    checkins: results,
    total_points: totalPoints?.total || 0,
    total_checkins: totalPoints?.count || 0,
    unique_gyms: uniqueGyms?.count || 0,
  }, {}, request, env);
}

// ─── Training Log Endpoints ───────────────────────────────────────────────

async function handleCreateTrainingLog(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid request body' }, { status: 400 }, request, env);

  const sport = sanitize(body.sport || '', 50);
  const sessionType = sanitize(body.session_type || 'drilling', 30);
  const durationMinutes = Math.max(1, Math.min(600, parseInt(body.duration_minutes) || 60));
  const intensity = Math.max(1, Math.min(10, parseInt(body.intensity) || 5));
  const notes = sanitize(body.notes || '', 2000);
  const techniques = JSON.stringify((body.techniques || []).slice(0, 20).map(t => sanitize(String(t), 100)));
  const rounds = Math.max(0, Math.min(100, parseInt(body.rounds) || 0));
  const gymId = body.gym_id ? parseInt(body.gym_id) : null;
  const checkinId = body.checkin_id ? parseInt(body.checkin_id) : null;
  const partnerId = body.partner_id ? parseInt(body.partner_id) : null;

  if (!sport) return corsJson({ ok: false, error: 'Sport is required' }, { status: 400 }, request, env);

  const validTypes = ['sparring', 'drilling', 'rolling', 'striking', 'conditioning', 'technique', 'competition', 'private_lesson', 'open_mat', 'other'];
  if (!validTypes.includes(sessionType)) {
    return corsJson({ ok: false, error: `Invalid session_type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 }, request, env);
  }

  // Verify gym exists if provided
  if (gymId) {
    const gym = await env.DB.prepare('SELECT id FROM gyms WHERE id = ?').bind(gymId).first();
    if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);
  }

  // Verify partner exists if provided
  if (partnerId) {
    const partner = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(partnerId).first();
    if (!partner) return corsJson({ ok: false, error: 'Partner not found' }, { status: 404 }, request, env);
  }

  const result = await env.DB.prepare(
    'INSERT INTO training_logs (user_id, gym_id, checkin_id, partner_id, sport, session_type, duration_minutes, intensity, notes, techniques, rounds, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.id, gymId, checkinId, partnerId, sport, sessionType, durationMinutes, intensity, notes, techniques, rounds, isoNow()).run();

  return corsJson({ ok: true, log_id: result.meta?.last_row_id }, { status: 201 }, request, env);
}

async function handleGetTrainingLogs(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const limit = Math.min(50, parseInt(url.searchParams.get('limit')) || 20);
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const sport = url.searchParams.get('sport') || '';
  const sessionType = url.searchParams.get('session_type') || '';

  let where = 'WHERE tl.user_id = ?';
  const params = [user.id];

  if (sport) {
    where += ' AND tl.sport = ?';
    params.push(sport);
  }
  if (sessionType) {
    where += ' AND tl.session_type = ?';
    params.push(sessionType);
  }

  params.push(limit, offset);

  const logs = await env.DB.prepare(`
    SELECT tl.*,
           g.name as gym_name, g.city as gym_city,
           u.display_name as partner_name, u.avatar_url as partner_avatar
    FROM training_logs tl
    LEFT JOIN gyms g ON tl.gym_id = g.id
    LEFT JOIN users u ON tl.partner_id = u.id
    ${where}
    ORDER BY tl.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params).all();

  // Get total count
  const countParams = params.slice(0, params.length - 2); // remove limit/offset
  const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM training_logs tl ${where}`).bind(...countParams).first();

  return corsJson({
    ok: true,
    logs: (logs.results || []).map(l => ({
      ...l,
      techniques: JSON.parse(l.techniques || '[]'),
    })),
    total: countResult?.total || 0,
  }, {}, request, env);
}

async function handleGetTrainingLog(request, env, logId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const log = await env.DB.prepare(`
    SELECT tl.*,
           g.name as gym_name, g.city as gym_city,
           u.display_name as partner_name, u.avatar_url as partner_avatar
    FROM training_logs tl
    LEFT JOIN gyms g ON tl.gym_id = g.id
    LEFT JOIN users u ON tl.partner_id = u.id
    WHERE tl.id = ? AND tl.user_id = ?
  `).bind(logId, user.id).first();

  if (!log) return corsJson({ ok: false, error: 'Training log not found' }, { status: 404 }, request, env);

  return corsJson({
    ok: true,
    log: { ...log, techniques: JSON.parse(log.techniques || '[]') },
  }, {}, request, env);
}

async function handleDeleteTrainingLog(request, env, logId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const log = await env.DB.prepare('SELECT id FROM training_logs WHERE id = ? AND user_id = ?').bind(logId, user.id).first();
  if (!log) return corsJson({ ok: false, error: 'Training log not found' }, { status: 404 }, request, env);

  await env.DB.prepare('DELETE FROM training_logs WHERE id = ? AND user_id = ?').bind(logId, user.id).run();

  return corsJson({ ok: true }, {}, request, env);
}

async function handleGetTrainingStats(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30'; // days
  const days = Math.max(1, Math.min(365, parseInt(period) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Aggregate stats
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_sessions,
      SUM(duration_minutes) as total_minutes,
      ROUND(AVG(duration_minutes), 0) as avg_duration,
      ROUND(AVG(intensity), 1) as avg_intensity,
      SUM(rounds) as total_rounds,
      COUNT(DISTINCT sport) as sports_trained,
      COUNT(DISTINCT gym_id) as gyms_visited,
      COUNT(DISTINCT partner_id) as training_partners
    FROM training_logs
    WHERE user_id = ? AND created_at > ?
  `).bind(user.id, since).first();

  // Sessions by sport
  const bySport = await env.DB.prepare(`
    SELECT sport, COUNT(*) as sessions, SUM(duration_minutes) as minutes
    FROM training_logs
    WHERE user_id = ? AND created_at > ?
    GROUP BY sport
    ORDER BY sessions DESC
  `).bind(user.id, since).all();

  // Sessions by type
  const byType = await env.DB.prepare(`
    SELECT session_type, COUNT(*) as sessions, SUM(duration_minutes) as minutes
    FROM training_logs
    WHERE user_id = ? AND created_at > ?
    GROUP BY session_type
    ORDER BY sessions DESC
  `).bind(user.id, since).all();

  // Weekly breakdown (last N weeks based on period)
  const weeklyBreakdown = await env.DB.prepare(`
    SELECT
      strftime('%Y-%W', created_at) as week,
      COUNT(*) as sessions,
      SUM(duration_minutes) as minutes,
      ROUND(AVG(intensity), 1) as avg_intensity
    FROM training_logs
    WHERE user_id = ? AND created_at > ?
    GROUP BY week
    ORDER BY week DESC
    LIMIT 12
  `).bind(user.id, since).all();

  // Current streak (consecutive days with training)
  const recentDays = await env.DB.prepare(`
    SELECT DISTINCT DATE(created_at) as training_date
    FROM training_logs
    WHERE user_id = ?
    ORDER BY training_date DESC
    LIMIT 60
  `).bind(user.id).all();

  let streak = 0;
  if (recentDays.results && recentDays.results.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = recentDays.results.map(r => new Date(r.training_date + 'T00:00:00'));

    // Check if trained today or yesterday
    const diffToday = Math.floor((today - dates[0]) / (24 * 60 * 60 * 1000));
    if (diffToday <= 1) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = Math.floor((dates[i - 1] - dates[i]) / (24 * 60 * 60 * 1000));
        if (diff === 1) streak++;
        else break;
      }
    }
  }

  return corsJson({
    ok: true,
    stats: {
      ...stats,
      streak,
      period_days: days,
    },
    by_sport: bySport.results || [],
    by_type: byType.results || [],
    weekly: (weeklyBreakdown.results || []).reverse(),
  }, {}, request, env);
}

// ─── Leaderboard Endpoint ─────────────────────────────────────────────────

async function handleGetLeaderboard(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'points'; // points, checkins, sessions, hours
  const period = url.searchParams.get('period') || '30'; // days
  const limit = Math.min(50, parseInt(url.searchParams.get('limit')) || 20);
  const city = url.searchParams.get('city') || '';
  const sport = url.searchParams.get('sport') || '';
  const days = Math.max(7, Math.min(365, parseInt(period) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  let query, countQuery;

  if (type === 'points' || type === 'checkins') {
    // Leaderboard based on check-ins / points
    const metric = type === 'points' ? 'SUM(c.points)' : 'COUNT(*)';
    const orderCol = type === 'points' ? 'score' : 'score';

    let cityFilter = '';
    const params = [since];

    if (city) {
      cityFilter = ' AND u.city = ?';
      params.push(city);
    }

    query = `
      SELECT u.id, u.display_name as name, u.avatar_url, u.city,
             ${metric} as score,
             COUNT(DISTINCT c.gym_id) as unique_gyms
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      WHERE c.created_at > ?${cityFilter}
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT ?
    `;
    params.push(limit);

    const results = await env.DB.prepare(query).bind(...params).all();

    // Get current user's rank
    const userParams = [since];
    if (city) userParams.push(city);
    userParams.push(user.id);

    const userRank = await env.DB.prepare(`
      SELECT rank FROM (
        SELECT u.id, ROW_NUMBER() OVER (ORDER BY ${metric} DESC) as rank
        FROM checkins c
        JOIN users u ON c.user_id = u.id
        WHERE c.created_at > ?${cityFilter}
        GROUP BY u.id
      ) WHERE id = ?
    `).bind(...userParams).first();

    const userScore = await env.DB.prepare(`
      SELECT ${metric} as score FROM checkins c WHERE c.user_id = ? AND c.created_at > ?
    `).bind(user.id, since).first();

    return corsJson({
      ok: true,
      type,
      period_days: days,
      leaderboard: (results.results || []).map((r, i) => ({ ...r, rank: i + 1 })),
      my_rank: userRank?.rank || null,
      my_score: userScore?.score || 0,
    }, {}, request, env);

  } else {
    // Leaderboard based on training logs (sessions or hours)
    const metric = type === 'hours' ? 'SUM(tl.duration_minutes)' : 'COUNT(*)';

    let extraFilter = '';
    const params = [since];

    if (city) {
      extraFilter += ' AND u.city = ?';
      params.push(city);
    }
    if (sport) {
      extraFilter += ' AND tl.sport = ?';
      params.push(sport);
    }

    query = `
      SELECT u.id, u.display_name as name, u.avatar_url, u.city,
             ${metric} as score
      FROM training_logs tl
      JOIN users u ON tl.user_id = u.id
      WHERE tl.created_at > ?${extraFilter}
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT ?
    `;
    params.push(limit);

    const results = await env.DB.prepare(query).bind(...params).all();

    // Get current user's rank
    const userParams = [since];
    if (city) userParams.push(city);
    if (sport) userParams.push(sport);
    userParams.push(user.id);

    const userRank = await env.DB.prepare(`
      SELECT rank FROM (
        SELECT u.id, ROW_NUMBER() OVER (ORDER BY ${metric} DESC) as rank
        FROM training_logs tl
        JOIN users u ON tl.user_id = u.id
        WHERE tl.created_at > ?${extraFilter}
        GROUP BY u.id
      ) WHERE id = ?
    `).bind(...userParams).first();

    const userScore = await env.DB.prepare(`
      SELECT ${metric} as score FROM training_logs tl WHERE tl.user_id = ? AND tl.created_at > ?${sport ? ' AND tl.sport = ?' : ''}
    `).bind(...(sport ? [user.id, since, sport] : [user.id, since])).first();

    return corsJson({
      ok: true,
      type,
      period_days: days,
      leaderboard: (results.results || []).map((r, i) => ({
        ...r,
        score: type === 'hours' ? Math.round((r.score || 0) / 60 * 10) / 10 : r.score,
        rank: i + 1,
      })),
      my_rank: userRank?.rank || null,
      my_score: type === 'hours' ? Math.round((userScore?.score || 0) / 60 * 10) / 10 : (userScore?.score || 0),
    }, {}, request, env);
  }
}

// ─── Events Endpoints ─────────────────────────────────────────────────────

async function handleCreateEvent(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid request body' }, { status: 400 }, request, env);

  const title = sanitize(body.title || '', 200);
  const description = sanitize(body.description || '', 2000);
  const sport = sanitize(body.sport || '', 50);
  const eventDate = body.event_date || '';
  const endDate = body.end_date || null;
  const location = sanitize(body.location || '', 200);
  const maxAttendees = Math.max(0, Math.min(1000, parseInt(body.max_attendees) || 0));
  const gymId = body.gym_id ? parseInt(body.gym_id) : null;
  const isPublic = body.is_public !== false ? 1 : 0;

  if (!title) return corsJson({ ok: false, error: 'Title is required' }, { status: 400 }, request, env);
  if (!eventDate) return corsJson({ ok: false, error: 'Event date is required' }, { status: 400 }, request, env);

  // Validate date
  const parsedDate = new Date(eventDate);
  if (isNaN(parsedDate.getTime())) return corsJson({ ok: false, error: 'Invalid event date' }, { status: 400 }, request, env);

  // Verify gym if provided
  if (gymId) {
    const gym = await env.DB.prepare('SELECT id, name FROM gyms WHERE id = ?').bind(gymId).first();
    if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);
  }

  const now = isoNow();
  const result = await env.DB.prepare(
    'INSERT INTO events (creator_id, gym_id, title, description, sport, event_date, end_date, location, max_attendees, is_public, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.id, gymId, title, description, sport, eventDate, endDate, location, maxAttendees, isPublic, 'upcoming', now, now).run();

  // Auto-RSVP creator as 'going'
  const eventId = result.meta?.last_row_id;
  if (eventId) {
    await env.DB.prepare('INSERT INTO event_rsvps (event_id, user_id, status, created_at) VALUES (?, ?, ?, ?)').bind(eventId, user.id, 'going', now).run();
  }

  return corsJson({ ok: true, event_id: eventId }, { status: 201 }, request, env);
}

async function handleGetEvents(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const limit = Math.min(50, parseInt(url.searchParams.get('limit')) || 20);
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const sport = url.searchParams.get('sport') || '';
  const status = url.searchParams.get('status') || 'upcoming';
  const mine = url.searchParams.get('mine') === 'true';
  const gymId = url.searchParams.get('gym_id') || '';

  let where = 'WHERE e.is_public = 1';
  const params = [];

  if (mine) {
    where = 'WHERE e.creator_id = ?';
    params.push(user.id);
  }
  if (status === 'upcoming') {
    where += ' AND e.event_date >= datetime("now")';
  } else if (status === 'past') {
    where += ' AND e.event_date < datetime("now")';
  }
  if (sport) {
    where += ' AND e.sport = ?';
    params.push(sport);
  }
  if (gymId) {
    where += ' AND e.gym_id = ?';
    params.push(parseInt(gymId));
  }

  params.push(limit, offset);

  const events = await env.DB.prepare(`
    SELECT e.*,
           u.display_name as creator_name, u.avatar_url as creator_avatar,
           g.name as gym_name, g.city as gym_city,
           (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id AND r.status = 'going') as attendee_count,
           (SELECT r.status FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = ${user.id}) as my_rsvp
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    LEFT JOIN gyms g ON e.gym_id = g.id
    ${where}
    ORDER BY e.event_date ASC
    LIMIT ? OFFSET ?
  `).bind(...params).all();

  const countParams = params.slice(0, params.length - 2);
  const total = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM events e ${where}`).bind(...countParams).first();

  return corsJson({
    ok: true,
    events: events.results || [],
    total: total?.cnt || 0,
  }, {}, request, env);
}

async function handleGetEvent(request, env, eventId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const event = await env.DB.prepare(`
    SELECT e.*,
           u.display_name as creator_name, u.avatar_url as creator_avatar,
           g.name as gym_name, g.city as gym_city, g.address as gym_address,
           (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id AND r.status = 'going') as attendee_count,
           (SELECT r.status FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = ?) as my_rsvp
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    LEFT JOIN gyms g ON e.gym_id = g.id
    WHERE e.id = ?
  `).bind(user.id, eventId).first();

  if (!event) return corsJson({ ok: false, error: 'Event not found' }, { status: 404 }, request, env);

  // Get attendees
  const attendees = await env.DB.prepare(`
    SELECT r.status, r.created_at, u.id as user_id, u.display_name as name, u.avatar_url
    FROM event_rsvps r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ? AND r.status = 'going'
    ORDER BY r.created_at ASC
    LIMIT 50
  `).bind(eventId).all();

  return corsJson({
    ok: true,
    event,
    attendees: attendees.results || [],
  }, {}, request, env);
}

async function handleRsvpEvent(request, env, eventId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  const rsvpStatus = body?.status || 'going'; // 'going', 'interested', 'not_going'

  if (!['going', 'interested', 'not_going'].includes(rsvpStatus)) {
    return corsJson({ ok: false, error: 'Invalid RSVP status' }, { status: 400 }, request, env);
  }

  const event = await env.DB.prepare('SELECT id, max_attendees FROM events WHERE id = ?').bind(eventId).first();
  if (!event) return corsJson({ ok: false, error: 'Event not found' }, { status: 404 }, request, env);

  // Check capacity for 'going'
  if (rsvpStatus === 'going' && event.max_attendees > 0) {
    const count = await env.DB.prepare("SELECT COUNT(*) as cnt FROM event_rsvps WHERE event_id = ? AND status = 'going'").bind(eventId).first();
    const existing = await env.DB.prepare('SELECT id FROM event_rsvps WHERE event_id = ? AND user_id = ?').bind(eventId, user.id).first();
    if ((count?.cnt || 0) >= event.max_attendees && !existing) {
      return corsJson({ ok: false, error: 'Event is at capacity' }, { status: 400 }, request, env);
    }
  }

  if (rsvpStatus === 'not_going') {
    // Remove RSVP
    await env.DB.prepare('DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?').bind(eventId, user.id).run();
  } else {
    // Upsert RSVP
    await env.DB.prepare(
      'INSERT INTO event_rsvps (event_id, user_id, status, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(event_id, user_id) DO UPDATE SET status = ?'
    ).bind(eventId, user.id, rsvpStatus, isoNow(), rsvpStatus).run();
  }

  const attendeeCount = await env.DB.prepare("SELECT COUNT(*) as cnt FROM event_rsvps WHERE event_id = ? AND status = 'going'").bind(eventId).first();

  return corsJson({ ok: true, status: rsvpStatus, attendee_count: attendeeCount?.cnt || 0 }, {}, request, env);
}

async function handleDeleteEvent(request, env, eventId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const event = await env.DB.prepare('SELECT id, creator_id FROM events WHERE id = ?').bind(eventId).first();
  if (!event) return corsJson({ ok: false, error: 'Event not found' }, { status: 404 }, request, env);
  if (event.creator_id !== user.id && user.role !== 'admin') {
    return corsJson({ ok: false, error: 'Not authorized to delete this event' }, { status: 403 }, request, env);
  }

  await env.DB.prepare('DELETE FROM event_rsvps WHERE event_id = ?').bind(eventId).run();
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Public Training Activity ─────────────────────────────────────────────

async function handleGetUserTrainingActivity(request, env, userId) {
  // Public endpoint - shows basic training stats for any user
  // No detailed logs, just aggregate numbers
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_sessions,
      SUM(duration_minutes) as total_minutes,
      COUNT(DISTINCT sport) as sports_trained,
      COUNT(DISTINCT gym_id) as gyms_visited
    FROM training_logs
    WHERE user_id = ?
  `).bind(userId).first();

  const checkinStats = await env.DB.prepare(`
    SELECT COUNT(*) as total_checkins, SUM(points) as total_points
    FROM checkins WHERE user_id = ?
  `).bind(userId).first();

  const recentSports = await env.DB.prepare(`
    SELECT sport, COUNT(*) as sessions
    FROM training_logs
    WHERE user_id = ?
    GROUP BY sport
    ORDER BY sessions DESC
    LIMIT 5
  `).bind(userId).all();

  return corsJson({
    ok: true,
    activity: {
      total_sessions: stats?.total_sessions || 0,
      total_hours: Math.round((stats?.total_minutes || 0) / 60),
      sports_trained: stats?.sports_trained || 0,
      gyms_visited: stats?.gyms_visited || 0,
      total_checkins: checkinStats?.total_checkins || 0,
      total_points: checkinStats?.total_points || 0,
      top_sports: (recentSports.results || []),
    },
  }, {}, request, env);
}

// ─── Gym Favorites ────────────────────────────────────────────────────────

async function handleToggleFavoriteGym(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id) return corsJson({ ok: false, error: 'gym_id required' }, { status: 400 }, request, env);

  const gymId = parseInt(body.gym_id);
  const gym = await env.DB.prepare('SELECT id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);

  const existing = await env.DB.prepare('SELECT id FROM favorite_gyms WHERE user_id = ? AND gym_id = ?').bind(user.id, gymId).first();

  if (existing) {
    await env.DB.prepare('DELETE FROM favorite_gyms WHERE id = ?').bind(existing.id).run();
    return corsJson({ ok: true, favorited: false }, {}, request, env);
  } else {
    await env.DB.prepare('INSERT INTO favorite_gyms (user_id, gym_id, created_at) VALUES (?, ?, ?)').bind(user.id, gymId, isoNow()).run();
    return corsJson({ ok: true, favorited: true }, {}, request, env);
  }
}

async function handleGetFavoriteGyms(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const favorites = await env.DB.prepare(`
    SELECT g.id, g.name, g.city, g.state, g.sports, g.rating, g.review_count, g.verified, g.premium,
           fg.created_at as favorited_at
    FROM favorite_gyms fg
    JOIN gyms g ON fg.gym_id = g.id
    WHERE fg.user_id = ?
    ORDER BY fg.created_at DESC
  `).bind(user.id).all();

  return corsJson({
    ok: true,
    favorites: (favorites.results || []).map(f => ({
      ...f,
      sports: JSON.parse(f.sports || '[]'),
    })),
  }, {}, request, env);
}

async function handleCheckFavoriteGym(request, env, gymId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const fav = await env.DB.prepare('SELECT id FROM favorite_gyms WHERE user_id = ? AND gym_id = ?').bind(user.id, gymId).first();
  return corsJson({ ok: true, favorited: !!fav }, {}, request, env);
}

// Get user's training passport — summary of all gyms visited with stats
async function handleGetTrainingPassport(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Optionally view another user's passport
  const url = new URL(request.url);
  const targetUserId = parseInt(url.searchParams.get('user_id') || '') || user.id;

  const gymsVisited = await env.DB.prepare(`
    SELECT g.id, g.name, g.city, g.state, g.lat, g.lng, g.sports,
           COUNT(c.id) as visit_count, SUM(c.points) as total_points,
           MIN(c.created_at) as first_visit, MAX(c.created_at) as last_visit
    FROM checkins c JOIN gyms g ON c.gym_id = g.id
    WHERE c.user_id = ?
    GROUP BY g.id
    ORDER BY visit_count DESC
  `).bind(targetUserId).all();

  const totalStats = await env.DB.prepare('SELECT SUM(points) as total_points, COUNT(*) as total_checkins FROM checkins WHERE user_id = ?').bind(targetUserId).first();

  const results = (gymsVisited.results || []).map(g => {
    try { g.sports = JSON.parse(g.sports || '[]'); } catch { g.sports = []; }
    return g;
  });

  // Calculate badges
  const badges = [];
  const totalCheckins = totalStats?.total_checkins || 0;
  const uniqueCount = results.length;
  if (totalCheckins >= 1) badges.push({ id: 'first_step', name: 'First Step', description: 'First check-in!' });
  if (totalCheckins >= 10) badges.push({ id: 'regular', name: 'Regular', description: '10 check-ins' });
  if (totalCheckins >= 50) badges.push({ id: 'dedicated', name: 'Dedicated', description: '50 check-ins' });
  if (totalCheckins >= 100) badges.push({ id: 'iron_will', name: 'Iron Will', description: '100 check-ins' });
  if (totalCheckins >= 500) badges.push({ id: 'legend', name: 'Legend', description: '500 check-ins' });
  if (uniqueCount >= 3) badges.push({ id: 'explorer', name: 'Explorer', description: 'Visited 3 different gyms' });
  if (uniqueCount >= 10) badges.push({ id: 'nomad', name: 'Nomad', description: 'Visited 10 different gyms' });
  if (uniqueCount >= 25) badges.push({ id: 'globetrotter', name: 'Globetrotter', description: 'Visited 25 different gyms' });

  return corsJson({
    ok: true,
    gyms: results,
    total_points: totalStats?.total_points || 0,
    total_checkins: totalCheckins,
    unique_gyms: uniqueCount,
    badges,
  }, {}, request, env);
}

// ─── Gym Promotions ──────────────────────────────────────────────────────────

async function handleCreatePromotion(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id || !body?.title) return corsJson({ ok: false, error: 'gym_id and title required' }, { status: 400 }, request, env);

  const role = await requireGymRole(env, user.id, body.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  const validTypes = ['open_mat', 'trial', 'discount', 'event', 'general'];
  const type = validTypes.includes(body.type) ? body.type : 'general';

  const result = await env.DB.prepare(`
    INSERT INTO gym_promotions (gym_id, title, description, type, start_date, end_date, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    body.gym_id, sanitize(body.title), sanitize(body.description || ''),
    type, body.start_date || null, body.end_date || null, isoNow(), isoNow()
  ).run();

  return corsJson({ ok: true, promotion_id: result.meta?.last_row_id }, { status: 201 }, request, env);
}

async function handleGetGymPromotions(request, env, gymId) {
  const promotions = await env.DB.prepare(`
    SELECT p.*, g.name as gym_name, g.city as gym_city
    FROM gym_promotions p JOIN gyms g ON p.gym_id = g.id
    WHERE p.gym_id = ? AND p.is_active = 1
    ORDER BY p.created_at DESC
  `).bind(gymId).all();

  return corsJson({ ok: true, promotions: promotions.results || [] }, {}, request, env);
}

async function handleUpdatePromotion(request, env, promoId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const promo = await env.DB.prepare('SELECT * FROM gym_promotions WHERE id = ?').bind(promoId).first();
  if (!promo) return corsJson({ ok: false, error: 'Promotion not found' }, { status: 404 }, request, env);

  const role = await requireGymRole(env, user.id, promo.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  const body = await readJson(request);
  const updates = [];
  const params = [];
  for (const f of ['title', 'description', 'type', 'start_date', 'end_date']) {
    if (body[f] !== undefined) { updates.push(`${f} = ?`); params.push(sanitize(String(body[f]))); }
  }
  if (body.is_active !== undefined) { updates.push('is_active = ?'); params.push(body.is_active ? 1 : 0); }
  if (updates.length === 0) return corsJson({ ok: false, error: 'No fields to update' }, { status: 400 }, request, env);
  updates.push('updated_at = ?');
  params.push(isoNow());
  params.push(promoId);

  await env.DB.prepare(`UPDATE gym_promotions SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  return corsJson({ ok: true }, {}, request, env);
}

async function handleDeletePromotion(request, env, promoId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const promo = await env.DB.prepare('SELECT gym_id FROM gym_promotions WHERE id = ?').bind(promoId).first();
  if (!promo) return corsJson({ ok: false, error: 'Promotion not found' }, { status: 404 }, request, env);

  const role = await requireGymRole(env, user.id, promo.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  await env.DB.prepare('DELETE FROM gym_promotions WHERE id = ?').bind(promoId).run();
  return corsJson({ ok: true }, {}, request, env);
}

// Browse all active promotions (with filters)
async function handleBrowsePromotions(request, env) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city');
  const type = url.searchParams.get('type');
  const sport = url.searchParams.get('sport');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  let sql = `
    SELECT p.*, g.name as gym_name, g.city as gym_city, g.state as gym_state, g.lat, g.lng, g.sports as gym_sports
    FROM gym_promotions p JOIN gyms g ON p.gym_id = g.id
    WHERE p.is_active = 1
  `;
  const params = [];
  if (city) { sql += ' AND LOWER(g.city) = LOWER(?)'; params.push(city); }
  if (type) { sql += ' AND p.type = ?'; params.push(type); }
  // end_date filter: only show promotions that haven't expired
  sql += ` AND (p.end_date IS NULL OR p.end_date >= ?)`;
  params.push(isoNow().split('T')[0]);
  sql += ' ORDER BY p.created_at DESC LIMIT ?';
  params.push(limit);

  const promotions = await env.DB.prepare(sql).bind(...params).all();
  const results = (promotions.results || []).map(p => {
    try { p.gym_sports = JSON.parse(p.gym_sports || '[]'); } catch { p.gym_sports = []; }
    // Filter by sport if requested (sports is a JSON array on gym)
    if (sport && !p.gym_sports.some(s => s.toLowerCase().includes(sport.toLowerCase()))) return null;
    return p;
  }).filter(Boolean);

  return corsJson({ ok: true, promotions: results }, {}, request, env);
}

// ─── Gym Announcements (Inter-Group Messaging) ──────────────────────────────

async function handleCreateAnnouncement(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id || !body?.title || !body?.body) return corsJson({ ok: false, error: 'gym_id, title, and body required' }, { status: 400 }, request, env);

  const role = await requireGymRole(env, user.id, body.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  const result = await env.DB.prepare(`
    INSERT INTO gym_announcements (gym_id, author_id, title, body, pinned, created_at) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(body.gym_id, user.id, sanitize(body.title), sanitize(body.body), body.pinned ? 1 : 0, isoNow()).run();

  // Notify all approved gym members
  const members = await env.DB.prepare('SELECT user_id FROM gym_members WHERE gym_id = ? AND status = ? AND user_id != ?').bind(body.gym_id, 'approved', user.id).all();
  const gym = await env.DB.prepare('SELECT name FROM gyms WHERE id = ?').bind(body.gym_id).first();
  for (const m of (members.results || [])) {
    await env.DB.prepare('INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(
      m.user_id, 'gym_announcement', `${gym?.name || 'Gym'}: ${sanitize(body.title)}`,
      sanitize(body.body).substring(0, 200),
      JSON.stringify({ gym_id: body.gym_id, announcement_id: result.meta?.last_row_id }), isoNow()
    ).run();
  }

  return corsJson({ ok: true, announcement_id: result.meta?.last_row_id }, { status: 201 }, request, env);
}

async function handleGetGymAnnouncements(request, env, gymId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Must be a member or owner to see announcements
  const gym = await env.DB.prepare('SELECT owner_id FROM gyms WHERE id = ?').bind(gymId).first();
  if (!gym) return corsJson({ ok: false, error: 'Gym not found' }, { status: 404 }, request, env);

  const isMember = gym.owner_id === user.id ||
    await env.DB.prepare('SELECT id FROM gym_members WHERE gym_id = ? AND user_id = ? AND status = ?').bind(gymId, user.id, 'approved').first();
  if (!isMember) return corsJson({ ok: false, error: 'Not a member of this gym' }, { status: 403 }, request, env);

  const announcements = await env.DB.prepare(`
    SELECT a.*, u.display_name as author_name, u.avatar_url as author_avatar
    FROM gym_announcements a JOIN users u ON a.author_id = u.id
    WHERE a.gym_id = ?
    ORDER BY a.pinned DESC, a.created_at DESC
    LIMIT 50
  `).bind(gymId).all();

  return corsJson({ ok: true, announcements: announcements.results || [] }, {}, request, env);
}

async function handleDeleteAnnouncement(request, env, announcementId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const announcement = await env.DB.prepare('SELECT * FROM gym_announcements WHERE id = ?').bind(announcementId).first();
  if (!announcement) return corsJson({ ok: false, error: 'Announcement not found' }, { status: 404 }, request, env);

  const role = await requireGymRole(env, user.id, announcement.gym_id, ['owner', 'admin']);
  if (!role && announcement.author_id !== user.id) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  await env.DB.prepare('DELETE FROM gym_announcements WHERE id = ?').bind(announcementId).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Gym Discovery (Nearby / Search with Filters) ───────────────────────────

async function handleDiscoverGyms(request, env) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  const radius = Math.min(parseFloat(url.searchParams.get('radius') || '50'), 200); // km, max 200
  const sport = url.searchParams.get('sport');
  const hasPromotions = url.searchParams.get('promotions') === 'true';
  const hasOpenMats = url.searchParams.get('open_mats') === 'true';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  // If lat/lng provided, use Haversine approximation for distance sorting
  // D1/SQLite doesn't have native geo functions, so we use a bounding box + Haversine in SQL
  let sql, params = [];
  if (lat && lng) {
    // Bounding box approximation (1 degree lat ≈ 111km)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));
    sql = `
      SELECT g.*,
        (6371 * 2 * ASIN(SQRT(
          POWER(SIN((RADIANS(?) - RADIANS(g.lat)) / 2), 2) +
          COS(RADIANS(?)) * COS(RADIANS(g.lat)) *
          POWER(SIN((RADIANS(?) - RADIANS(g.lng)) / 2), 2)
        ))) as distance_km
      FROM gyms g
      WHERE g.lat BETWEEN ? AND ? AND g.lng BETWEEN ? AND ?
    `;
    params = [lat, lat, lng, lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta];
  } else {
    // No geo, just list all gyms
    sql = 'SELECT g.*, NULL as distance_km FROM gyms g WHERE 1=1';
  }

  sql += ' ORDER BY ' + (lat && lng ? 'distance_km ASC' : 'g.rating DESC') + ' LIMIT ?';
  params.push(limit);

  let gyms;
  try {
    gyms = await env.DB.prepare(sql).bind(...params).all();
  } catch {
    // SQLite may not have RADIANS/ASIN — fallback to simple query
    const fallbackSql = `SELECT g.*, NULL as distance_km FROM gyms g ORDER BY g.rating DESC LIMIT ?`;
    gyms = await env.DB.prepare(fallbackSql).bind(limit).all();
  }

  let results = (gyms.results || []).map(g => {
    try { g.sports = JSON.parse(g.sports || '[]'); } catch { g.sports = []; }
    try { g.amenities = JSON.parse(g.amenities || '[]'); } catch { g.amenities = []; }
    return g;
  });

  // Filter by sport
  if (sport) {
    results = results.filter(g => g.sports.some(s => s.toLowerCase().includes(sport.toLowerCase())));
  }

  // If we need promotions or open mats, enrich
  if (hasPromotions || hasOpenMats) {
    const gymIds = results.map(g => g.id);
    if (gymIds.length > 0) {
      const placeholders = gymIds.map(() => '?').join(',');
      const promos = await env.DB.prepare(`
        SELECT gym_id, COUNT(*) as promo_count FROM gym_promotions
        WHERE gym_id IN (${placeholders}) AND is_active = 1 AND (end_date IS NULL OR end_date >= ?)
        GROUP BY gym_id
      `).bind(...gymIds, isoNow().split('T')[0]).all();

      const promoMap = {};
      for (const p of (promos.results || [])) promoMap[p.gym_id] = p.promo_count;

      results = results.map(g => ({ ...g, active_promotions: promoMap[g.id] || 0 }));
      if (hasPromotions) results = results.filter(g => g.active_promotions > 0);

      if (hasOpenMats) {
        const openMatPromos = await env.DB.prepare(`
          SELECT gym_id FROM gym_promotions
          WHERE gym_id IN (${placeholders}) AND is_active = 1 AND type = 'open_mat'
          AND (end_date IS NULL OR end_date >= ?)
        `).bind(...gymIds, isoNow().split('T')[0]).all();
        const openMatSet = new Set((openMatPromos.results || []).map(p => p.gym_id));
        results = results.filter(g => openMatSet.has(g.id));
      }
    }
  }

  return corsJson({ ok: true, gyms: results, total: results.length }, {}, request, env);
}

// ─── Gym Sessions Management (for gym owners) ───────────────────────────────

async function handleCreateGymSession(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const body = await readJson(request);
  if (!body?.gym_id || !body?.day_of_week || !body?.start_time || !body?.end_time) {
    return corsJson({ ok: false, error: 'gym_id, day_of_week, start_time, end_time required' }, { status: 400 }, request, env);
  }

  const role = await requireGymRole(env, user.id, body.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  const result = await env.DB.prepare(`
    INSERT INTO gym_sessions (gym_id, day_of_week, start_time, end_time, max_slots, current_slots, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).bind(body.gym_id, body.day_of_week, body.start_time, body.end_time, body.max_slots || 20, isoNow()).run();

  return corsJson({ ok: true, session_id: result.meta?.last_row_id }, { status: 201 }, request, env);
}

async function handleDeleteGymSession(request, env, sessionId) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const session = await env.DB.prepare('SELECT gym_id FROM gym_sessions WHERE id = ?').bind(sessionId).first();
  if (!session) return corsJson({ ok: false, error: 'Session not found' }, { status: 404 }, request, env);

  const role = await requireGymRole(env, user.id, session.gym_id, ['owner', 'admin']);
  if (!role) return corsJson({ ok: false, error: 'Not authorized' }, { status: 403 }, request, env);

  await env.DB.prepare('DELETE FROM gym_sessions WHERE id = ?').bind(sessionId).run();
  return corsJson({ ok: true }, {}, request, env);
}

// ─── Gym Owner Dashboard Stats ───────────────────────────────────────────────

async function handleGymDashboardStats(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const gym = await env.DB.prepare('SELECT * FROM gyms WHERE owner_id = ?').bind(user.id).first();
  if (!gym) return corsJson({ ok: false, error: 'No gym found' }, { status: 404 }, request, env);

  const [members, pendingRequests, checkins7d, totalCheckins, reviews, activePromos, announcements] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_members WHERE gym_id = ? AND status = ?').bind(gym.id, 'approved').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_members WHERE gym_id = ? AND status = ?').bind(gym.id, 'pending').first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM checkins WHERE gym_id = ? AND created_at > ?').bind(gym.id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM checkins WHERE gym_id = ?').bind(gym.id).first(),
    env.DB.prepare('SELECT COUNT(*) as cnt, AVG(rating) as avg FROM gym_reviews WHERE gym_id = ?').bind(gym.id).first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_promotions WHERE gym_id = ? AND is_active = 1').bind(gym.id).first(),
    env.DB.prepare('SELECT COUNT(*) as cnt FROM gym_announcements WHERE gym_id = ?').bind(gym.id).first(),
  ]);

  try { gym.sports = JSON.parse(gym.sports || '[]'); } catch { gym.sports = []; }
  try { gym.amenities = JSON.parse(gym.amenities || '[]'); } catch { gym.amenities = []; }

  return corsJson({
    ok: true,
    gym,
    stats: {
      total_members: members?.cnt || 0,
      pending_requests: pendingRequests?.cnt || 0,
      checkins_7d: checkins7d?.cnt || 0,
      total_checkins: totalCheckins?.cnt || 0,
      total_reviews: reviews?.cnt || 0,
      avg_rating: reviews?.avg ? Math.round(reviews.avg * 10) / 10 : 0,
      active_promotions: activePromos?.cnt || 0,
      total_announcements: announcements?.cnt || 0,
    }
  }, {}, request, env);
}

// ─── Subscription Management ─────────────────────────────────────────────────

async function handleCancelSubscription(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);
  const sub = await env.DB.prepare('SELECT * FROM subscriptions WHERE user_id = ?').bind(user.id).first();
  if (!sub || sub.plan === 'free') return corsJson({ ok: false, error: 'No active subscription' }, { status: 400 }, request, env);
  // Cancel subscription via Stripe API if we have a Stripe subscription ID
  if (sub.stripe_subscription_id && env.STRIPE_SECRET_KEY) {
    try {
      const res = await fetch(`https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // If subscription already cancelled in Stripe, continue with DB update
        if (err.error?.code !== 'resource_missing') {
          return corsJson({ ok: false, error: err.error?.message || 'Failed to cancel with Stripe' }, { status: 400 }, request, env);
        }
      }
    } catch (err) {
      return corsJson({ ok: false, error: 'Failed to reach Stripe' }, { status: 503 }, request, env);
    }
  }

  // Mark as cancelled in DB
  await env.DB.prepare(`UPDATE subscriptions SET status = 'cancelled', plan = 'free', updated_at = ? WHERE user_id = ?`).bind(isoNow(), user.id).run();
  return corsJson({ ok: true, message: 'Subscription cancelled' }, {}, request, env);
}

// ─── Admin Analytics & Error Dashboard ────────────────────────────────────────

async function handleAdminAnalytics(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const url = new URL(request.url);
  const hours = Math.min(parseInt(url.searchParams.get('hours') || '24'), 720); // max 30 days
  const since = new Date(Date.now() - hours * 3600000).toISOString();

  const [
    totalRequests, errorRequests, avgDuration,
    topEndpoints, statusBreakdown, errorsByPath,
    requestsByHour, topCountries
  ] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as c FROM api_requests WHERE created_at > ?').bind(since).first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM api_requests WHERE status >= 400 AND created_at > ?').bind(since).first(),
    env.DB.prepare('SELECT AVG(duration_ms) as avg, MAX(duration_ms) as max, MIN(duration_ms) as min FROM api_requests WHERE created_at > ?').bind(since).first(),
    env.DB.prepare(`SELECT path, method, COUNT(*) as hits, AVG(duration_ms) as avg_ms,
      SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errors
      FROM api_requests WHERE created_at > ?
      GROUP BY path, method ORDER BY hits DESC LIMIT 20`).bind(since).all(),
    env.DB.prepare(`SELECT status, COUNT(*) as c FROM api_requests WHERE created_at > ?
      GROUP BY status ORDER BY c DESC`).bind(since).all(),
    env.DB.prepare(`SELECT path, COUNT(*) as c FROM api_errors WHERE created_at > ?
      GROUP BY path ORDER BY c DESC LIMIT 10`).bind(since).all(),
    env.DB.prepare(`SELECT strftime('%Y-%m-%dT%H:00:00', created_at) as hour, COUNT(*) as c
      FROM api_requests WHERE created_at > ?
      GROUP BY hour ORDER BY hour DESC LIMIT 48`).bind(since).all(),
    env.DB.prepare(`SELECT country, COUNT(*) as c FROM api_requests
      WHERE created_at > ? AND country != ''
      GROUP BY country ORDER BY c DESC LIMIT 10`).bind(since).all(),
  ]);

  const total = totalRequests?.c || 0;
  const errors = errorRequests?.c || 0;

  return corsJson({
    ok: true,
    period_hours: hours,
    since,
    summary: {
      total_requests: total,
      error_requests: errors,
      error_rate_pct: total > 0 ? Math.round((errors / total) * 10000) / 100 : 0,
      avg_duration_ms: Math.round(avgDuration?.avg || 0),
      max_duration_ms: avgDuration?.max || 0,
      min_duration_ms: avgDuration?.min || 0,
    },
    top_endpoints: topEndpoints?.results || [],
    status_breakdown: statusBreakdown?.results || [],
    errors_by_path: errorsByPath?.results || [],
    requests_by_hour: requestsByHour?.results || [],
    top_countries: topCountries?.results || [],
  }, {}, request, env);
}

async function handleAdminErrors(request, env) {
  const { user, error } = await requireAdmin(request, env);
  if (error) return error;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const hours = Math.min(parseInt(url.searchParams.get('hours') || '24'), 720);
  const since = new Date(Date.now() - hours * 3600000).toISOString();

  const errors = await env.DB.prepare(
    `SELECT id, path, method, error_message, error_stack, user_agent, created_at
     FROM api_errors WHERE created_at > ?
     ORDER BY created_at DESC LIMIT ?`
  ).bind(since, limit).all();

  const errorSummary = await env.DB.prepare(
    `SELECT error_message, COUNT(*) as occurrences, MAX(created_at) as last_seen
     FROM api_errors WHERE created_at > ?
     GROUP BY error_message ORDER BY occurrences DESC LIMIT 20`
  ).bind(since).all();

  return corsJson({
    ok: true,
    period_hours: hours,
    total_errors: errors?.results?.length || 0,
    error_summary: errorSummary?.results || [],
    recent_errors: errors?.results || [],
  }, {}, request, env);
}

// ─── Observability ────────────────────────────────────────────────────────────

// Non-blocking request logger — uses waitUntil to avoid slowing responses
function trackRequest(env, ctx, { method, path, status, durationMs, request }) {
  if (!env.DB || !ctx?.waitUntil) return;
  // Only track API requests, skip static assets
  if (!path.startsWith('/api/')) return;
  // Truncate path to avoid storing query strings or huge paths
  const cleanPath = path.split('?')[0].slice(0, 100);
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);
  const country = request.headers.get('CF-IPCountry') || '';
  ctx.waitUntil(
    env.DB.prepare(
      'INSERT INTO api_requests (method, path, status, duration_ms, user_agent, country, created_at) VALUES (?,?,?,?,?,?,?)'
    ).bind(cleanPath, method, status, durationMs, ua, country, isoNow()).run().catch(() => {})
  );
}

// Non-blocking error logger
function trackError(env, ctx, { path, method, error, request }) {
  if (!env.DB || !ctx?.waitUntil) return;
  const cleanPath = (path || '').split('?')[0].slice(0, 100);
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);
  const msg = (error?.message || String(error)).slice(0, 500);
  const stack = (error?.stack || '').slice(0, 2000);
  ctx.waitUntil(
    env.DB.prepare(
      'INSERT INTO api_errors (path, method, error_message, error_stack, user_agent, created_at) VALUES (?,?,?,?,?,?)'
    ).bind(cleanPath, method, msg, stack, ua, isoNow()).run().catch(() => {})
  );
}

// Cleanup old tracking data (keep 30 days) — call periodically
async function cleanupOldTrackingData(env) {
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  await Promise.all([
    env.DB.prepare('DELETE FROM api_requests WHERE created_at < ?').bind(cutoff).run().catch(() => {}),
    env.DB.prepare('DELETE FROM api_errors WHERE created_at < ?').bind(cutoff).run().catch(() => {}),
  ]);
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight — don't track these
    if (method === 'OPTIONS') {
      return handleCors(request, env);
    }

    let tracked = false;
    try {
      // Initialize schema on first request
      await ensureFullSchema(env);

      // Periodic cleanup — 0.1% of requests trigger it (roughly once per 1000 requests)
      if (Math.random() < 0.001) {
        ctx?.waitUntil?.(cleanupOldTrackingData(env));
      }

      // Health & Meta — includes DB connectivity check
      if (path === '/api/health' && method === 'GET') {
        let dbOk = false;
        try {
          const check = await env.DB.prepare('SELECT 1 as ok').first();
          dbOk = check?.ok === 1;
        } catch {}
        const resp = {
          ok: true,
          service: 'training-partner-app',
          now: isoNow(),
          db_connected: dbOk,
          version: '2.1.0',
        };
        const status = dbOk ? 200 : 503;
        tracked = true;
        trackRequest(env, ctx, { method, path, status, durationMs: Date.now() - startTime, request });
        return corsJson(resp, { status }, request, env);
      }
      if (path === '/api/meta' && method === 'GET') {
        return corsJson({ ok: true, product: 'Training Partner', version: '2.0.0' }, {}, request, env);
      }

      // Auth
      if (path === '/api/auth/register' && method === 'POST') return handleRegister(request, env);
      if (path === '/api/auth/login' && method === 'POST') return handleLogin(request, env);
      if (path === '/api/auth/google' && method === 'POST') return handleGoogleAuth(request, env);
      if (path === '/api/auth/me' && method === 'GET') return handleGetMe(request, env);
      if (path === '/api/auth/forgot-password' && method === 'POST') return handleForgotPassword(request, env);
      if (path === '/api/auth/reset-password' && method === 'POST') return handleResetPassword(request, env);
      if (path === '/api/auth/verify-email' && method === 'GET') return handleVerifyEmail(request, env);
      if (path === '/api/auth/resend-verification' && method === 'POST') return handleResendVerification(request, env);

      // Profile
      if (path === '/api/profile/instagram' && method === 'PUT') return handleUpdateInstagram(request, env);
      if (path === '/api/profile' && method === 'PUT') return handleUpdateProfile(request, env);
      if (path.match(/^\/api\/profile\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetProfile(request, env, id);
      }

      // Partners
      if (path === '/api/partners' && method === 'GET') return handleGetPartners(request, env);
      if (path.match(/^\/api\/partners\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetPartnerDetail(request, env, id);
      }

      // Gyms
      if (path === '/api/gyms' && method === 'GET') return handleGetGyms(request, env);
      if (path.match(/^\/api\/gyms\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetGymDetail(request, env, id);
      }

      // Bookings
      if (path === '/api/bookings' && method === 'POST') return handleCreateBooking(request, env);
      if (path === '/api/bookings' && method === 'GET') return handleGetBookings(request, env);
      if (path.match(/^\/api\/bookings\/(\d+)\/cancel$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleCancelBooking(request, env, id);
      }

      // Messages
      if (path === '/api/messages' && method === 'GET') return handleGetConversations(request, env);
      if (path === '/api/messages/unread' && method === 'GET') return handleGetUnreadCount(request, env);
      if (path.match(/^\/api\/messages\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetMessages(request, env, id);
      }
      if (path.match(/^\/api\/messages\/(\d+)$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleSendMessage(request, env, id);
      }

      // Subscriptions & Stripe
      if (path === '/api/subscriptions/status' && method === 'GET') return handleGetSubscriptionStatus(request, env);
      if (path === '/api/subscriptions/webhook' && method === 'POST') return handleSubscriptionWebhook(request, env);
      if (path === '/api/webhooks/stripe' && method === 'POST') return handleStripeWebhook(request, env);
      if (path === '/api/checkout/create' && method === 'POST') return handleCreateCheckout(request, env);

      // Notifications
      if (path === '/api/notifications' && method === 'GET') return handleGetNotifications(request, env);
      if (path === '/api/notifications/read' && method === 'POST') return handleMarkNotificationsRead(request, env);

      // Reviews
      if (path === '/api/reviews' && method === 'POST') return handleCreateReview(request, env);

      // Block, Report, Avatar
      if (path === '/api/block' && (method === 'POST' || method === 'GET' || method === 'DELETE')) return handleBlockUser(request, env);
      if (path === '/api/report' && method === 'POST') return handleReportUser(request, env);
      if (path === '/api/upload-avatar' && method === 'POST') return handleUploadAvatar(request, env);
      if (path === '/api/account/delete' && method === 'POST') return handleDeleteAccount(request, env);

      // R2 image serving
      if (method === 'GET' && path.startsWith('/api/images/')) {
        const key = path.replace('/api/images/', '');
        return serveImageFromR2(env, key);
      }

      // Image upload
      if (path === '/api/upload-image' && method === 'POST') return handleImageUpload(request, env);

      // Moderation
      if (path === '/api/moderation/queue' && method === 'GET') return handleModerationQueue(request, env);
      if (path === '/api/moderation/review' && method === 'POST') return handleModerationReview(request, env);

      // Moderator management
      if (path === '/api/admin/moderators' && method === 'GET') return handleListModerators(request, env);
      if (path === '/api/admin/moderators/grant' && method === 'POST') return handleGrantModerator(request, env);
      if (path === '/api/admin/moderators/revoke' && method === 'POST') return handleRevokeModerator(request, env);

      // Trust & Safety: Identity Verification
      if (path === '/api/identity/submit' && method === 'POST') return handleSubmitIdentity(request, env);
      if (path === '/api/identity/status' && method === 'GET') return handleGetIdentityStatus(request, env);
      if (path === '/api/identity/data' && method === 'DELETE') return handleDeleteIdentityData(request, env);

      // Trust & Safety: Session Ratings / Reputation
      if (path === '/api/ratings' && method === 'POST') return handleSubmitRating(request, env);
      if (path.match(/^\/api\/ratings\/score\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[4]);
        return handleGetTrustScore(request, env, id);
      }
      if (path.match(/^\/api\/ratings\/can-rate\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[4]);
        return handleCanRate(request, env, id);
      }

      // Trust & Safety: Block System
      if (path === '/api/blocks' && method === 'POST') return handleTsBlockUser(request, env);
      if (path === '/api/blocks' && method === 'GET') return handleGetBlocks(request, env);
      if (path.match(/^\/api\/blocks\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleTsUnblockUser(request, env, id);
      }

      // Trust & Safety: Emergency Contact
      if (path === '/api/profile/emergency-contact' && method === 'PUT') return handleUpdateEmergencyContact(request, env);

      // Admin routes
      if (path === '/api/admin/stats' && method === 'GET') return handleAdminStats(request, env);
      if (path === '/api/admin/users' && method === 'GET') return handleAdminUsers(request, env);
      if (path === '/api/admin/reports' && method === 'GET') return handleAdminReports(request, env);
      if (path.match(/^\/api\/admin\/reports\/(\d+)\/resolve$/) && method === 'POST') {
        const id = parseInt(path.split('/')[4]);
        return handleAdminResolveReport(request, env, id);
      }

      // Admin Identity Verification
      if (path === '/api/admin/identity/pending' && method === 'GET') return handleAdminGetPendingIdentities(request, env);
      if (path.match(/^\/api\/admin\/identity\/(\d+)\/review$/) && method === 'PUT') {
        const id = parseInt(path.split('/')[4]);
        return handleAdminReviewIdentity(request, env, id);
      }

      // Community Posts
      if (path === '/api/posts' && method === 'GET') return handleGetPosts(request, env);
      if (path === '/api/posts' && method === 'POST') return handleCreatePost(request, env);
      if (path.match(/^\/api\/posts\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetPost(request, env, id);
      }
      if (path.match(/^\/api\/posts\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeletePost(request, env, id);
      }
      if (path.match(/^\/api\/posts\/(\d+)\/like$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleToggleLike(request, env, id);
      }

      // Gym Documents & Private Lessons
      if (path.match(/^\/api\/gyms\/(\d+)\/documents$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetGymDocuments(request, env, id);
      }
      if (path.match(/^\/api\/gyms\/(\d+)\/documents$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleUploadGymDocument(request, env, id);
      }
      if (path.match(/^\/api\/gyms\/(\d+)\/documents\/(\d+)$/) && method === 'DELETE') {
        const gymId = parseInt(path.split('/')[3]);
        const docId = parseInt(path.split('/')[5]);
        return handleDeleteGymDocument(request, env, gymId, docId);
      }
      if (path.match(/^\/api\/gyms\/(\d+)\/lessons$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetPrivateLessons(request, env, id);
      }
      if (path.match(/^\/api\/gyms\/(\d+)\/lessons$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleCreatePrivateLesson(request, env, id);
      }

      // Post Comments
      if (path.match(/^\/api\/posts\/(\d+)\/comments$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetPostComments(request, env, id);
      }
      if (path.match(/^\/api\/posts\/(\d+)\/comments$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleCreatePostComment(request, env, id);
      }
      if (path.match(/^\/api\/comments\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeletePostComment(request, env, id);
      }

      // Feedback
      if (path === '/api/feedback' && method === 'POST') return handleSubmitFeedback(request, env);
      if (path === '/api/admin/feedback' && method === 'GET') return handleGetFeedback(request, env);

      // Invite Codes (Alpha)
      if (path === '/api/invite/validate' && method === 'POST') return handleValidateInviteCode(request, env);
      if (path === '/api/invite/redeem' && method === 'POST') return handleRedeemInviteCode(request, env);
      if (path === '/api/invite/my-codes' && method === 'GET') return handleGetMyInviteCodes(request, env);
      if (path === '/api/invite/generate' && method === 'POST') return handleGenerateUserInviteCode(request, env);
      if (path === '/api/admin/invite-codes' && method === 'POST') return handleCreateInviteCode(request, env);

      // Support / Donations
      if (path === '/api/support/donate' && method === 'POST') return handleCreateSupportDonation(request, env);
      if (path === '/api/support/stats' && method === 'GET') return handleGetSupportStats(request, env);

      // Milo AI Monitoring
      if (path === '/api/milo/health' && method === 'GET') return handleMiloHealthCheck(request, env);
      if (path === '/api/milo/metrics' && method === 'GET') return handleMiloMetrics(request, env);
      if (path === '/api/milo/metrics' && method === 'POST') return handleMiloRecordMetric(request, env);

      // Gym Owner Management
      if (path === '/api/gym/mine' && method === 'GET') return handleGetMyGym(request, env);
      if (path === '/api/gym/mine' && method === 'PUT') return handleUpdateMyGym(request, env);
      if (path === '/api/gym/dashboard' && method === 'GET') return handleGymDashboardStats(request, env);

      // Gym Membership / Affiliation
      if (path === '/api/gym/members/request' && method === 'POST') return handleRequestGymMembership(request, env);
      if (path === '/api/gym/members/invite' && method === 'POST') return handleInviteGymMember(request, env);
      if (path === '/api/gym/members/respond' && method === 'POST') return handleRespondGymMembership(request, env);
      if (path === '/api/gym/members/remove' && method === 'POST') return handleRemoveGymMember(request, env);
      if (path === '/api/gym/members/role' && method === 'PUT') return handleUpdateGymMemberRole(request, env);
      if (path === '/api/gym/my-memberships' && method === 'GET') return handleGetMyGymMemberships(request, env);
      if (path.match(/^\/api\/gyms\/(\d+)\/members$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetGymMembers(request, env, id);
      }

      // QR Code Check-In (public routes first)
      if (path.match(/^\/api\/checkin\/([a-f0-9]+)$/) && method === 'GET') {
        const code = path.split('/')[3];
        return handleResolveCheckinCode(request, env, code);
      }
      if (path.match(/^\/api\/checkin\/([a-f0-9]+)\/verify$/) && method === 'POST') {
        const code = path.split('/')[3];
        return handleQrCheckinVerify(request, env, code);
      }
      if (path.match(/^\/api\/checkin\/([a-f0-9]+)\/guest$/) && method === 'POST') {
        const code = path.split('/')[3];
        return handleQrCheckinGuest(request, env, code);
      }
      if (path === '/api/gym/checkin-code' && method === 'GET') return handleGetCheckinCode(request, env);
      if (path === '/api/gym/checkin-code/regenerate' && method === 'POST') return handleRegenerateCheckinCode(request, env);
      if (path === '/api/gym/guest-checkins' && method === 'GET') return handleGetGuestCheckins(request, env);

      // Training Logs
      if (path === '/api/training-logs' && method === 'POST') return handleCreateTrainingLog(request, env);
      if (path === '/api/training-logs' && method === 'GET') return handleGetTrainingLogs(request, env);
      if (path === '/api/training-logs/stats' && method === 'GET') return handleGetTrainingStats(request, env);
      if (path.match(/^\/api\/training-logs\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetTrainingLog(request, env, id);
      }
      if (path.match(/^\/api\/training-logs\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeleteTrainingLog(request, env, id);
      }

      // Leaderboard
      if (path === '/api/leaderboard' && method === 'GET') return handleGetLeaderboard(request, env);

      // User Training Activity (public)
      if (path.match(/^\/api\/users\/(\d+)\/activity$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetUserTrainingActivity(request, env, id);
      }

      // Gym Favorites
      if (path === '/api/favorites/gyms' && method === 'POST') return handleToggleFavoriteGym(request, env);
      if (path === '/api/favorites/gyms' && method === 'GET') return handleGetFavoriteGyms(request, env);
      if (path.match(/^\/api\/favorites\/gyms\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[4]);
        return handleCheckFavoriteGym(request, env, id);
      }

      // Events
      if (path === '/api/events' && method === 'POST') return handleCreateEvent(request, env);
      if (path === '/api/events' && method === 'GET') return handleGetEvents(request, env);
      if (path.match(/^\/api\/events\/(\d+)$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetEvent(request, env, id);
      }
      if (path.match(/^\/api\/events\/(\d+)\/rsvp$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleRsvpEvent(request, env, id);
      }
      if (path.match(/^\/api\/events\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeleteEvent(request, env, id);
      }

      // Check-Ins (existing)
      if (path === '/api/checkins' && method === 'POST') return handleCheckin(request, env);
      if (path === '/api/checkins' && method === 'GET') return handleGetCheckins(request, env);
      if (path === '/api/checkins/passport' && method === 'GET') return handleGetTrainingPassport(request, env);

      // Gym Promotions
      if (path === '/api/promotions' && method === 'POST') return handleCreatePromotion(request, env);
      if (path === '/api/promotions/browse' && method === 'GET') return handleBrowsePromotions(request, env);
      if (path.match(/^\/api\/gyms\/(\d+)\/promotions$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetGymPromotions(request, env, id);
      }
      if (path.match(/^\/api\/promotions\/(\d+)$/) && method === 'PUT') {
        const id = parseInt(path.split('/')[3]);
        return handleUpdatePromotion(request, env, id);
      }
      if (path.match(/^\/api\/promotions\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeletePromotion(request, env, id);
      }

      // Gym Announcements
      if (path === '/api/gym/announcements' && method === 'POST') return handleCreateAnnouncement(request, env);
      if (path.match(/^\/api\/gyms\/(\d+)\/announcements$/) && method === 'GET') {
        const id = parseInt(path.split('/')[3]);
        return handleGetGymAnnouncements(request, env, id);
      }
      if (path.match(/^\/api\/announcements\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[3]);
        return handleDeleteAnnouncement(request, env, id);
      }

      // Gym Sessions Management
      if (path === '/api/gym/sessions' && method === 'POST') return handleCreateGymSession(request, env);
      if (path.match(/^\/api\/gym\/sessions\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(path.split('/')[4]);
        return handleDeleteGymSession(request, env, id);
      }

      // Gym Discovery (geo + filter based)
      if (path === '/api/gyms/discover' && method === 'GET') return handleDiscoverGyms(request, env);

      // Subscription Management
      if (path === '/api/subscriptions/cancel' && method === 'POST') return handleCancelSubscription(request, env);

      // Legacy routes
      if (path === '/api/open-mats' && method === 'GET') {
        return corsJson({ ok: true, items: await listOpenMats(env) }, {}, request, env);
      }
      if (path === '/api/founding/apply' && method === 'POST') return handleFoundingApply(request, env);
      if (path === '/api/waitlist' && method === 'POST') return handleWaitlist(request, env);

      // Admin Analytics (observability dashboard)
      if (path === '/api/admin/analytics' && method === 'GET') return handleAdminAnalytics(request, env);
      if (path === '/api/admin/errors' && method === 'GET') return handleAdminErrors(request, env);

      // Fallback to static assets
      if (env.ASSETS) return env.ASSETS.fetch(request);
      tracked = true;
      trackRequest(env, ctx, { method, path, status: 404, durationMs: Date.now() - startTime, request });
      return new Response('Not found', { status: 404 });

    } catch (err) {
      console.error('Worker error:', err);
      tracked = true;
      trackError(env, ctx, { path, method, error: err, request });
      trackRequest(env, ctx, { method, path, status: 500, durationMs: Date.now() - startTime, request });
      return corsJson({ ok: false, error: 'Internal server error' }, { status: 500 }, request, env);
    } finally {
      // Track all successful API requests that weren't already tracked
      if (!tracked && path.startsWith('/api/')) {
        trackRequest(env, ctx, { method, path, status: 200, durationMs: Date.now() - startTime, request });
      }
    }
  },

  async scheduled(event, env) {
    // Day 20: Feedback request email
    const day20Users = await env.DB.prepare(`
      SELECT u.id, u.email, u.display_name FROM users u
      LEFT JOIN email_log el ON el.user_id = u.id AND el.email_type = 'trial_feedback_day20'
      WHERE u.created_at <= datetime('now', '-20 days')
        AND u.created_at > datetime('now', '-21 days')
        AND el.id IS NULL AND u.role != 'admin'
    `).all();

    for (const user of day20Users.results || []) {
      await sendEmail(env, {
        to: user.email,
        subject: "How's your Training Partner experience? (Day 20)",
        html: `<p>Hi ${user.display_name || 'there'},</p>
          <p>You've been using Training Partner for 20 days! We'd love to hear how it's going.</p>
          <p>Reply to this email with any feedback — what's working, what could be better.</p>
          <p>Your trial continues for 10 more days.</p>
          <p>— The Training Partner Team</p>`
      });
      await env.DB.prepare('INSERT INTO email_log (user_id, email_type) VALUES (?, ?)').bind(user.id, 'trial_feedback_day20').run();
    }

    // Day 29: Trial ending reminder
    const day29Users = await env.DB.prepare(`
      SELECT u.id, u.email, u.display_name FROM users u
      LEFT JOIN email_log el ON el.user_id = u.id AND el.email_type = 'trial_ending_day29'
      WHERE u.created_at <= datetime('now', '-29 days')
        AND u.created_at > datetime('now', '-30 days')
        AND el.id IS NULL AND u.role != 'admin'
    `).all();

    for (const user of day29Users.results || []) {
      await sendEmail(env, {
        to: user.email,
        subject: "Your Training Partner trial ends tomorrow",
        html: `<p>Hi ${user.display_name || 'there'},</p>
          <p>We hope you've enjoyed your 30-day trial!</p>
          <p>Your trial ends tomorrow. If you'd like to continue, no action needed.</p>
          <p><strong>If you'd like to cancel</strong>, visit your <a href="https://trainingpartner.app/app/settings">account settings</a>. We never want to charge anyone who isn't getting value.</p>
          <p>Thanks for giving us a try!</p>
          <p>— The Training Partner Team</p>`
      });
      await env.DB.prepare('INSERT INTO email_log (user_id, email_type) VALUES (?, ?)').bind(user.id, 'trial_ending_day29').run();
    }
  },
};
