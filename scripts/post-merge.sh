#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Neon (Replit's PostgreSQL) can auto-suspend its compute endpoint.
# The first connection wakes it up, but drizzle-kit may time out before
# that happens. Retry up to 3 times with a short back-off.
MAX_ATTEMPTS=3
ATTEMPT=0
until pnpm --filter db push; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "DB push failed after $MAX_ATTEMPTS attempts" >&2
    exit 1
  fi
  echo "DB push attempt $ATTEMPT failed — waiting 8s for endpoint to wake up..."
  sleep 8
done
