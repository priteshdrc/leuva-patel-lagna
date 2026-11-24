#!/usr/bin/env bash
# Nightly backup of the Leuva Patel Lagna database (groups, members, lists).
# Run by leuva-lagna-backup.timer, or by hand: sudo /opt/leuva-lagna/backup.sh
# Writes backups/lagna-YYYYmmdd-HHMMSS.db[.age] and keeps the newest BACKUP_KEEP.
# With AGE_RECIPIENT set in .env the copy is encrypted to that age public key.
set -euo pipefail
cd "$(dirname "$0")"
umask 077

env_get() { grep -E "^$1=" .env 2>/dev/null | tail -n 1 | cut -d= -f2- || true; }
KEEP=$(env_get BACKUP_KEEP); KEEP=${KEEP:-14}
AGE_RECIPIENT=$(env_get AGE_RECIPIENT)

stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
tmp="data/.backup-$stamp.db"
# A consistent copy taken by SQLite itself while the app keeps running.
docker compose exec -T app node -e "
  const {DatabaseSync}=require('node:sqlite');
  const db=new DatabaseSync('/data/lagna.db');
  db.exec(\"VACUUM INTO '/data/.backup-$stamp.db'\");"
[ -s "$tmp" ] || { echo "backup produced nothing" >&2; exit 1; }

if [ -n "$AGE_RECIPIENT" ]; then
  command -v age >/dev/null || { echo "AGE_RECIPIENT is set but 'age' is not installed (sudo apt install age)" >&2; rm -f "$tmp"; exit 1; }
  age -r "$AGE_RECIPIENT" -o "backups/lagna-$stamp.db.age" "$tmp"
  rm -f "$tmp"
  out="backups/lagna-$stamp.db.age"
else
  mv "$tmp" "backups/lagna-$stamp.db"
  out="backups/lagna-$stamp.db"
fi
echo "backup written: $out"

# keep the newest $KEEP
# names are lagna-YYYYmmdd-HHMMSS.db[.age], so a reverse name sort is newest first
mapfile -t old < <(find backups -maxdepth 1 -name 'lagna-*.db*' -printf '%f\n' | sort -r | tail -n +"$((KEEP + 1))" | sed 's#^#backups/#')
if [ "${#old[@]}" -gt 0 ]; then rm -f -- "${old[@]}"; fi
