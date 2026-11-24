# Security

What protects the group planning feature, and what it deliberately does not try to do.

## Who can do what

| Action | Who |
|---|---|
| Read the ritual guide, personal checklist | Anyone (no data leaves the phone) |
| Create a group | Admin only (`ADMIN_PASSWORD`). With `OPEN_CREATE=1`, anyone; they become that group's owner |
| See and change a group: add, edit, tick, soft-delete, restore items / types / steps | Members of that group |
| Delete forever (only things already soft-deleted), remove a member, make a new code | Admin (or the group's owner) |
| Delete a whole group | Admin, after typing the group's exact name |

Soft-deleted things stay visible (dashed) with who deleted them, so nothing disappears quietly.
Every change is written to the group's activity log with the member's name.

## How access works

- **Join code**: 9 characters from 31 (no 0/O/1/I/L), about 44 bits, made with `crypto.randomBytes`.
  It is the only thing needed to join, like Splid, so share it only with family.
- **Member token**: joining gives the device a random 256-bit token; every group request needs it.
  Only its SHA-256 is stored, so a leaked database copy doesn't give access.
  The group URL (`#g-…`) contains only an internal id, which is useless without a token.
- **Removing a member** deletes all their tokens at once. **Making a new code** stops new joins with the old one
  (people already in keep access; remove them if needed).
- **Admin**: password compared in constant time; sessions are random 256-bit tokens, stored hashed, valid 30 days,
  ended by logout.
- Tokens travel in headers (`Authorization`, `X-Admin-Token`), never in cookies, so cross-site request forgery
  doesn't apply, and never in URLs, so they don't end up in logs or browser history.
  Invite links put the code in the `#fragment`, which browsers don't send to the server.

## Abuse limits (per IP via Caddy's X-Forwarded-For, plus global caps)

| What | Limit |
|---|---|
| Wrong join codes | 15 per IP / 10 min, 300 for everyone / 10 min (plus a 300 ms delay each) |
| Wrong admin password | 5 per IP / 15 min, 30 for everyone / 15 min (plus 400 ms delay); every failure is logged as `[security]` |
| Joins | 30 per IP / hour |
| Any API call | 600 per IP / minute; writes 240 per device / minute |
| Size | request body 16 KB; text 200 chars; names 60; 1,500 entries, 60 types, 100 steps, 200 members per group |

## Web hardening

- **Content-Security-Policy** on the page: scripts are allowed only by the SHA-256 of the page's own inline
  scripts (computed at start-up), no `unsafe-inline`/`eval` for scripts; connections only to the same origin;
  fonts only from Google Fonts; `frame-ancestors 'none'`.
- All user text is escaped before it reaches the page; SQL is always parameterised.
- `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`,
  `Cross-Origin-Opener-Policy`, `Permissions-Policy`; HSTS comes from the edge Caddy.
- Only JSON bodies are accepted (`415` otherwise); unknown paths return 404.

## Server and supply chain

- No npm dependencies at all: Node's built-in `http` and `sqlite`.
- Container: runs as uid 1000, read-only filesystem except `/data`, all Linux capabilities dropped,
  `no-new-privileges`, memory and process limits, published only on `127.0.0.1`.
- Images are built by GitHub Actions and signed with cosign (keyless, GitHub OIDC). The Pi's
  `autoupdate.sh` refuses to run any image that isn't signed by this repo's `ci.yml` on `main`.
- Nightly SQLite backups (`VACUUM INTO`), optionally encrypted with `age`.

## Not covered

- Members are trusted family: anyone with the code can join and pick an existing name. That's on purpose
  (people change phones) and every action is logged, but it is not an identity check.
- The admin token lives in the browser's localStorage. The CSP makes script injection very hard, but log out
  on shared phones.
- There is no per-member permission inside a group beyond "member" and "admin".
