#!/bin/bash
# Wake up the Neon (Replit PostgreSQL) endpoint and sync the schema.
# Neon auto-suspends inactive endpoints; the first connection wakes it up
# but drizzle-kit may time out before that completes — so we retry.
set -e
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
