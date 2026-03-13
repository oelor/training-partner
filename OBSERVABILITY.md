# Training Partner — Observability & Monitoring

All tools below are **free tier / zero cost**.

---

## 1. Built-in API Analytics (Already Active)

The worker automatically tracks every API request to the `api_requests` table in D1:
- Endpoint, method, HTTP status, response time (ms)
- User agent, country (via CF-IPCountry header)
- Auto-cleanup: data older than 30 days is purged probabilistically

### Admin Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/admin/analytics?hours=24` | Admin JWT | Request counts, error rates, top endpoints, response times |
| `GET /api/admin/errors?hours=24&limit=50` | Admin JWT | Recent errors with stack traces, grouped by message |
| `GET /api/admin/stats` | Admin JWT | User/gym/message counts |
| `GET /api/milo/health` | X-Milo-Key | 24h activity snapshot for agent consumption |
| `GET /api/milo/metrics` | X-Milo-Key | Deep metrics: user growth, subscriptions, feedback |
| `POST /api/milo/metrics` | X-Milo-Key | Record custom metric `{ key, value }` |

### Error Tracking

Unhandled worker errors are logged to the `api_errors` table with:
- Error message and stack trace
- Request path, method, user agent
- Grouped by message in `/api/admin/errors` for pattern detection

---

## 2. Cloudflare Web Analytics (Frontend)

**Already scaffolded** in `src/app/layout.tsx`. Zero-cookie, privacy-first, free.

### Setup (2 minutes):
1. Go to [Cloudflare Dashboard → Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics)
2. Click "Add a site" → enter `trainingpartner.app`
3. Copy the beacon token (looks like `abc123def456...`)
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_CF_BEACON_TOKEN=<your-token>
   ```
5. Redeploy. Analytics appear in ~5 minutes.

**What you get:** Page views, unique visitors, top pages, referrers, countries, device types — all without cookies or GDPR banners.

---

## 3. Sentry Error Tracking (Optional, Recommended)

Free tier: 5,000 errors/month, 1 team member.

### Frontend Setup:
```bash
cd ~/training-partner
npx @sentry/wizard@latest -i nextjs
```

This auto-configures:
- `sentry.client.config.ts` — browser error capture
- `sentry.server.config.ts` — SSR error capture
- `next.config.js` — Sentry webpack plugin
- `sentry.edge.config.ts` — edge runtime

### Worker Setup:
Add DSN to wrangler.toml secrets:
```bash
wrangler secret put SENTRY_DSN
```

Then add to the worker's catch block (already has structured error logging — Sentry would replace the D1-based approach for richer alerting).

---

## 4. Uptime Monitoring

### Option A: UptimeRobot (Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free: 50 monitors, 5-min checks)
2. Add monitor: `https://training-partner-app.workers.dev/api/health`
3. Alert contact: your email
4. The health endpoint returns `503` if DB is down, triggering an alert

### Option B: OpenClaw Cron
Add to OpenClaw's cron configuration:
```json
{
  "name": "training-partner-health",
  "schedule": "*/5 * * * *",
  "command": "~/training-partner/scripts/monitor.sh"
}
```

The monitor script checks health, DB connectivity, response time, and pending reports.

---

## 5. Agent Monitoring Script

```bash
# Quick health check
./scripts/monitor.sh

# With Milo API key for full metrics
MILO_API_KEY=your-key ./scripts/monitor.sh

# Check local dev
./scripts/monitor.sh http://localhost:8787
```

### Setting Up MILO_API_KEY:
```bash
# Generate a key
openssl rand -hex 16

# Set in production
wrangler secret put MILO_API_KEY

# Set locally in wrangler.toml [env.dev.vars]
```

---

## 6. What's NOT Set Up Yet (Post-Launch)

| Tool | Purpose | Cost | When |
|------|---------|------|------|
| Sentry | Rich error alerting with source maps | Free (5K/mo) | After first deploy |
| Cloudflare Workers Analytics | Built-in request/CPU metrics | Free (included) | Automatic with Workers |
| R2 + Workers Analytics Engine | Long-term metric storage | Free tier | When D1 analytics table gets large |
| PostHog | Product analytics, feature flags | Free (1M events/mo) | When you need funnels/retention |
