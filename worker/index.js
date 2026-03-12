// Training Partner — Cloudflare Worker API
// Full-featured backend: Auth, Profiles, Partners, Gyms, Messaging, Bookings, Subscriptions

// ─── Utilities ───────────────────────────────────────────────────────────────

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function corsHeaders(origin, env) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

function corsJson(data, init = {}, request, env) {
  const origin = request.headers.get('Origin') || '*';
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  const cors = corsHeaders(origin, env);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

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

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 5000);
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
  const token = auth.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET || 'tp-jwt-secret');
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
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, display_name TEXT NOT NULL, avatar_url TEXT DEFAULT '', city TEXT DEFAULT '', role TEXT NOT NULL DEFAULT 'athlete', email_verified INTEGER NOT NULL DEFAULT 0, verification_token TEXT, reset_token TEXT, reset_token_expires TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, token TEXT)`,
      `CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, sports TEXT, skill_level TEXT, weight_class TEXT, training_goals TEXT, experience_years INTEGER DEFAULT 0, bio TEXT, availability TEXT, age INTEGER DEFAULT 0, location TEXT, profile_complete INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gyms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT DEFAULT '', city TEXT DEFAULT '', state TEXT DEFAULT '', lat REAL DEFAULT 0, lng REAL DEFAULT 0, phone TEXT DEFAULT '', email TEXT DEFAULT '', description TEXT DEFAULT '', sports TEXT DEFAULT '[]', amenities TEXT DEFAULT '[]', verified INTEGER NOT NULL DEFAULT 0, premium INTEGER NOT NULL DEFAULT 0, rating REAL NOT NULL DEFAULT 0, review_count INTEGER NOT NULL DEFAULT 0, price TEXT DEFAULT '', owner_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, day_of_week TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, max_slots INTEGER NOT NULL DEFAULT 20, current_slots INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, session_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS matches (id INTEGER PRIMARY KEY AUTOINCREMENT, user_a INTEGER NOT NULL, user_b INTEGER NOT NULL, score REAL NOT NULL DEFAULT 0, explanation TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL, content TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'free', status TEXT NOT NULL DEFAULT 'active', lemon_squeezy_id TEXT, lemon_squeezy_customer_id TEXT, current_period_start TEXT, current_period_end TEXT, trial_ends_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT DEFAULT '', data TEXT DEFAULT '{}', read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS gym_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, gym_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, comment TEXT DEFAULT '', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS favorite_gyms (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gym_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS blocked_users (id INTEGER PRIMARY KEY AUTOINCREMENT, blocker_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, window_start TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS founding_applications (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, city TEXT, sport TEXT, goal TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new')`,
      `CREATE TABLE IF NOT EXISTS waitlist_signups (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT, email TEXT NOT NULL, role TEXT, city TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new')`,
      `CREATE TABLE IF NOT EXISTS open_mats (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, city TEXT NOT NULL, sport TEXT NOT NULL, venue TEXT, day_of_week TEXT, notes TEXT, is_active INTEGER NOT NULL DEFAULT 1)`,
      `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT DEFAULT '', body TEXT NOT NULL, type TEXT DEFAULT 'general', sport TEXT DEFAULT '', created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS post_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, created_at TEXT NOT NULL)`,
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
      'CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_pair ON post_likes(post_id, user_id)',
    ];
    for (const sql of indexes) {
      try { await env.DB.prepare(sql).run(); } catch {}
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
  if (password.length < 6) {
    return corsJson({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 }, request, env);
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

  // Generate JWT
  const token = await createJWT({ userId, email, role: 'athlete' }, env.JWT_SECRET || 'tp-jwt-secret');

  return corsJson({
    ok: true,
    token,
    user: { id: userId, email, display_name: name, role: 'athlete', city: '', avatar_url: '' }
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

  const token = await createJWT({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET || 'tp-jwt-secret');

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
  const limit = parseInt(url.searchParams.get('limit')) || 50;
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
    SELECT u.id, u.display_name, u.city, u.avatar_url, u.created_at,
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
  const limit = parseInt(url.searchParams.get('limit')) || 50;
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
  await env.DB.prepare('INSERT INTO bookings (user_id, session_id, status, created_at) VALUES (?, ?, ?, ?)').bind(user.id, body.session_id, 'confirmed', now).run();
  await env.DB.prepare('UPDATE gym_sessions SET current_slots = current_slots + 1 WHERE id = ?').bind(body.session_id).run();

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

async function handleSubscriptionWebhook(request, env) {
  const body = await readJson(request);
  if (!body) return corsJson({ ok: false, error: 'Invalid JSON' }, { status: 400 }, request, env);

  // Verify webhook signature (Lemon Squeezy)
  const signature = request.headers.get('X-Signature');
  // In production, verify signature against LEMON_SQUEEZY_WEBHOOK_SECRET

  const eventName = body.meta?.event_name;
  const data = body.data?.attributes;

  if (!eventName || !data) {
    return corsJson({ ok: false, error: 'Invalid webhook payload' }, { status: 400 }, request, env);
  }

  const email = data.user_email;
  const user = email ? await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first() : null;

  if (!user) {
    return corsJson({ ok: true, message: 'User not found, skipping' }, {}, request, env);
  }

  const now = isoNow();

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      await env.DB.prepare(`
        INSERT INTO subscriptions (user_id, plan, status, lemon_squeezy_id, current_period_start, current_period_end, created_at, updated_at)
        VALUES (?, 'premium', 'active', ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET plan = 'premium', status = 'active', lemon_squeezy_id = ?, current_period_start = ?, current_period_end = ?, updated_at = ?
      `).bind(
        user.id, data.subscription_id || '', data.current_period_start || now, data.current_period_end || '', now, now,
        data.subscription_id || '', data.current_period_start || now, data.current_period_end || '', now
      ).run();
      break;

    case 'subscription_cancelled':
    case 'subscription_expired':
      await env.DB.prepare(
        'UPDATE subscriptions SET status = ?, updated_at = ? WHERE user_id = ?'
      ).bind('cancelled', now, user.id).run();
      break;
  }

  return corsJson({ ok: true }, {}, request, env);
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

// ─── Report Route ─────────────────────────────────────────────────────────────

async function handleReport(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.reported_id || !body.reason) {
    return corsJson({ ok: false, error: 'reported_id and reason are required' }, { status: 400 }, request, env);
  }

  // Store report in notifications table (admin type)
  const now = isoNow();
  await env.DB.prepare(
    'INSERT INTO notifications (user_id, type, title, body, data, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(1, 'user_report', 'New User Report', `User ${user.id} reported user ${body.reported_id}`, JSON.stringify({ reporter_id: user.id, reported_id: body.reported_id, reason: body.reason, details: body.details || '' }), now).run();

  return corsJson({ ok: true }, {}, request, env);
}

// ─── Upload Avatar Route ──────────────────────────────────────────────────────

async function handleUploadAvatar(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || !body.avatar_data) {
    return corsJson({ ok: false, error: 'avatar_data is required' }, { status: 400 }, request, env);
  }

  // For now, store base64 data URL directly (in production, upload to R2)
  const avatarUrl = body.avatar_data;
  const now = isoNow();
  await env.DB.prepare('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?').bind(avatarUrl, now, user.id).run();

  return corsJson({ ok: true, avatar_url: avatarUrl }, {}, request, env);
}

// ─── Delete Account Route ─────────────────────────────────────────────────────

async function handleDeleteAccount(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  const body = await readJson(request);
  if (!body || body.confirmation !== 'DELETE') {
    return corsJson({ ok: false, error: 'Must confirm with "DELETE"' }, { status: 400 }, request, env);
  }

  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
  return corsJson({ ok: true, message: 'Account deleted' }, {}, request, env);
}

// ─── Checkout Route ───────────────────────────────────────────────────────────

async function handleCreateCheckout(request, env) {
  const user = await getUser(request, env);
  if (!user) return corsJson({ ok: false, error: 'Unauthorized' }, { status: 401 }, request, env);

  // Placeholder checkout — returns a Lemon Squeezy checkout URL
  // In production, create a real checkout session via Lemon Squeezy API
  return corsJson({
    ok: true,
    checkout_url: `https://trainingpartner.lemonsqueezy.com/checkout/buy/premium?email=${encodeURIComponent(user.email)}`
  }, {}, request, env);
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
        return corsJson({ ok: true, service: 'training-partner-app', now: isoNow(), has_db: Boolean(env.DB) }, {}, request, env);
      }
      if (path === '/api/meta' && method === 'GET') {
        return corsJson({ ok: true, product: 'Training Partner', version: '2.0.0' }, {}, request, env);
      }

      // Auth
      if (path === '/api/auth/register' && method === 'POST') return handleRegister(request, env);
      if (path === '/api/auth/login' && method === 'POST') return handleLogin(request, env);
      if (path === '/api/auth/me' && method === 'GET') return handleGetMe(request, env);

      // Profile
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

      // Subscriptions
      if (path === '/api/subscriptions/status' && method === 'GET') return handleGetSubscriptionStatus(request, env);
      if (path === '/api/subscriptions/webhook' && method === 'POST') return handleSubscriptionWebhook(request, env);

      // Notifications
      if (path === '/api/notifications' && method === 'GET') return handleGetNotifications(request, env);
      if (path === '/api/notifications/read' && method === 'POST') return handleMarkNotificationsRead(request, env);

      // Reviews
      if (path === '/api/reviews' && method === 'POST') return handleCreateReview(request, env);

      // Block
      if (path === '/api/block' && method === 'POST') return handleBlockUser(request, env);

      // Community Posts
      if (path === '/api/posts' && method === 'GET') return handleGetPosts(request, env);
      if (path === '/api/posts' && method === 'POST') return handleCreatePost(request, env);
      if (path.match(/^\/api\/posts\/(\d+)\/like$/) && method === 'POST') {
        const id = parseInt(path.split('/')[3]);
        return handleLikePost(request, env, id);
      }

      // Report
      if (path === '/api/report' && method === 'POST') return handleReport(request, env);

      // Upload Avatar
      if (path === '/api/upload-avatar' && method === 'POST') return handleUploadAvatar(request, env);

      // Delete Account
      if (path === '/api/account/delete' && method === 'POST') return handleDeleteAccount(request, env);

      // Checkout
      if (path === '/api/checkout/create' && method === 'POST') return handleCreateCheckout(request, env);

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
