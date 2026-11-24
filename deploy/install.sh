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

# ---- port on this Pi (the container always listens on 8200 inside)
env_get() { grep -E "^$1=" "$DIR/.env" 2>/dev/null | tail -n 1 | cut -d= -f2- || true; }
port_busy() {  # is something other than our own container listening on 127.0.0.1:$1 / *:$1 ?
  local p=$1
  if docker ps --filter name='^leuva-lagna$' --format '{{.Ports}}' 2>/dev/null | grep -q ":$p->"; then return 1; fi
  if command -v ss >/dev/null 2>&1 && ss -Hltn "sport = :$p" 2>/dev/null | grep -q .; then return 0; fi
  timeout 1 bash -c "exec 3<>/dev/tcp/127.0.0.1/$p" 2>/dev/null   # something answers on it
}
PORT=$(env_get APP_PORT)
if [ -z "$PORT" ]; then
  PORT=8200
  if port_busy "$PORT"; then
    for p in $(seq 8201 8299); do if ! port_busy "$p"; then PORT=$p; break; fi; done
    echo ">> Port 8200 is already used on this Pi, so Leuva Patel Lagna will use $PORT."
  fi
  echo "APP_PORT=$PORT" >> "$DIR/.env"
elif port_busy "$PORT"; then
  echo ">> APP_PORT=$PORT in $DIR/.env is already used by something else:" >&2
  ss -Hltnp "sport = :$PORT" >&2 2>/dev/null || true
  echo "   Pick a free port, e.g. sudo sed -i 's/^APP_PORT=.*/APP_PORT=8210/' $DIR/.env, and run this again." >&2
  exit 1
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
  echo ">> Starting the app failed (see the message above: a signature problem says REFUSING TO DEPLOY," >&2
  echo "   anything else is Docker's own error)." >&2; exit 1
fi

echo ">> Waiting for the app..."
healthy=no
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then healthy=yes; break; fi
  sleep 2
done
if [ "$healthy" != yes ]; then
  echo ">> The app didn't answer on 127.0.0.1:$PORT. Logs:" >&2
  docker compose logs --tail 50 app >&2; exit 1
fi

systemctl daemon-reload
systemctl enable --now leuva-lagna-update.timer leuva-lagna-backup.timer

domain=$(grep -E '^PUBLIC_URL=' .env | tail -n 1 | cut -d= -f2- | sed -E 's#^https?://##; s#/.*$##')
cat <<EOF

>> Leuva Patel Lagna is running on 127.0.0.1:$PORT.

   HTTPS: add this block to $EDGE/Caddyfile (if it isn't there yet):

# Leuva Patel Lagna (priteshdrc/leuva-patel-lagna), app on 127.0.0.1:$PORT.
{\$LAGNA_DOMAIN} {
	encode zstd gzip
	import common_headers
	request_body {
		max_size 64KB
	}
	reverse_proxy 127.0.0.1:$PORT
}

   put LAGNA_DOMAIN=$domain in $EDGE/.env, then restart Caddy:
     cd $EDGE && sudo docker compose up -d --force-recreate

   Then open https://$domain, go to Settings > Admin login, and create the first group.

   Auto-update:  systemctl list-timers 'leuva-lagna-*'
   Update log:   journalctl -u leuva-lagna-update -n 50
   Backups:      $DIR/backups   (journalctl -u leuva-lagna-backup -n 50)
   App log:      docker compose -f $DIR/docker-compose.yml logs -f app
EOF
