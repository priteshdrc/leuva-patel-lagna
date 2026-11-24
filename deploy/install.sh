#!/usr/bin/env bash
# One-time (and repeatable) setup of Leuva Patel Lagna on the Orange Pi.
# Needs Docker with the compose plugin, and the shared edge Caddy in /opt/edge
# (the one Nifty Arena and Everything Life already use).
#   curl -fsSL https://raw.githubusercontent.com/priteshdrc/leuva-patel-lagna/main/deploy/install.sh -o install.sh
#   sudo bash install.sh
# Safe to run again: it never overwrites your .env or data.
set -euo pipefail

DIR=/opt/leuva-lagna
EDGE=/opt/edge
IMAGE=ghcr.io/priteshdrc/leuva-patel-lagna:latest
RAW=https://raw.githubusercontent.com/priteshdrc/leuva-patel-lagna/main/deploy
SRC=$(cd "$(dirname "$0")" && pwd)

if [ "$(id -u)" -ne 0 ]; then echo "Run with sudo: sudo bash $0" >&2; exit 1; fi
command -v docker >/dev/null || { echo "Docker is not installed." >&2; exit 1; }
docker compose version >/dev/null || { echo "The docker compose plugin is missing (apt install docker-compose-plugin)." >&2; exit 1; }

fetch() {  # copy from the repo checkout if present, otherwise download from GitHub
  if [ -f "$SRC/$1" ]; then cp "$SRC/$1" "$2"; else curl -fsSL "$RAW/$1" -o "$2"; fi
}

mkdir -p "$DIR/data" "$DIR/backups"
chown 1000:1000 "$DIR/data"      # the app container runs as uid 1000
chmod 700 "$DIR/data" "$DIR/backups"

fetch docker-compose.yml "$DIR/docker-compose.yml"
fetch autoupdate.sh "$DIR/autoupdate.sh"
fetch backup.sh "$DIR/backup.sh"
chmod +x "$DIR/autoupdate.sh" "$DIR/backup.sh"
for unit in leuva-lagna-update.service leuva-lagna-update.timer leuva-lagna-backup.service leuva-lagna-backup.timer; do
  fetch "$unit" "/etc/systemd/system/$unit"
done

# ---- settings: created once, never overwritten
if [ ! -f "$DIR/.env" ]; then
  fetch .env.example "$DIR/.env"
  password=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
  sed -i "s/^ADMIN_PASSWORD=CHANGE_ME$/ADMIN_PASSWORD=$password/" "$DIR/.env"
  chmod 600 "$DIR/.env"
  echo
  echo ">> Created $DIR/.env with a random admin password. Save it in your password manager:"
  echo "     $password"
  echo "   (You can read it again with: sudo grep ADMIN_PASSWORD $DIR/.env)"
fi
chmod 600 "$DIR/.env"
if grep -q '^ADMIN_PASSWORD=CHANGE_ME$' "$DIR/.env"; then
  echo ">> Set ADMIN_PASSWORD in $DIR/.env first (12+ characters)." >&2; exit 1
fi

# ---- image
if ! docker pull -q "$IMAGE" >/dev/null 2>&1; then
  echo
  echo ">> Can't pull $IMAGE."
  echo "   Make sure the CI workflow has run on main at least once (GitHub > Actions)."
  echo "   If the package is private, log in like for Everything Life:"
  echo "     echo <TOKEN> | sudo docker login ghcr.io -u <github-username> --password-stdin"
  exit 1
fi

cd "$DIR"
# First start goes through autoupdate.sh too, so only a CI-signed image ever runs.
if ! bash "$DIR/autoupdate.sh"; then
  echo ">> The image's signature didn't check out, so it wasn't started (see above)." >&2; exit 1
fi

echo ">> Waiting for the app..."
healthy=no
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8200/api/health >/dev/null 2>&1; then healthy=yes; break; fi
  sleep 2
done
if [ "$healthy" != yes ]; then
  echo ">> The app didn't answer on 127.0.0.1:8200. Logs:" >&2
  docker compose logs --tail 50 app >&2; exit 1
fi

systemctl daemon-reload
systemctl enable --now leuva-lagna-update.timer leuva-lagna-backup.timer

domain=$(grep -E '^PUBLIC_URL=' .env | tail -n 1 | cut -d= -f2- | sed -E 's#^https?://##; s#/.*$##')
cat <<EOF

>> Leuva Patel Lagna is running on 127.0.0.1:8200.

   HTTPS: add this site block to $EDGE/Caddyfile (see deploy/README.md), put
   LAGNA_DOMAIN=$domain in $EDGE/.env, then reload Caddy:
     cd $EDGE && sudo docker compose up -d && sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

   Then open https://$domain, go to Settings > Admin login, and create the first group.

   Auto-update:  systemctl list-timers 'leuva-lagna-*'
   Update log:   journalctl -u leuva-lagna-update -n 50
   Backups:      $DIR/backups   (journalctl -u leuva-lagna-backup -n 50)
   App log:      docker compose -f $DIR/docker-compose.yml logs -f app
EOF
