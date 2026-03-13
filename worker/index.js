// Training Partner — Cloudflare Worker API
// Full-featured backend: Auth, Profiles, Partners, Gyms, Messaging, Bookings, Subscriptions

// ─── Utilities ───────────────────────────────────────────────────────────────

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

// Allowed origins for CORS — restrict to known frontends
const ALLOWED_ORIGINS = [
  'https://training-partner.vercel.app',
  'https://trainingpartner.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow custom frontend URL from env
  if (env.FRONTEND_URL && origin === env.FRONTEND_URL) return true;
  // Allow Vercel preview deployments
  if (origin.match(/^https:\/\/training-partner-[\w-]+\.vercel\.app$/)) return true;
  return false;
}

function corsHeaders(origin, env) {
  const allowedOrigin = isAllowedOrigin(origin, env) ? origin : ALLOWED_ORIGINS[0];
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
  const cors = corsHeaders(origin, env);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

// ─── Email Service ──────────────────────────────────────────────────────────

const FRONTEND_URL = 'https://training-partner.vercel.app';

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

function sanitize(str, maxLen = 5000) {
  if (typeof str !== 'string') return '';
  // Strip HTML-significant and script-injection characters
  return str.replace(/[<>"'`]/g, '').replace(/javascript:/gi, '').trim().slice(0, maxLen);
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

// ─── Runtime Schema Initialization ───────────────────────────────────────────

let schemaInitialized = false;

async function ensureFullSchema(env) {
  if (schemaInitialized || !env.DB) return;
  schemaInitialized = true;
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
    ];
    for (const sql of indexes) {
      try { await env.DB.prepare(sql).run(); } catch {}
    }
    // Safe column additions for existing databases
    const safeAlters = [
      'ALTER TABLE users ADD COLUMN google_id TEXT',
      'ALTER TABLE users ADD COLUMN instagram_username TEXT',
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
  } catch (err) {
    console.error('Schema init error:', err);
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

  if (!name || !email || !password) {
    return corsJson({ ok: false, error: 'Name, email, and password are required' }, { status: 400 }, request, env);
  }
  if (password.length < 6 || password.length > 128) {
    return corsJson({ ok: false, error: 'Password must be 6-128 characters' }, { status: 400 }, request, env);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return corsJson({ ok: false, error: 'Invalid email address' }, { status: 400 }, request, env);
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
    INSERT INTO users (email, password_hash, password_salt, display_name, city, role, email_verified, verification_token, created_at, updated_at)
    VALUES (?, ?, ?, ?, '', 'athlete', 0, ?, ?, ?)
  `).bind(email, passwordHash, salt, name, verificationToken, now, now).run();

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
  const availability = body.availability ? JSON.stringify(body.availability) : undefined;
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

  // Check blocked users
  query += ` AND u.id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = ?)
             AND u.id NOT IN (SELECT blocker_id FROM blocked_users WHERE blocked_id = ?)`;
  params.push(user.id, user.id);

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
    ORDER BY m.created_at DESC
  `).bind(user.id, user.id, user.id, user.id, user.id, user.id).all();

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

  // Check if blocked
  const blocked = await env.DB.prepare(
    'SELECT id FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
  ).bind(user.id, receiverId, receiverId, user.id).first();
  if (blocked) {
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

  return corsJson({
    ok: true,
    subscription: sub ? {
      plan: sub.plan,
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      trial_ends_at: sub.trial_ends_at,
    } : { plan: 'free', status: 'active' }
  }, {}, request, env);
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
    case 'checkout.session.completed': {
      const session = event.data.object;
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
      break;
    }
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

// ─── Community Posts Routes ─────────────────────────────────────────────────

async function handleGetPosts(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const sport = url.searchParams.get('sport');
  const sort = url.searchParams.get('sort') || 'recent';
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  let query = `
    SELECT p.*, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
           (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [user.id];

  if (type) { query += ' AND p.type = ?'; params.push(type); }
  if (sport) { query += ' AND p.sport = ?'; params.push(sport); }

  if (sort === 'popular') {
    query += ' ORDER BY like_count DESC, p.created_at DESC';
  } else {
    query += ' ORDER BY p.created_at DESC';
  }
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();

  return corsJson({
    ok: true,
    posts: (results.results || []).map(p => ({
      id: p.id,
      user_id: p.user_id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      title: p.title,
      body: p.body,
      type: p.type,
      sport: p.sport,
      like_count: p.like_count || 0,
      is_liked: (p.is_liked || 0) > 0,
      created_at: p.created_at,
    }))
  }, {}, request, env);
}

async function handleCreatePost(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.body) {
    return corsJson({ ok: false, error: 'Post body is required' }, { status: 400 }, request, env);
  }

  const now = isoNow();
  const title = sanitize(body.title || '');
  const postBody = sanitize(body.body);
  const type = sanitize(body.type || 'general');
  const sport = sanitize(body.sport || '');

  const result = await env.DB.prepare(
    'INSERT INTO posts (user_id, title, body, type, sport, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(user.id, title, postBody, type, sport, now).run();

  return corsJson({
    ok: true,
    post: { id: result.meta.last_row_id, user_id: user.id, title, body: postBody, type, sport, created_at: now, like_count: 0, is_liked: false }
  }, { status: 201 }, request, env);
}

async function handleLikePost(request, env, postId) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const existing = await env.DB.prepare(
    'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
  ).bind(postId, user.id).first();

  if (existing) {
    await env.DB.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').bind(postId, user.id).run();
    return corsJson({ ok: true, liked: false }, {}, request, env);
  } else {
    await env.DB.prepare(
      'INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)'
    ).bind(postId, user.id, isoNow()).run();
    return corsJson({ ok: true, liked: true }, {}, request, env);
  }
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
  if (password.length < 6 || password.length > 128) {
    return corsJson({ ok: false, error: 'Password must be 6-128 characters' }, { status: 400 }, request, env);
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
  if (!body || !body.user_id || !body.reason) {
    return corsJson({ ok: false, error: 'User ID and reason are required' }, { status: 400 }, request, env);
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

  const reason = sanitize(body.reason).slice(0, 200);
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
    // Delete blocked users
    await env.DB.prepare('DELETE FROM blocked_users WHERE blocker_id = ? OR blocked_id = ?').bind(userId, userId).run();
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
  const avatar = body.avatar;
  if (!avatar.startsWith('data:image/')) {
    return corsJson({ ok: false, error: 'Invalid image format. Must be a data URL.' }, { status: 400 }, request, env);
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

// ─── Block User Route ────────────────────────────────────────────────────────

async function handleBlockUser(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.user_id) {
    return corsJson({ ok: false, error: 'User ID is required' }, { status: 400 }, request, env);
  }

  const now = isoNow();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)'
  ).bind(user.id, body.user_id, now).run();

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
  const name = normalizeText(body.name);
  const email = normalizeText(body.email).toLowerCase();
  const role = normalizeText(body.role);
  if (!name || !email || !role) return corsJson({ ok: false, error: 'missing_required_fields' }, { status: 400 }, request, env);
  if (env.DB) {
    await ensureSchema(env);
    await env.DB.prepare(`INSERT INTO founding_applications (created_at, name, email, role, city, sport, goal, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(isoNow(), name, email, role, normalizeText(body.city), normalizeText(body.sport), normalizeText(body.goal), normalizeText(body.notes)).run();
  }
  return corsJson({ ok: true, status: 'received' }, {}, request, env);
}

async function handleWaitlist(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'invalid_json' }, { status: 400 }, request, env);
  const email = normalizeText(body.email).toLowerCase();
  if (!email) return corsJson({ ok: false, error: 'missing_email' }, { status: 400 }, request, env);
  if (env.DB) {
    await ensureSchema(env);
    await env.DB.prepare(`INSERT INTO waitlist_signups (created_at, name, email, role, city, notes) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(isoNow(), normalizeText(body.name), email, normalizeText(body.role), normalizeText(body.city), normalizeText(body.notes)).run();
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

  const title = sanitize(body.title);
  const postBody = sanitize(body.body);
  const type = ['article', 'tip', 'question', 'event'].includes(body.type) ? body.type : 'article';
  const sport = sanitize(body.sport || '');
  const mediaUrl = sanitize(body.media_url || '');

  if (!title || !postBody) {
    return corsJson({ ok: false, error: 'Title and body are required' }, { status: 400 }, request, env);
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

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleCors(request, env);
    }

    try {
      // Initialize schema on first request
      await ensureFullSchema(env);

      // Health & Meta
      if (path === '/api/health' && method === 'GET') {
        return corsJson({ ok: true, service: 'training-partner-app', now: isoNow() }, {}, request, env);
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
      if (path === '/api/block' && method === 'POST') return handleBlockUser(request, env);
      if (path === '/api/report' && method === 'POST') return handleReportUser(request, env);
      if (path === '/api/upload-avatar' && method === 'POST') return handleUploadAvatar(request, env);
      if (path === '/api/account/delete' && method === 'POST') return handleDeleteAccount(request, env);

      // Admin routes
      if (path === '/api/admin/stats' && method === 'GET') return handleAdminStats(request, env);
      if (path === '/api/admin/users' && method === 'GET') return handleAdminUsers(request, env);
      if (path === '/api/admin/reports' && method === 'GET') return handleAdminReports(request, env);
      if (path.match(/^\/api\/admin\/reports\/(\d+)\/resolve$/) && method === 'POST') {
        const id = parseInt(path.split('/')[4]);
        return handleAdminResolveReport(request, env, id);
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

      // Legacy routes
      if (path === '/api/open-mats' && method === 'GET') {
        return corsJson({ ok: true, items: await listOpenMats(env) }, {}, request, env);
      }
      if (path === '/api/founding/apply' && method === 'POST') return handleFoundingApply(request, env);
      if (path === '/api/waitlist' && method === 'POST') return handleWaitlist(request, env);

      // Fallback to static assets
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('Not found', { status: 404 });

    } catch (err) {
      console.error('Worker error:', err);
      return corsJson({ ok: false, error: 'Internal server error' }, { status: 500 }, request, env);
    }
  }
};
