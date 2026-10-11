#!/usr/bin/env bash
# Deploy script for the VPS. Run from the project root on the server.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/devfuture}"
APP_NAME="${APP_NAME:-devfuture}"
LOCK_FILE="${DEPLOY_LOCK:-/var/lock/devfuture-deploy.lock}"

# Tiny VPS: avoid OOM during npm/next (swap helps, but cap heap)
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

mkdir -p "$(dirname "$LOCK_FILE")"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "ERROR: another deploy is already running (lock $LOCK_FILE)"
  exit 1
fi

cd "$APP_DIR"

echo "==> git pull"
git fetch origin
git reset --hard origin/main

echo "==> ensure .data survives deploys (bot leads/users)"
mkdir -p "$APP_DIR/.data"
chmod 700 "$APP_DIR/.data" || true
chmod +x "$APP_DIR/scripts/backup-bot-data.sh" || true
mkdir -p /var/backups/devfuture || true

echo "==> npm ci"
if ! npm ci --no-audit --no-fund; then
  echo "==> npm ci failed — clean install"
  rm -rf node_modules
  npm ci --no-audit --no-fund
fi

# Concurrent builds corrupt .next (ENOENT *.nft.json during collect-build-traces)
echo "==> clean .next"
rm -rf .next

echo "==> build"
npm run build

echo "==> restart pm2"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" -- start
  pm2 save
fi

if [ -f .env.local ] && grep -q '^TELEGRAM_BOT_TOKEN=.\+' .env.local 2>/dev/null; then
  if grep -q '^TELEGRAM_WEBHOOK_SECRET=.\+' .env.local 2>/dev/null; then
    echo "==> refresh telegram webhook"
    npm run tg:set-webhook || echo "warn: set-webhook failed (check Telegram API access)"
  else
    echo "warn: TELEGRAM_WEBHOOK_SECRET missing — skip set-webhook"
  fi
  if grep -q '^TELEGRAM_MODE=polling' .env.local 2>/dev/null; then
    echo "==> restart telegram poller"
    if pm2 describe "$APP_NAME-tg-poll" >/dev/null 2>&1; then
      pm2 restart "$APP_NAME-tg-poll" --update-env
    else
      pm2 start scripts/telegram-poll.js --name "$APP_NAME-tg-poll" --cwd "$APP_DIR"
      pm2 save
    fi
  fi
  echo "==> telegram menu button (Mini App)"
  npm run tg:menu-button || echo "warn: menu-button failed"
fi

echo "==> IndexNow ping (optional INDEXNOW_KEY)"
npm run seo:indexnow || echo "warn: indexnow skipped/failed"

echo "==> done"
pm2 status "$APP_NAME"
