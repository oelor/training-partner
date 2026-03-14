#!/bin/bash
# Training Partner — Full Deployment Script
# Run after `npx wrangler login` to deploy everything.
#
# Usage: bash scripts/deploy.sh

set -e

echo "🚀 Training Partner Deployment"
echo "================================"

# Check wrangler auth
echo "Checking wrangler authentication..."
if ! npx wrangler whoami 2>/dev/null | grep -q "Account"; then
  echo "❌ Wrangler not authenticated. Run: npx wrangler login"
  exit 1
fi
echo "✅ Wrangler authenticated"

# Step 1: Generate and set JWT_SECRET
echo ""
echo "Step 1: Setting JWT_SECRET..."
JWT_SECRET=$(openssl rand -hex 32)
echo "$JWT_SECRET" | npx wrangler secret put JWT_SECRET 2>/dev/null
echo "✅ JWT_SECRET set as production secret"

# Step 2: Run D1 migrations
echo ""
echo "Step 2: Running D1 migrations..."
npx wrangler d1 migrations apply training-partner --remote
echo "✅ D1 migrations applied"

# Step 3: Deploy Worker
echo ""
echo "Step 3: Deploying Cloudflare Worker..."
DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract workers.dev URL
WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.workers\.dev' | head -1)
if [ -z "$WORKER_URL" ]; then
  # Try alternate pattern
  WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://training-partner-app\.[a-zA-Z0-9-]+\.workers\.dev' | head -1)
fi

if [ -z "$WORKER_URL" ]; then
  echo "⚠️  Could not auto-detect Workers.dev URL from deploy output."
  echo "    Check the output above and set NEXT_PUBLIC_API_URL manually on Vercel."
  echo "    Run: npx vercel env add NEXT_PUBLIC_API_URL"
  exit 0
fi

echo "✅ Worker deployed at: $WORKER_URL"

# Step 4: Test Worker health
echo ""
echo "Step 4: Testing Worker health..."
HEALTH=$(curl -s "$WORKER_URL/api/health" 2>/dev/null)
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo "✅ Worker health check passed"
else
  echo "⚠️  Health check response: $HEALTH"
  echo "    Worker may still be starting up. Try again in a few seconds."
fi

# Step 5: Update Vercel env var
echo ""
echo "Step 5: Updating Vercel NEXT_PUBLIC_API_URL..."
# Remove existing env var and add new one
npx vercel env rm NEXT_PUBLIC_API_URL production -y 2>/dev/null || true
echo "$WORKER_URL" | npx vercel env add NEXT_PUBLIC_API_URL production
echo "✅ Vercel NEXT_PUBLIC_API_URL set to $WORKER_URL"

# Step 6: Redeploy frontend with new API URL
echo ""
echo "Step 6: Redeploying frontend to Vercel..."
npx vercel --prod --yes
echo "✅ Frontend redeployed"

echo ""
echo "================================"
echo "🎉 Deployment complete!"
echo ""
echo "  Frontend: https://trainingpartner.app"
echo "  API:      $WORKER_URL"
echo ""
echo "Next steps:"
echo "  1. Visit https://trainingpartner.app/auth/signup to create a test account"
echo "  2. Set up Stripe webhook: wrangler secret put STRIPE_SECRET_KEY"
echo "  3. Set up Resend for emails: wrangler secret put RESEND_API_KEY"
echo "================================"
