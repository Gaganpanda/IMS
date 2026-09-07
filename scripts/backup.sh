#!/usr/bin/env bash
#
# Backs up everything this app cannot regenerate on its own:
#   - the MySQL database (all items, trials, IPR, notifications, users, etc.)
#   - uploaded files (backend/uploads or the `backend_uploads` Docker volume)
#
# Intended for an offline/air-gapped deployment with no cloud backup service
# behind it — this is the whole safety net, so run it on a schedule (e.g. a
# nightly cron job) and keep copies off the machine the app runs on (a USB
# drive, a second machine on the same LAN, etc.). Redis is NOT backed up on
# purpose: it only holds disposable cache entries that rebuild themselves
# from MySQL within minutes of a restart.
#
# Usage:
#   ./scripts/backup.sh                # writes to ./backups/<timestamp>/
#   ./scripts/backup.sh /path/to/dir   # writes there instead
#
# Works whether the app is running via `docker compose` or as plain local
# processes (mysqldump against a locally installed MySQL) — it detects
# which one is active.

set -euo pipefail
cd "$(dirname "$0")/.."

# Load DB name/credentials the same way the app does, without requiring
# them to already be exported in the shell.
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
DB_NAME="${DB_NAME:-ims_db}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-Admin@123}"

OUT_DIR="${1:-backups}/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$OUT_DIR"

echo "==> Backing up to $OUT_DIR"

if command -v docker >/dev/null 2>&1 && docker compose ps mysql 2>/dev/null | grep -q "Up\|running"; then
  echo "==> Detected running docker compose stack — dumping via container"
  docker compose exec -T mysql \
    mysqldump -u"$DB_USERNAME" -p"$DB_PASSWORD" --single-transaction --routines --triggers "$DB_NAME" \
    > "$OUT_DIR/database.sql"

  # backend_uploads is a named volume when running under compose — copy it
  # out via a throwaway container rather than assuming a host path exists.
  docker run --rm \
    -v "$(basename "$(pwd)")_backend_uploads:/data:ro" \
    -v "$(cd "$OUT_DIR" && pwd)":/backup \
    alpine sh -c "cd /data && tar czf /backup/uploads.tar.gz ." \
    2>/dev/null || echo "    (no backend_uploads volume found — skipping uploads)"
else
  echo "==> No running docker compose stack detected — dumping via local mysqldump"
  mysqldump -u"$DB_USERNAME" -p"$DB_PASSWORD" --single-transaction --routines --triggers "$DB_NAME" \
    > "$OUT_DIR/database.sql"

  UPLOAD_DIR="${UPLOAD_DIR:-backend/uploads}"
  if [ -d "$UPLOAD_DIR" ]; then
    tar czf "$OUT_DIR/uploads.tar.gz" -C "$UPLOAD_DIR" .
  else
    echo "    ($UPLOAD_DIR not found — skipping uploads)"
  fi
fi

echo "==> Done:"
ls -lh "$OUT_DIR"
echo ""
echo "Restore with: ./scripts/restore.sh $OUT_DIR"
