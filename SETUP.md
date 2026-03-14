# Training Partner — Setup & Deployment Guide

## Architecture

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + React 18, Tailwind CSS |
| Backend API | Cloudflare Worker (69 endpoints) |
| Database | Cloudflare D1 (SQLite) |
| Auth | JWT + Google OAuth, email/password |
| Payments | Stripe (subscriptions) |
| Email | Resend (transactional) |
| Hosting | Vercel (frontend) + Cloudflare Workers (API) |

## Production URLs

| Service | URL |
|---------|-----|
| API (Worker) | `https://training-partner-app.elor-orry.workers.dev` |
| Frontend | `https://training-partner.vercel.app` (after Vercel deploy) |
| Health Check | `GET /api/health` |
| Admin Panel | `/admin` (requires admin role) |

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the API (Cloudflare Worker + D1)
npx wrangler dev --local

# 3. In a separate terminal, start the frontend
npm run dev

# 4. Open http://localhost:3000
```

Local env vars are in `.env.local` (frontend) and `wrangler.toml [env.dev.vars]` (worker).

## Environment Variables

### Frontend (Vercel / .env.local)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Worker API URL |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL (for metadata/redirects) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics (optional) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA (optional) |

### Worker (wrangler.toml vars + secrets)

**Vars** (in `wrangler.toml [vars]`):
| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Must match NEXT_PUBLIC_GOOGLE_CLIENT_ID |
| `STRIPE_PRICE_PREMIUM_ATHLETE` | Stripe price ID for $9.99/mo plan |
| `STRIPE_PRICE_PREMIUM_GYM` | Stripe price ID for $19.99/mo plan |

**Secrets** (set via `wrangler secret put <NAME>`):
| Secret | Description |
|--------|-------------|
| `JWT_SECRET` | 256-bit hex string for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |

## Deployment

### Deploy Worker (API)
```bash
npx wrangler deploy --env=""
```

### Deploy Frontend (Vercel)
```bash
vercel --prod
```

Or push to `main` branch — Vercel auto-deploys on push.

### Run D1 Migrations
```bash
npx wrangler d1 migrations apply training-partner
```

## Monitoring

See [OBSERVABILITY.md](./OBSERVABILITY.md) for the full monitoring setup.

Quick health check:
```bash
curl https://training-partner-app.elor-orry.workers.dev/api/health
```

## Design System

| Token | Value |
|-------|-------|
| Primary | `#FF4D00` (Fierce Orange) |
| Background | `#0D0D0D` (Deep Black) |
| Surface | `#1F1F1F` (Card BG) |
| Accent | `#00FF88` (Electric Green) |
| Heading Font | Bebas Neue |
| Body Font | DM Sans |

## Third-Party Setup

### Stripe
1. Create account at stripe.com
2. Add 2 products: Premium Athlete ($9.99/mo), Premium Gym ($19.99/mo)
3. Set secret key + webhook secret via `wrangler secret put`
4. Add webhook endpoint: `<worker-url>/api/webhooks/stripe`
5. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Resend
1. Create account at resend.com
2. Generate API key
3. Set via `wrangler secret put RESEND_API_KEY`

### Google OAuth
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized origins: production URL + `http://localhost:3000`
4. Set `GOOGLE_CLIENT_ID` in `wrangler.toml` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel env vars
