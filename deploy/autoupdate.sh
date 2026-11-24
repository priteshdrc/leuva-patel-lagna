#!/usr/bin/env bash
# Pull the latest Leuva Patel Lagna image, check that this repo's CI built and
# signed it, and restart the app only if it changed. Run every minute by
# leuva-lagna-update.timer (see install.sh).
#
# The signature check (cosign, keyless): the image must carry a Sigstore
# signature whose certificate says it came from
#   https://github.com/priteshdrc/leuva-patel-lagna/.github/workflows/ci.yml
# on refs/heads/main (or a v* tag), issued to GitHub Actions' OIDC. Anything
# else (an image pushed by hand, by another repo or workflow, or unsigned) is
# refused: the app keeps running the image it has, and this exits 1 so the
# systemd unit shows failed.
set -euo pipefail
cd "$(dirname "$0")"

IMAGE=ghcr.io/priteshdrc/leuva-patel-lagna:latest
REPO=${IMAGE%:*}
ISSUER=https://token.actions.githubusercontent.com
IDENTITY='^https://github\.com/(?i:priteshdrc/leuva-patel-lagna)/\.github/workflows/ci\.yml@refs/(heads/main|tags/v[0-9][0-9A-Za-z.+-]*)$'
CONTAINER=leuva-lagna

env_get() { grep -E "^$1=" .env 2>/dev/null | tail -n 1 | cut -d= -f2- || true; }
# cosign comes from this image when it isn't installed on the Pi.
COSIGN_IMAGE=$(env_get COSIGN_IMAGE)
COSIGN_IMAGE=${COSIGN_IMAGE:-ghcr.io/sigstore/cosign/cosign:v2.4.1}

verify() {  # verify <image@digest>
  local args=(verify --certificate-oidc-issuer "$ISSUER" --certificate-identity-regexp "$IDENTITY" "$1")
  if command -v cosign >/dev/null 2>&1; then
    cosign "${args[@]}"
  else
    # A private image needs the GHCR login docker already has.
    local auth=()
    local cfg="${DOCKER_CONFIG:-${HOME:-/root}/.docker}/config.json"
    [ -f "$cfg" ] && auth=(-v "$cfg:/root/.docker/config.json:ro")
    docker run --rm "${auth[@]}" "$COSIGN_IMAGE" "${args[@]}"
  fi
}

# The image the app runs now (the last one that passed), if any.
running=$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || true)

docker compose pull -q app
pulled=$(docker image inspect --format '{{.Id}}' "$IMAGE")

if [ -n "$running" ] && [ "$pulled" = "$running" ]; then
  docker compose up -d --remove-orphans >/dev/null   # nothing new; make sure it's up
  exit 0
fi

digest=$(docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$IMAGE" \
  | grep -m 1 "^$REPO@sha256:" || true)
if [ -z "$digest" ] || ! verify "$digest" >/dev/null; then
  echo "REFUSING TO DEPLOY ${digest:-$pulled}: no valid signature from this repo's CI." >&2
  # Point :latest back at what's running, so a restart or reboot can't start
  # the unverified image.
  if [ -n "$running" ]; then docker tag "$running" "$IMAGE"; fi
  exit 1
fi

docker compose up -d --remove-orphans >/dev/null
echo "deployed new image: $digest (verified; was ${running:-none})"
docker image prune -f >/dev/null
