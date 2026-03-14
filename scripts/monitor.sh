#!/bin/bash
# Training Partner — Health & Metrics Monitor
# Run as an OpenClaw cron job or manually to check production health.
#
# Usage:
#   ./scripts/monitor.sh                         # Check production
#   ./scripts/monitor.sh http://localhost:8787    # Check local dev
#   MILO_API_KEY=xxx ./scripts/monitor.sh        # With API key auth
#
# Exit codes:
#   0 = healthy
#   1 = unhealthy or unreachable

set -euo pipefail

BASE_URL="${1:-https://training-partner-app.workers.dev}"
MILO_KEY="${MILO_API_KEY:-}"
AUTH_HEADER=""
if [ -n "$MILO_KEY" ]; then
  AUTH_HEADER="-H X-Milo-Key:${MILO_KEY}"
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━ Training Partner Monitor ━━━"
echo "Target: $BASE_URL"
echo "Time:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

# 1. Basic health check
echo "▸ Health Check..."
HEALTH=$(curl -s -w "\n%{http_code}" --max-time 10 "$BASE_URL/api/health" 2>/dev/null || echo -e "\n000")
HTTP_CODE=$(echo "$HEALTH" | tail -1)
BODY=$(echo "$HEALTH" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  DB_STATUS=$(echo "$BODY" | grep -o '"db_connected":true' || echo "")
  if [ -n "$DB_STATUS" ]; then
    echo -e "  ${GREEN}✓ API healthy, DB connected${NC}"
  else
    echo -e "  ${YELLOW}⚠ API up but DB disconnected${NC}"
  fi
else
  echo -e "  ${RED}✗ UNHEALTHY (HTTP $HTTP_CODE)${NC}"
  echo "  Response: $BODY"
  exit 1
fi

# 2. Milo metrics (if API key available)
if [ -n "$MILO_KEY" ]; then
  echo ""
  echo "▸ Platform Metrics..."
  METRICS=$(curl -s --max-time 10 $AUTH_HEADER "$BASE_URL/api/milo/health" 2>/dev/null || echo '{}')

  USERS=$(echo "$METRICS" | grep -o '"total_users":[0-9]*' | grep -o '[0-9]*' || echo "?")
  MSGS=$(echo "$METRICS" | grep -o '"messages_24h":[0-9]*' | grep -o '[0-9]*' || echo "?")
  BOOKINGS=$(echo "$METRICS" | grep -o '"bookings_24h":[0-9]*' | grep -o '[0-9]*' || echo "?")
  REPORTS=$(echo "$METRICS" | grep -o '"pending_reports":[0-9]*' | grep -o '[0-9]*' || echo "?")
  FEEDBACK=$(echo "$METRICS" | grep -o '"new_feedback":[0-9]*' | grep -o '[0-9]*' || echo "?")
  POSTS=$(echo "$METRICS" | grep -o '"posts_24h":[0-9]*' | grep -o '[0-9]*' || echo "?")

  echo "  Users: $USERS | Messages(24h): $MSGS | Bookings(24h): $BOOKINGS"
  echo "  Posts(24h): $POSTS | Pending Reports: $REPORTS | New Feedback: $FEEDBACK"

  # Alert on pending items
  if [ "$REPORTS" != "?" ] && [ "$REPORTS" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ $REPORTS pending report(s) need review${NC}"
  fi
  if [ "$FEEDBACK" != "?" ] && [ "$FEEDBACK" -gt 5 ]; then
    echo -e "  ${YELLOW}⚠ $FEEDBACK unread feedback items${NC}"
  fi
fi

# 3. Response time check
echo ""
echo "▸ Response Time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$BASE_URL/api/health" 2>/dev/null || echo "timeout")
if [ "$RESPONSE_TIME" != "timeout" ]; then
  # Convert to ms
  MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null | cut -d. -f1 || echo "?")
  if [ "$MS" != "?" ] && [ "$MS" -lt 500 ]; then
    echo -e "  ${GREEN}✓ ${MS}ms (good)${NC}"
  elif [ "$MS" != "?" ] && [ "$MS" -lt 2000 ]; then
    echo -e "  ${YELLOW}⚠ ${MS}ms (slow)${NC}"
  else
    echo -e "  ${RED}✗ ${MS}ms (critical)${NC}"
  fi
else
  echo -e "  ${RED}✗ Timeout${NC}"
fi

echo ""
echo "━━━ Monitor Complete ━━━"
exit 0
