#!/usr/bin/env bash
#
# Restores a backup produced by backup.sh.
#
# Usage:
#   ./scripts/restore.sh backups/2026-09-07_08-00-00
#
# WARNING: this overwrites the current database contents. Double-check the
# backup folder before running this against a live system.

set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${1:-}"
if [ -z "$BACKUP_DIR" ] || [ ! -f "$BACKUP_DIR/database.sql" ]; then
  echo "Usage: $0 <backup-directory-containing-database.sql>"
  exit 1
fi

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
DB_NAME="${DB_NAME:-ims_db}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-Admin@123}"

read -r -p "This will overwrite the current '$DB_NAME' database. Continue? [y/N] " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

if command -v docker >/dev/null 2>&1 && docker compose ps mysql 2>/dev/null | grep -q "Up\|running"; then
  echo "==> Restoring database into running docker compose stack"
  docker compose exec -T mysql \
    mysql -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" \
    < "$BACKUP_DIR/database.sql"

  if [ -f "$BACKUP_DIR/uploads.tar.gz" ]; then
    docker run --rm \
      -v "$(basename "$(pwd)")_backend_uploads:/data" \
      -v "$(cd "$BACKUP_DIR" && pwd)":/backup \
      alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/uploads.tar.gz -C ."
  fi
else
  echo "==> Restoring database via local mysql client"
  mysql -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_DIR/database.sql"

  if [ -f "$BACKUP_DIR/uploads.tar.gz" ]; then
    UPLOAD_DIR="${UPLOAD_DIR:-backend/uploads}"
    mkdir -p "$UPLOAD_DIR"
    tar xzf "$BACKUP_DIR/uploads.tar.gz" -C "$UPLOAD_DIR"
  fi
fi

echo "==> Restore complete. Restart the backend so caches don't serve stale data:"
echo "    docker compose restart backend   # or: re-run mvn spring-boot:run"
