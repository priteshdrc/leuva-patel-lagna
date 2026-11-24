# AI agents (MCP)

Leuva Patel Lagna is an [MCP](https://modelcontextprotocol.io) server, like Everything Life and Nifty Arena.
An AI app connected to it can read and update your ceremony groups:

- "What's still left for Deep's ring ceremony?" · "What is Ramesh bringing?"
- "Add 5 coconuts and a silver coin (₹1,100) to the sagai list, Deep will bring the coin."
- "Tick the rings and the chundadi." · "Rename 'Hall and hosting' to 'Wadi'."
- "Make a group for Riya's gol dhana on 14 Feb, bride's side." (returns the join code)
- "What does the kanku pagla ritual involve?"

Endpoint: `https://leuva-lagna.duckdns.org/mcp` (Streamable HTTP, stateless JSON).
Needs `PUBLIC_URL` in `/opt/leuva-lagna/.env`.

## Connect claude.ai or the Claude app (sign-in, no token)

1. claude.ai → Settings → Connectors → **Add custom connector**, URL `https://leuva-lagna.duckdns.org/mcp`.
2. You land on this site's **Connect** page. It shows which app and where it returns to.
   Pick the access, type the **admin password**, and choose **Allow**.
3. The connection appears in **Settings → AI agents (MCP)** on the site. Revoke it there.

Only apps that return to `claude.ai` / `claude.com` (or `localhost`) can register.
Change with `OAUTH_REDIRECT_HOSTS=claude.ai,claude.com` in `.env`; `OAUTH_ALLOW_LOOPBACK=0` turns off localhost.

## Claude Code (token)

Settings → **AI agents (MCP)** → **New token for Claude Code**. The token (`lgm_…`) and a ready command are
shown once:

```bash
claude mcp add --transport http --scope user leuva-lagna https://leuva-lagna.duckdns.org/mcp --header "Authorization: Bearer lgm_YOUR_TOKEN"
```

## Access levels

| Access | Tools |
|---|---|
| Read only | `list_groups`, `get_group`, `list_pending`, `get_activity`, `list_rituals`, `get_ritual_guide` |
| Read, add and edit | the above, plus `create_group`, `update_group`, `add_item`, `update_item` (tick, rename, assignee, cost), `delete_item` / `restore_item`, `add_type`, `rename_type`, `delete_type` / `restore_type`, `add_step`, `update_step`, `delete_step` / `restore_step` |
| Full | the above, plus `purge_deleted` (only things already deleted), `remove_member`, `rotate_code` |

Deleting through MCP is the same soft delete as on the phone: dashed and restorable.
Every change is in the group's activity log as **MCP: ‹token or app name›** and shows live on everyone's phone.
Groups, items, types, members and steps are named in plain words (`group: "deep"`, `item: "chundadi"`); an
unclear name returns the choices instead of guessing.

## Security

- Tokens and OAuth tokens are stored only as SHA-256 hashes. Personal tokens expire after 30/90/365 days (or never).
- OAuth 2.1: dynamic client registration limited to the allowed redirect hosts, PKCE S256 required, codes single-use
  and valid 5 minutes, access tokens 1 hour, refresh tokens rotate on every use and expire after 30 days unused.
  Re-using an old refresh token revokes the whole connection (a stolen-token signal).
- The consent page needs the admin password and shares its brute-force limits with the admin login.
- `tools/list` only lists what the access level allows; calls above it are refused.
- 300 MCP calls per minute per token; requests with a foreign `Origin` header are refused.
- Try it:
  ```bash
  curl -s https://leuva-lagna.duckdns.org/mcp -H "Authorization: Bearer lgm_YOUR_TOKEN" -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_groups","arguments":{}}}'
  ```
