# Running it on the Orange Pi

Same pattern as Nifty Arena and Everything Life:

| Piece | Where |
|---|---|
| App container `leuva-lagna` | `/opt/leuva-lagna`, listens on **127.0.0.1:8200** only |
| HTTPS | the shared edge Caddy in `/opt/edge` |
| Updates | `leuva-lagna-update.timer` pulls `ghcr.io/priteshdrc/leuva-patel-lagna:latest` every minute and runs it **only if this repo's CI signed it** (cosign) |
| Backups | `leuva-lagna-backup.timer`, 02:45 nightly → `/opt/leuva-lagna/backups` |

## 1. Domain

On [duckdns.org](https://www.duckdns.org) add a subdomain, e.g. `pritesh-lagna`, with the Pi's
IP **103.209.67.111** (same as the other two). Check: `dig +short pritesh-lagna.duckdns.org`.

## 2. Install

Wait until GitHub Actions has run once on `main` (it publishes the image), then on the Pi:

```bash
curl -fsSL https://raw.githubusercontent.com/priteshdrc/leuva-patel-lagna/main/deploy/install.sh -o install.sh
sudo bash install.sh
```

The first run creates `/opt/leuva-lagna/.env` with a random **admin password** and prints it.
Save it in your password manager. Check `PUBLIC_URL` in that file, then run the script again.

## 3. HTTPS through the edge Caddy

Add this block to `/opt/edge/Caddyfile` (and to `deploy/edge/Caddyfile` in the Everything-Life repo,
which is the master copy):

```caddy
# Leuva Patel Lagna (priteshdrc/leuva-patel-lagna), app on 127.0.0.1:8200.
# The app sends its own CSP (with script hashes) and X-Frame-Options DENY.
{$LAGNA_DOMAIN} {
	encode zstd gzip
	import common_headers
	request_body {
		max_size 64KB
	}
	reverse_proxy 127.0.0.1:8200
}
```

Then:

```bash
echo 'LAGNA_DOMAIN=pritesh-lagna.duckdns.org' | sudo tee -a /opt/edge/.env
cd /opt/edge
sudo docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
sudo docker compose up -d     # re-reads .env
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
curl -s https://pritesh-lagna.duckdns.org/api/health
```

## 4. First use

1. Open the site on your phone → **સેટિંગ** → **એડમિન લૉગિન** with the admin password.
2. **ગ્રુપ** → **નવું ગ્રુપ બનાવો**: e.g. "દીપની સગાઈ", ritual સગાઈ, date, side.
3. Share the code with **WhatsApp પર આમંત્રણ**. Family members open the link, pick or type their name, and are in.

## Everyday commands

```bash
systemctl list-timers 'leuva-lagna-*'                 # update + backup timers
journalctl -u leuva-lagna-update -n 50                # what got deployed
sudo /opt/leuva-lagna/backup.sh                       # backup now
docker compose -f /opt/leuva-lagna/docker-compose.yml logs -f app   # app log, incl. [security] lines
sudo grep ADMIN_PASSWORD /opt/leuva-lagna/.env        # forgot the admin password
```

Changing the admin password: edit `ADMIN_PASSWORD` in `.env`, then
`cd /opt/leuva-lagna && sudo docker compose up -d`. Existing admin logins stay valid for up to 30 days;
to end them all at once, stop the app and run
`sudo sqlite3 /opt/leuva-lagna/data/lagna.db 'DELETE FROM admin_sessions'` (or ask me for a one-liner without sqlite3).

## Restore a backup

```bash
cd /opt/leuva-lagna
sudo docker compose stop app
# encrypted: age -d -i ~/lagna-backup.key backups/lagna-XXXX.db.age > /tmp/lagna.db
sudo cp backups/lagna-XXXXXXXX-XXXXXX.db data/lagna.db
sudo rm -f data/lagna.db-wal data/lagna.db-shm
sudo chown 1000:1000 data/lagna.db
sudo docker compose up -d app
```
