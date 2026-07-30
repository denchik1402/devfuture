#!/usr/bin/env bash
# Backup bot JSON store (.data) — run via cron on the VPS.
# Example cron (daily 03:15): 15 3 * * * /var/www/devfuture/scripts/backup-bot-data.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/devfuture}"
DATA_DIR="${APP_DIR}/.data"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/devfuture}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_ROOT"
if [[ ! -d "$DATA_DIR" ]]; then
  echo "No .data at $DATA_DIR — nothing to backup"
  exit 0
fi

stamp="$(date +%Y%m%d-%H%M%S)"
out="${BACKUP_ROOT}/bot-data-${stamp}.tar.gz"
tar -czf "$out" -C "$APP_DIR" .data
echo "Wrote $out"

# prune old archives
find "$BACKUP_ROOT" -name 'bot-data-*.tar.gz' -mtime "+${KEEP_DAYS}" -delete 2>/dev/null || true
ls -lh "$BACKUP_ROOT" | tail -n 5
