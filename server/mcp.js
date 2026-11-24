"use strict";
/*
 * MCP server (Streamable HTTP, stateless JSON) + OAuth 2.1 for apps that sign in themselves
 * (claude.ai, the Claude apps). Same shape as Everything Life's /mcp.
 *
 *  POST /mcp                      JSON-RPC: initialize, ping, tools/list, tools/call, resources/list, prompts/list
 *  /.well-known/oauth-*           protected-resource and authorization-server metadata
 *  /oauth/register|authorize|token|revoke   dynamic registration, consent (admin password), PKCE S256, refresh rotation
 *  /api/admin/mcp[/revoke]        personal tokens, managed by the admin in Settings
 *
 * Every token has an access level: read < add < full. Only hashes are stored. Every change made through
 * MCP is written to the group's activity log as "via MCP: <token name>" and shows live on everyone's phone.
 */
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const LEVEL = { read: 1, add: 2, full: 3 };
const ACCESS_HOURS = 1, REFRESH_DAYS = 30, CODE_MINUTES = 5;

module.exports = function makeMcp(ctx) {
  const { q, S, tx, now, sha, rid, token, clean, isDate, normCode, hit, HttpError, bad, send, readJson,
    CFG, TEMPLATES, ADMIN_ENABLED, isAdmin, checkAdminPassword, createGroup, opMember, opAdmin, bump, state } = ctx;

  const PUBLIC = (process.env.PUBLIC_URL || "").replace(/\/+$/, "");
  const REDIRECT_HOSTS = (process.env.OAUTH_REDIRECT_HOSTS || "claude.ai,claude.com").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
  const ALLOW_LOOPBACK = process.env.OAUTH_ALLOW_LOOPBACK !== "0";

  /* ---------------- small helpers ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const b64url = (buf) => Buffer.from(buf).toString("base64url");
  const s256 = (v) => b64url(require("node:crypto").createHash("sha256").update(v).digest());
  function needPublic() { if (!PUBLIC) throw new HttpError(503, "set_PUBLIC_URL"); }
  function readForm(req, max = 16 * 1024) {
    return new Promise((resolve, reject) => {
      const ct = String(req.headers["content-type"] || "");
      let size = 0; const chunks = [];
      req.on("data", (c) => { size += c.length; if (size > max) { reject(new HttpError(413, "too_large")); req.destroy(); } else chunks.push(c); });
      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        try {
          if (ct.startsWith("application/json")) { const v = JSON.parse(raw || "{}"); if (!v || typeof v !== "object" || Array.isArray(v)) throw 0; return resolve(v); }
          if (ct.startsWith("application/x-www-form-urlencoded")) return resolve(Object.fromEntries(new URLSearchParams(raw)));
          reject(new HttpError(415, "unsupported_content_type"));
        } catch { reject(bad("bad_body")); }
      });
      req.on("error", reject);
    });
  }
  function readRpc(req, max = 64 * 1024) { // JSON object or batch array
    return new Promise((resolve, reject) => {
      if (!String(req.headers["content-type"] || "").startsWith("application/json")) return reject(new HttpError(415, "json_only"));
      let size = 0; const chunks = [];
      req.on("data", (c) => { size += c.length; if (size > max) { reject(new HttpError(413, "too_large")); req.destroy(); } else chunks.push(c); });
      req.on("end", () => { try { const v = JSON.parse(Buffer.concat(chunks).toString("utf8")); if (!v || typeof v !== "object") throw 0; resolve(v); } catch { reject(bad("bad_json")); } });
      req.on("error", reject);
    });
  }
  function oauthErr(res, status, error, desc) { send(res, status, { error, error_description: desc }); }
  function redirectOk(uri) {
    let u; try { u = new URL(uri); } catch { return false; }
    if (u.hash || u.username || u.password) return false;
    if (u.protocol === "https:" && REDIRECT_HOSTS.includes(u.hostname.toLowerCase())) return true;
    return ALLOW_LOOPBACK && u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  }

  /* ---------------- token storage ---------------- */
  const T = {
    byHash: q("SELECT * FROM mcp_tokens WHERE hash = ?"),
    touch: q("UPDATE mcp_tokens SET last_used = ? WHERE id = ?"),
  };
  function authMcp(req) {
    const h = req.headers.authorization || "";
    const t = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
    if (!t || t.length > 120) return null;
    const row = T.byHash.get(sha(t));
    if (!row || (row.expires_at && row.expires_at < now())) return null;
    if (!row.last_used || now() - row.last_used > 60_000) T.touch.run(now(), row.id);
    return row;
  }
  function newConnection({ name, kind, access, days, clientId }) {
    const id = rid(), t = (kind === "oauth" ? "lga_" : "lgm_") + token();
    const r = kind === "oauth" ? "lgr_" + token() : null;
    const exp = kind === "oauth" ? now() + ACCESS_HOURS * 3600_000 : days ? now() + days * 86400_000 : null;
    q("INSERT INTO mcp_tokens (id, name, kind, access, hash, expires_at, refresh_hash, refresh_expires, client_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(id, name, kind, access, sha(t), exp, r ? sha(r) : null, r ? now() + REFRESH_DAYS * 86400_000 : null, clientId || null, now());
    return { id, token: t, refresh: r };
  }

  /* ---------------- OAuth ---------------- */
  function protectedResource() {
    return { resource: PUBLIC + "/mcp", authorization_servers: [PUBLIC], scopes_supported: ["read", "add", "full"], bearer_methods_supported: ["header"], resource_name: "Leuva Patel Lagna" };
  }
  function authServer() {
    return {
      issuer: PUBLIC, authorization_endpoint: PUBLIC + "/oauth/authorize", token_endpoint: PUBLIC + "/oauth/token",
      registration_endpoint: PUBLIC + "/oauth/register", revocation_endpoint: PUBLIC + "/oauth/revoke",
      response_types_supported: ["code"], grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"], token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"], scopes_supported: ["read", "add", "full"],
    };
  }
  function clientFor(p) {
    const c = typeof p.client_id === "string" && p.client_id.length < 40 ? q("SELECT * FROM oauth_clients WHERE id = ?").get(p.client_id) : null;
    if (!c) return { error: "Unknown app (client_id). Add the connector again." };
    const uris = JSON.parse(c.redirect_uris);
    if (!uris.includes(p.redirect_uri)) return { error: "This return address isn't registered for the app." };
    if (p.response_type !== "code") return { error: "Only response_type=code is supported." };
    if (p.code_challenge_method !== "S256" || typeof p.code_challenge !== "string" || !/^[A-Za-z0-9_-]{43,128}$/.test(p.code_challenge)) return { error: "PKCE (S256) is required." };
    return { client: c };
  }
  function consentPage(res, p, client, message, status = 200) {
    const host = new URL(p.redirect_uri).host;
    const hidden = ["client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method", "response_type", "scope", "resource"]
      .map((k) => (typeof p[k] === "string" ? `<input type="hidden" name="${k}" value="${esc(p[k])}">` : "")).join("");
    const want = ["read", "add", "full"].includes(p.scope) ? p.scope : "read";
    const opt = (v, gu, en) => `<label class="opt"><input type="radio" name="access" value="${v}"${v === want ? " checked" : ""}><span><b>${gu}</b> · ${en}</span></label>`;
    const html = `<!doctype html><html lang="gu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect · Leuva Patel Lagna</title>
<style>:root{color-scheme:light dark;--k:#A8102B;--bg:#FFFDFB;--fg:#2A1418;--mu:#6E5357;--line:#EAD7D0}
@media(prefers-color-scheme:dark){:root{--k:#E04B62;--bg:#170D0F;--fg:#F6ECE9;--mu:#C2A9AD;--line:#3D2A2E}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.5 system-ui,"Noto Sans Gujarati",sans-serif;padding:24px 16px}
main{max-width:460px;margin:0 auto;display:flex;flex-direction:column;gap:14px}h1{color:var(--k);font-size:1.4rem;margin:0}
.box{border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}.mu{color:var(--mu);font-size:.9rem;margin:0}
.opt{display:flex;gap:10px;align-items:flex-start}.opt input{margin-top:5px;width:20px;height:20px}
input[type=password]{font:inherit;padding:12px;border:2px solid var(--line);border-radius:12px;background:transparent;color:inherit}
.row{display:grid;grid-template-columns:1fr 1fr;gap:8px}button{font:inherit;font-weight:700;min-height:52px;border-radius:12px;border:0;cursor:pointer}
.yes{background:var(--k);color:#fff}.no{background:transparent;color:var(--fg);border:2px solid var(--line)}.err{color:var(--k);font-weight:600;margin:0}</style></head>
<body><main><h1>Leuva Patel Lagna</h1>
<div class="box"><p style="margin:0"><b>${esc(client.name)}</b> તમારાં ગ્રુપ જોવા / બદલવા માંગે છે.<br><span class="mu">wants to use your ceremony groups.</span></p>
<p class="mu">પાછું જશે / returns to: <b>${esc(host)}</b></p></div>
<form method="post" action="/oauth/authorize" class="box">${hidden}
<span><b>કેટલી છૂટ? · Access</b></span>
${opt("read", "ફક્ત જોવું", "Read only")}${opt("add", "જોવું, ઉમેરવું, બદલવું", "Read, add and edit (delete is restorable)")}${opt("full", "બધું", "Full: also delete forever, remove members, new code")}
<label for="pw"><b>એડમિન પાસવર્ડ · Admin password</b></label><input id="pw" type="password" name="password" autocomplete="current-password" required maxlength="200">
${message ? `<p class="err">${esc(message)}</p>` : ""}
<div class="row"><button class="yes" name="decision" value="allow">મંજૂરી આપો · Allow</button><button class="no" name="decision" value="deny" formnovalidate>ના · Deny</button></div>
</form><p class="mu">You can disconnect it any time in Settings → AI agents.</p></main></body></html>`;
    const origin = new URL(p.redirect_uri).origin;
    res.writeHead(status, {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
      // form-action covers the redirect back to the app after the form posts
      "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; form-action 'self' ${origin}; frame-ancestors 'none'; base-uri 'none'`,
    });
    res.end(html);
  }
  function errorPage(res, msg) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'", "X-Frame-Options": "DENY", "Cache-Control": "no-store" });
    res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Can't connect</title><body style="font:17px system-ui;padding:24px;max-width:460px;margin:auto"><h1 style="font-size:1.3rem">Can't connect</h1><p>${esc(msg)}</p></body>`);
  }
  function redirect(res, uri, params) {
    const u = new URL(uri); for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, v);
    res.writeHead(302, { Location: u.toString(), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" }); res.end();
  }

  async function oauth(req, res, p, m, ip) {
    if (p === "/oauth/register" && m === "POST") {
      needPublic();
      if (!hit("oreg:" + ip, 20, 3600_000)) return oauthErr(res, 429, "slow_down", "Too many registrations");
      if (q("SELECT COUNT(*) n FROM oauth_clients").get().n >= 500) q("DELETE FROM oauth_clients WHERE id IN (SELECT id FROM oauth_clients ORDER BY created_at LIMIT 100)");
      const b = await readForm(req);
      const uris = Array.isArray(b.redirect_uris) ? b.redirect_uris.filter((u) => typeof u === "string" && u.length < 500).slice(0, 5) : [];
      if (!uris.length || !uris.every(redirectOk)) return oauthErr(res, 400, "invalid_redirect_uri", `Redirects must go to ${REDIRECT_HOSTS.join(", ")} over https${ALLOW_LOOPBACK ? " (or localhost)" : ""}.`);
      const name = clean(typeof b.client_name === "string" ? b.client_name : "", 80) || "MCP app";
      const id = rid(16);
      q("INSERT INTO oauth_clients (id, name, redirect_uris, created_at) VALUES (?,?,?,?)").run(id, name, JSON.stringify(uris), now());
      return send(res, 201, { client_id: id, client_name: name, redirect_uris: uris, token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"] });
    }
    if (p === "/oauth/authorize" && m === "GET") {
      needPublic();
      if (!ADMIN_ENABLED) return errorPage(res, "Admin isn't set up on this server (ADMIN_PASSWORD).");
      const prm = Object.fromEntries(new URL(req.url, "http://x").searchParams);
      const c = clientFor(prm); if (c.error) return errorPage(res, c.error);
      return consentPage(res, prm, c.client);
    }
    if (p === "/oauth/authorize" && m === "POST") {
      needPublic();
      const prm = await readForm(req);
      const c = clientFor(prm); if (c.error) return errorPage(res, c.error);
      if (prm.decision !== "allow") return redirect(res, prm.redirect_uri, { error: "access_denied", state: prm.state, iss: PUBLIC });
      try { await checkAdminPassword(prm.password, ip); }
      catch (e) { return consentPage(res, prm, c.client, e.code === "too_many_attempts" ? "ઘણા પ્રયત્ન થયા, ૧૫ મિનિટ પછી ફરી કરો. · Too many tries, wait 15 minutes." : "પાસવર્ડ ખોટો છે. · Wrong password.", e.status || 401); }
      const access = ["read", "add", "full"].includes(prm.access) ? prm.access : "read";
      const code = token();
      q("DELETE FROM oauth_codes WHERE expires_at < ?").run(now());
      q("INSERT INTO oauth_codes (hash, client_id, redirect_uri, challenge, access, expires_at) VALUES (?,?,?,?,?,?)").run(sha(code), c.client.id, prm.redirect_uri, prm.code_challenge, access, now() + CODE_MINUTES * 60_000);
      console.log(`[security] MCP app "${c.client.name}" allowed (${access}) from ${ip}`);
      return redirect(res, prm.redirect_uri, { code, state: prm.state, iss: PUBLIC });
    }
    if (p === "/oauth/token" && m === "POST") {
      needPublic();
      if (!hit("otok:" + ip, 60, 60_000)) return oauthErr(res, 429, "slow_down", "Too many requests");
      const b = await readForm(req);
      if (b.grant_type === "authorization_code") {
        const row = typeof b.code === "string" ? q("SELECT * FROM oauth_codes WHERE hash = ?").get(sha(b.code)) : null;
        if (row) q("DELETE FROM oauth_codes WHERE hash = ?").run(row.hash); // single use
        if (!row || row.expires_at < now() || row.client_id !== b.client_id || row.redirect_uri !== b.redirect_uri)
          return oauthErr(res, 400, "invalid_grant", "Code is invalid or expired");
        if (typeof b.code_verifier !== "string" || s256(b.code_verifier) !== row.challenge) return oauthErr(res, 400, "invalid_grant", "PKCE check failed");
        const client = q("SELECT name FROM oauth_clients WHERE id = ?").get(row.client_id);
        const t = newConnection({ name: client ? client.name : "MCP app", kind: "oauth", access: row.access, clientId: row.client_id });
        return send(res, 200, { access_token: t.token, token_type: "Bearer", expires_in: ACCESS_HOURS * 3600, refresh_token: t.refresh, scope: row.access });
      }
      if (b.grant_type === "refresh_token") {
        const rt = typeof b.refresh_token === "string" ? b.refresh_token : "";
        const row = q("SELECT * FROM mcp_tokens WHERE refresh_hash = ? AND kind = 'oauth'").get(sha(rt));
        if (!row) {
          const reused = q("SELECT * FROM mcp_tokens WHERE prev_refresh = ?").get(sha(rt));
          if (reused) { q("DELETE FROM mcp_tokens WHERE id = ?").run(reused.id); console.warn(`[security] refresh token reused for "${reused.name}": connection revoked`); }
          return oauthErr(res, 400, "invalid_grant", "Refresh token is invalid");
        }
        if (row.refresh_expires < now() || (b.client_id && b.client_id !== row.client_id)) return oauthErr(res, 400, "invalid_grant", "Refresh token expired");
        const at = "lga_" + token(), nr = "lgr_" + token();
        q("UPDATE mcp_tokens SET hash = ?, expires_at = ?, refresh_hash = ?, refresh_expires = ?, prev_refresh = ? WHERE id = ?")
          .run(sha(at), now() + ACCESS_HOURS * 3600_000, sha(nr), now() + REFRESH_DAYS * 86400_000, row.refresh_hash, row.id);
        return send(res, 200, { access_token: at, token_type: "Bearer", expires_in: ACCESS_HOURS * 3600, refresh_token: nr, scope: row.access });
      }
      return oauthErr(res, 400, "unsupported_grant_type", "Use authorization_code or refresh_token");
    }
    if (p === "/oauth/revoke" && m === "POST") {
      const b = await readForm(req);
      if (typeof b.token === "string" && b.token.length < 120) q("DELETE FROM mcp_tokens WHERE hash = ? OR refresh_hash = ?").run(sha(b.token), sha(b.token));
      return send(res, 200, {});
    }
    return send(res, 404, { error: "not_found" });
  }

  /* ---------------- personal tokens (admin, Settings → AI agents) ---------------- */
  async function adminTokens(req, res, p, m) {
    if (!isAdmin(req)) throw new HttpError(403, "admin_only");
    if (m === "GET" && p === "/api/admin/mcp") {
      const rows = q("SELECT id, name, kind, access, expires_at, refresh_expires, created_at, last_used FROM mcp_tokens ORDER BY created_at DESC").all();
      return send(res, 200, { tokens: rows.map((r) => ({ ...r, expires_at: r.kind === "oauth" ? r.refresh_expires : r.expires_at, refresh_expires: undefined })), publicUrl: PUBLIC });
    }
    if (m === "POST" && p === "/api/admin/mcp") {
      const b = await readJson(req);
      const name = clean(b.name, 60); const access = ["read", "add", "full"].includes(b.access) ? b.access : null;
      const days = [0, 30, 90, 365].includes(b.days) ? b.days : null;
      if (!name || !access || days === null) throw bad("fields");
      if (q("SELECT COUNT(*) n FROM mcp_tokens").get().n >= 100) throw bad("limit");
      const t = newConnection({ name, kind: "token", access, days });
      return send(res, 200, { id: t.id, token: t.token, url: PUBLIC ? PUBLIC + "/mcp" : "" });
    }
    if (m === "POST" && p === "/api/admin/mcp/revoke") {
      const b = await readJson(req);
      q("DELETE FROM mcp_tokens WHERE id = ?").run(String(b.id || ""));
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: "not_found" });
  }

  /* ---------------- tools ---------------- */
  class ToolError extends Error {}
  const fail = (msg) => { throw new ToolError(msg); };
  const s = (d) => ({ type: "string", description: d });
  const G = s("Group: its name (e.g. \"Deep's ring ceremony\" or \"દીપની સગાઈ\"), join code or id. Optional when there is only one group.");
  const lower = (x) => String(x || "").toLowerCase().normalize("NFC");
  const textsOf = (r) => [r.text || r.name, ...((r.i18n && Array.isArray(r.i18n)) ? r.i18n : [])].filter(Boolean);

  function findGroup(arg) {
    const all = q("SELECT * FROM groups ORDER BY created_at DESC").all();
    if (!all.length) fail("There are no groups yet. Create one with create_group.");
    if (!arg) { if (all.length === 1) return all[0]; fail("Which group? " + all.map((g) => `"${g.title}"`).join(", ")); }
    const a = lower(arg).trim();
    const hits = all.filter((g) => g.id === arg || g.code === normCode(arg)).concat(all.filter((g) => lower(g.title) === a));
    if (hits.length) return hits[0];
    const part = all.filter((g) => lower(g.title).includes(a));
    if (part.length === 1) return part[0];
    fail(part.length ? `"${arg}" matches several groups: ${part.map((g) => `"${g.title}"`).join(", ")}` : `No group called "${arg}". Groups: ${all.map((g) => `"${g.title}"`).join(", ")}`);
  }
  function pick(list, arg, what, label) {
    if (!arg && arg !== 0) fail(`Say which ${what}.`);
    const a = lower(arg).trim();
    const exact = list.filter((r) => r.id === arg || textsOf(r).some((t) => lower(t) === a));
    if (exact.length === 1) return exact[0];
    const part = exact.length ? exact : list.filter((r) => textsOf(r).some((t) => lower(t).includes(a)));
    if (part.length === 1) return part[0];
    if (!part.length) fail(`No ${what} matching "${arg}".` + (list.length ? ` Some ${what}s: ` + list.slice(0, 15).map(label).join("; ") : ""));
    fail(`"${arg}" matches several ${what}s; use the id: ` + part.slice(0, 12).map(label).join("; "));
  }
  const entryLabel = (e) => `${e.id}: ${e.text}`;
  function entries(g, { deleted } = {}) {
    const rows = q("SELECT e.*, s.kind, s.name section_name FROM entries e JOIN sections s ON s.id = e.section_id WHERE e.group_id = ?").all(g.id).map((r) => ({ ...r, i18n: parse(r.i18n) }));
    return rows.filter((r) => (deleted === undefined ? true : deleted ? !!r.deleted_at : !r.deleted_at));
  }
  function sections(g, kind, { deleted } = {}) {
    return q("SELECT * FROM sections WHERE group_id = ?").all(g.id).map((r) => ({ ...r, i18n: parse(r.i18n) }))
      .filter((r) => (!kind || r.kind === kind) && (deleted === undefined ? true : deleted ? !!r.deleted_at : !r.deleted_at));
  }
  function steps(g, { deleted } = {}) {
    return q("SELECT * FROM steps WHERE group_id = ? ORDER BY pos").all(g.id).map((r) => ({ ...r, i18n: parse(r.i18n) }))
      .filter((r) => (deleted === undefined ? true : deleted ? !!r.deleted_at : !r.deleted_at));
  }
  function member(g, name) {
    if (name === "" || name === null) return null;
    const ms = S.members.all(g.id).filter((m) => !m.removed);
    return pick(ms.map((m) => ({ ...m, text: m.name })), name, "member", (m) => m.name).id;
  }
  const parse = (x) => { try { return x ? JSON.parse(x) : null; } catch { return null; } };
  const daysLeft = (d) => { if (!d) return null; const t = new Date(d + "T00:00:00+05:30").getTime(); return Math.round((t - Date.now()) / 86400000); };
  const ritualName = (id) => { const r = TEMPLATES.get(id); return r ? { gu: r.name[0], en: r.name[1] } : id; };

  function groupView(g) {
    const st = state(g, { memberId: null, admin: true, owner: false });
    const names = Object.fromEntries(st.members.map((m) => [m.id, m.name]));
    const nm = (id) => (id ? names[id] || "someone" : "admin");
    const en = (r) => (r.i18n && r.i18n[1] && r.i18n[0] === (r.text || r.name) ? r.i18n[1] : undefined);
    const list = (kind) => st.sections.filter((x) => x.kind === kind).map((x) => ({
      type: x.name, type_en: en(x), id: x.id, ...(x.deleted_at ? { deleted: true, deleted_by: nm(x.deleted_by) } : {}),
      entries: st.entries.filter((e) => e.section_id === x.id).map((e) => ({
        id: e.id, text: e.text, en: en(e), done: !!e.done_at, ...(e.done_at ? { done_by: nm(e.done_by) } : {}),
        ...(e.assignee ? { assignee: nm(e.assignee) } : {}), ...(e.amount != null ? { amount: e.amount } : {}),
        ...(e.side ? { side: e.side === "b" ? "bride" : "groom" } : {}), ...(e.deleted_at ? { deleted: true, deleted_by: nm(e.deleted_by) } : {}),
      })),
    }));
    const live = st.entries.filter((e) => !e.deleted_at);
    return {
      id: g.id, code: g.code, title: g.title, ritual: g.ritual, ritual_name: ritualName(g.ritual), date: g.date || null, days_left: daysLeft(g.date),
      side: g.side, members: st.members.filter((m) => !m.removed).map((m) => m.name),
      totals: { cost: live.reduce((a, e) => a + (e.amount || 0), 0), cost_done: live.filter((e) => e.done_at).reduce((a, e) => a + (e.amount || 0), 0), done: live.filter((e) => e.done_at).length, open: live.filter((e) => !e.done_at).length },
      items: list("item"), todos: list("todo"),
      steps: st.steps.map((x, i) => ({ id: x.id, text: x.text, en: en(x), ...(x.deleted_at ? { deleted: true } : {}) })),
    };
  }

  const TOOLS = [
    { name: "list_groups", level: "read", description: "List all ceremony groups with date, days left and progress.", inputSchema: { type: "object", properties: {} },
      run: () => q("SELECT * FROM groups ORDER BY created_at DESC").all().map((g) => {
        const e = entries(g, { deleted: false }).filter((x) => !sections(g).find((s_) => s_.id === x.section_id)?.deleted_at);
        return { title: g.title, code: g.code, id: g.id, ritual: ritualName(g.ritual), date: g.date || null, days_left: daysLeft(g.date), members: S.countMembers.get(g.id).n, done: e.filter((x) => x.done_at).length, open: e.filter((x) => !x.done_at).length };
      }) },
    { name: "get_group", level: "read", description: "Everything in one group: details, members, item and to-do lists by type (with who ticked, assignee, cost, soft-deleted ones marked deleted), and ritual steps.",
      inputSchema: { type: "object", properties: { group: G } }, run: (a) => groupView(findGroup(a.group)) },
    { name: "list_pending", level: "read", description: "What is still left to do (unticked items and to-dos), optionally for one group or one person.",
      inputSchema: { type: "object", properties: { group: G, person: s("Only things assigned to this member") } },
      run: (a) => {
        const gs = a.group ? [findGroup(a.group)] : q("SELECT * FROM groups ORDER BY date").all();
        return gs.map((g) => {
          const dead = new Set(sections(g, null, { deleted: true }).map((x) => x.id));
          const pid = a.person ? member(g, a.person) : null;
          const names = Object.fromEntries(S.members.all(g.id).map((m) => [m.id, m.name]));
          const left = entries(g, { deleted: false }).filter((e) => !e.done_at && !dead.has(e.section_id) && (!pid || e.assignee === pid));
          return { group: g.title, days_left: daysLeft(g.date), items: left.filter((e) => e.kind === "item").map((e) => ({ id: e.id, type: e.section_name, text: e.text, ...(e.assignee ? { assignee: names[e.assignee] } : {}) })), todos: left.filter((e) => e.kind === "todo").map((e) => ({ id: e.id, type: e.section_name, text: e.text, ...(e.assignee ? { assignee: names[e.assignee] } : {}) })) };
        });
      } },
    { name: "get_activity", level: "read", description: "Recent changes in a group: who added, ticked, edited or deleted what.",
      inputSchema: { type: "object", properties: { group: G, limit: { type: "integer", description: "How many (default 30, max 80)" } } },
      run: (a) => { const g = findGroup(a.group); const names = Object.fromEntries(S.members.all(g.id).map((m) => [m.id, m.name]));
        return S.activity.all(g.id).slice(0, Math.min(80, Math.max(1, a.limit || 30))).map((x) => ({ who: x.via || (x.member_id ? names[x.member_id] || "someone" : "admin"), action: x.action, detail: x.detail, at: new Date(x.at).toISOString() })); } },
    { name: "list_rituals", level: "read", description: "The ritual templates a group can be made from (Saurashtra Leuva Patel wedding rituals, in order).", inputSchema: { type: "object", properties: {} },
      run: () => [...TEMPLATES.values()].map((r) => ({ id: r.id, gu: r.name[0], en: r.name[1], when: r.when[1], short: r.short[1] })) },
    { name: "get_ritual_guide", level: "read", description: "The guide for one ritual: meaning, steps, suggested items and to-dos, elders' tip.",
      inputSchema: { type: "object", properties: { ritual: s("Ritual id or name, e.g. sagai, goldhana, chandlo"), language: { type: "string", enum: ["gu", "en", "hi"], description: "Default gu" } }, required: ["ritual"] },
      run: (a) => { const all = [...TEMPLATES.values()]; const r = pick(all.map((x) => ({ ...x, text: x.id, i18n: x.name })), a.ritual, "ritual", (x) => `${x.id} (${x.name[1]})`);
        const i = { gu: 0, en: 1, hi: 2 }[a.language] ?? 0; const tr = (x) => x[i] || x[0];
        const lst = (arr) => arr.map((e) => (Array.isArray(e) ? tr(e) + (e[3] ? ` [${e[3] === "b" ? "bride side" : "groom side"}]` : "") : "## " + tr(e.h)));
        return { id: r.id, name: tr(r.name), when: tr(r.when), about: tr(r.about), steps: r.steps.map(tr), items: lst(r.items), todos: lst(r.todos), tip: tr(r.tip) }; } },

    { name: "create_group", level: "add", description: "Create a new group for ONE ceremony, pre-filled from a ritual template. Returns the join code to share with family.",
      inputSchema: { type: "object", properties: { title: s("e.g. \"દીપની સગાઈ\" (Deep's ring ceremony)"), ritual: s("Ritual id from list_rituals, e.g. sagai"), date: s("YYYY-MM-DD, optional"), side: { type: "string", enum: ["all", "b", "g"], description: "Which side's items: all (default), b = bride's side, g = groom's side" }, your_name: s("Name to show for the creator, default Pritesh") }, required: ["title", "ritual"] },
      run: (a, who) => { const r = TEMPLATES.get(a.ritual) || pick([...TEMPLATES.values()].map((x) => ({ ...x, text: x.id, i18n: x.name })), a.ritual, "ritual", (x) => x.id);
        if (a.date && !isDate(a.date)) fail("date must be YYYY-MM-DD");
        const out = createGroup({ title: a.title, ritual: r.id, date: a.date || "", side: a.side, name: a.your_name || "Pritesh", via: who.via }, true);
        return { created: a.title, code: out.code.replace(/(...)(?=.)/g, "$1-"), join_link: PUBLIC ? `${PUBLIC}/#j-${out.code}` : null, id: out.groupId }; } },
    { name: "update_group", level: "add", description: "Change a group's name or date.",
      inputSchema: { type: "object", properties: { group: G, title: s("New name"), date: s("New date YYYY-MM-DD, or empty to clear") } },
      run: (a, who) => { const g = findGroup(a.group); return change(g, who, { op: "editGroup", title: a.title, date: a.date }); } },
    { name: "add_item", level: "add", description: "Add an item (something to buy/arrange) or a to-do to a group, under a type (heading). Write it in Gujarati unless asked otherwise.",
      inputSchema: { type: "object", properties: { group: G, text: s("What, e.g. \"શ્રીફળ – ૫\""), kind: { type: "string", enum: ["item", "todo"], description: "item (default) or todo" }, type: s("Heading to put it under, e.g. \"ભેટ\" / Gifts. Default: the first one"), assignee: s("Member who will bring/do it"), amount: { type: "integer", description: "Cost in rupees" } }, required: ["text"] },
      run: (a, who) => { const g = findGroup(a.group); const kind = a.kind === "todo" ? "todo" : "item";
        const secs = sections(g, kind, { deleted: false }).sort((x, y) => x.pos - y.pos); if (!secs.length) fail(`This group has no ${kind} types; add one with add_type.`);
        const sec = a.type ? pick(secs, a.type, "type", (x) => `${x.id}: ${x.name}`) : secs[0];
        return change(g, who, { op: "addEntry", sectionId: sec.id, text: a.text, amount: a.amount ?? null, assignee: a.assignee ? member(g, a.assignee) : null }, `added under "${sec.name}"`); } },
    { name: "update_item", level: "add", description: "Change an item or to-do: tick/untick it, rename it, set who brings it or its cost.",
      inputSchema: { type: "object", properties: { group: G, item: s("Item id or (part of) its text"), done: { type: "boolean", description: "true = tick, false = untick" }, text: s("New text"), assignee: s("Member name, or empty to clear"), amount: { type: "integer", description: "Cost in rupees; -1 clears it" } }, required: ["item"] },
      run: (a, who) => { const g = findGroup(a.group); const e = pick(entries(g, { deleted: false }), a.item, "item", entryLabel); const out = [];
        if (a.text !== undefined || a.assignee !== undefined || a.amount !== undefined)
          out.push(change(g, who, { op: "editEntry", id: e.id, ...(a.text !== undefined ? { text: a.text } : {}), ...(a.assignee !== undefined ? { assignee: member(g, a.assignee) } : {}), ...(a.amount !== undefined ? { amount: a.amount < 0 ? null : a.amount } : {}) }));
        if (a.done !== undefined) out.push(change(g, who, { op: "toggle", id: e.id, done: !!a.done }));
        if (!out.length) fail("Nothing to change: give done, text, assignee or amount.");
        return { updated: e.text }; } },
    { name: "delete_item", level: "add", description: "Delete an item or to-do. It stays visible as deleted (dashed) and can be restored.",
      inputSchema: { type: "object", properties: { group: G, item: s("Item id or text") }, required: ["item"] },
      run: (a, who) => { const g = findGroup(a.group); const e = pick(entries(g, { deleted: false }), a.item, "item", entryLabel); return change(g, who, { op: "delEntry", id: e.id }, `deleted "${e.text}" (restorable)`); } },
    { name: "restore_item", level: "add", description: "Bring back a deleted item or to-do.",
      inputSchema: { type: "object", properties: { group: G, item: s("Item id or text") }, required: ["item"] },
      run: (a, who) => { const g = findGroup(a.group); const e = pick(entries(g, { deleted: true }), a.item, "deleted item", entryLabel); return change(g, who, { op: "restoreEntry", id: e.id }, `restored "${e.text}"`); } },
    { name: "add_member", level: "add", description: "Add a family member to a group by name, so items can be assigned to them; when they open the invite they tap this name.",
      inputSchema: { type: "object", properties: { group: G, name: s("Member's name, e.g. \"દીપ\"") }, required: ["name"] },
      run: (a, who) => { const g = findGroup(a.group); return change(g, who, { op: "addMember", name: a.name }, `added ${a.name}`); } },
    { name: "add_type", level: "add", description: "Add a new type (heading) for items or to-dos, e.g. \"ભેટ\" / Gifts.",
      inputSchema: { type: "object", properties: { group: G, name: s("Heading name"), kind: { type: "string", enum: ["item", "todo"], description: "Default item" } }, required: ["name"] },
      run: (a, who) => { const g = findGroup(a.group); return change(g, who, { op: "addSection", kind: a.kind === "todo" ? "todo" : "item", name: a.name }); } },
    { name: "rename_type", level: "add", description: "Rename a type (heading).",
      inputSchema: { type: "object", properties: { group: G, type: s("Current name or id"), name: s("New name") }, required: ["type", "name"] },
      run: (a, who) => { const g = findGroup(a.group); const x = pick(sections(g, null, { deleted: false }), a.type, "type", (y) => `${y.id}: ${y.name}`); return change(g, who, { op: "editSection", id: x.id, name: a.name }); } },
    { name: "delete_type", level: "add", description: "Delete a type (heading) and hide its items. Restorable.",
      inputSchema: { type: "object", properties: { group: G, type: s("Name or id") }, required: ["type"] },
      run: (a, who) => { const g = findGroup(a.group); const x = pick(sections(g, null, { deleted: false }), a.type, "type", (y) => `${y.id}: ${y.name}`); return change(g, who, { op: "delSection", id: x.id }, `deleted type "${x.name}" (restorable)`); } },
    { name: "restore_type", level: "add", description: "Bring back a deleted type.",
      inputSchema: { type: "object", properties: { group: G, type: s("Name or id") }, required: ["type"] },
      run: (a, who) => { const g = findGroup(a.group); const x = pick(sections(g, null, { deleted: true }), a.type, "deleted type", (y) => `${y.id}: ${y.name}`); return change(g, who, { op: "restoreSection", id: x.id }); } },
    { name: "add_step", level: "add", description: "Add a ritual step (vidhi) at the end of the group's steps.",
      inputSchema: { type: "object", properties: { group: G, text: s("The step") }, required: ["text"] },
      run: (a, who) => { const g = findGroup(a.group); return change(g, who, { op: "addStep", text: a.text }); } },
    { name: "update_step", level: "add", description: "Edit a ritual step, or move it up/down.",
      inputSchema: { type: "object", properties: { group: G, step: s("Step id, number (1 = first) or text"), text: s("New text"), move: { type: "string", enum: ["up", "down"] } }, required: ["step"] },
      run: (a, who) => { const g = findGroup(a.group); const x = stepPick(g, a.step, false);
        if (a.text) change(g, who, { op: "editStep", id: x.id, text: a.text });
        if (a.move) change(g, who, { op: "moveStep", id: x.id, dir: a.move === "up" ? -1 : 1 });
        if (!a.text && !a.move) fail("Give text or move."); return { updated: x.text }; } },
    { name: "delete_step", level: "add", description: "Delete a ritual step (restorable).",
      inputSchema: { type: "object", properties: { group: G, step: s("Step id, number or text") }, required: ["step"] },
      run: (a, who) => { const g = findGroup(a.group); const x = stepPick(g, a.step, false); return change(g, who, { op: "delStep", id: x.id }, `deleted step "${x.text}" (restorable)`); } },
    { name: "restore_step", level: "add", description: "Bring back a deleted ritual step.",
      inputSchema: { type: "object", properties: { group: G, step: s("Step id or text") }, required: ["step"] },
      run: (a, who) => { const g = findGroup(a.group); const x = stepPick(g, a.step, true); return change(g, who, { op: "restoreStep", id: x.id }); } },

    { name: "purge_deleted", level: "full", description: "Permanently delete things that were already deleted: one item/type/step, or everything deleted in the group. Cannot be undone.",
      inputSchema: { type: "object", properties: { group: G, item: s("A deleted item's id or text. Omit to purge everything deleted in the group") } },
      run: (a, who) => { const g = findGroup(a.group);
        if (!a.item) return admin(g, who, { op: "purgeAllDeleted" });
        const e = pick(entries(g, { deleted: true }), a.item, "deleted item", entryLabel); return admin(g, who, { op: "purgeEntry", id: e.id }, `permanently deleted "${e.text}"`); } },
    { name: "remove_member", level: "full", description: "Remove a member from a group; their phone loses access at once.",
      inputSchema: { type: "object", properties: { group: G, member: s("Member name") }, required: ["member"] },
      run: (a, who) => { const g = findGroup(a.group); return admin(g, who, { op: "removeMember", id: member(g, a.member) }, `removed ${a.member}`); } },
    { name: "rotate_code", level: "full", description: "Make a new join code for a group; the old code stops working (members stay in).",
      inputSchema: { type: "object", properties: { group: G } },
      run: (a, who) => { const g = findGroup(a.group); const r = admin(g, who, { op: "rotateCode" }); return { new_code: String(r.code).replace(/(...)(?=.)/g, "$1-") }; } },
  ];
  function stepPick(g, arg, deleted) {
    const list = steps(g, { deleted });
    if (!deleted && /^\d+$/.test(String(arg).trim())) { const i = +arg - 1; if (list[i]) return list[i]; fail(`There are ${list.length} steps.`); }
    return pick(list, arg, deleted ? "deleted step" : "step", (x) => `${x.id}: ${x.text}`);
  }
  function wrapOp(fn, g, who, body) {
    try { const out = fn(g, who, body); bump(g.id); return out; }
    catch (e) { if (e instanceof HttpError) fail(`Refused (${e.code}).`); throw e; }
  }
  function change(g, who, body, msg) { const out = wrapOp(opMember, g, who, body); return { ok: true, ...(msg ? { result: msg } : {}), ...out }; }
  function admin(g, who, body, msg) { const out = wrapOp(opAdmin, g, who, body); return { ok: true, ...(msg ? { result: msg } : {}), ...out }; }

  function instructions() {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const gs = q("SELECT title, date, ritual FROM groups ORDER BY created_at DESC LIMIT 20").all();
    return `Leuva Patel Lagna: wedding-ritual planning for a Saurashtra Leuva Patel family. Today is ${today} (Asia/Kolkata). Amounts are in INR.
Each group is ONE ceremony (e.g. a ring ceremony), shared live with family members on their phones. Groups now: ${gs.length ? gs.map((g) => `"${g.title}" (${g.ritual}${g.date ? ", " + g.date : ""})`).join("; ") : "none"}.
Groups hold item lists (things to buy/arrange) and to-do lists, each under types (headings), plus the ritual's steps.
Deleting is soft: deleted things stay visible as dashed and can be restored; only purge_deleted removes them for good.
Write new items in Gujarati (Gujarati numerals are fine) unless the user writes in English or asks otherwise. Refer to things by name; the tools resolve names and list choices when ambiguous.`;
  }

  async function mcp(req, res, ip) {
    if (req.method !== "POST") { res.writeHead(405, { Allow: "POST", "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "method_not_allowed" })); }
    const origin = req.headers.origin;
    if (origin && PUBLIC && origin !== new URL(PUBLIC).origin) throw new HttpError(403, "bad_origin");
    const tok = authMcp(req);
    if (!tok) {
      const extra = PUBLIC ? { "WWW-Authenticate": `Bearer resource_metadata="${PUBLIC}/.well-known/oauth-protected-resource/mcp"` } : {};
      return send(res, 401, { error: "unauthorized" }, extra);
    }
    if (!hit("mcp:" + tok.id, 300, 60_000)) throw new HttpError(429, "slow_down");
    const body = await readRpc(req);
    const who = { memberId: null, admin: tok.access === "full", owner: false, via: "MCP: " + tok.name };
    const tools = TOOLS.filter((t) => LEVEL[t.level] <= LEVEL[tok.access]);
    const one = (msg) => {
      if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return { jsonrpc: "2.0", id: msg && msg.id !== undefined ? msg.id : null, error: { code: -32600, message: "Invalid request" } };
      const isNote = msg.id === undefined;
      const ok = (result) => (isNote ? null : { jsonrpc: "2.0", id: msg.id, result });
      const err = (code, message) => (isNote ? null : { jsonrpc: "2.0", id: msg.id, error: { code, message } });
      const prm = msg.params && typeof msg.params === "object" ? msg.params : {};
      switch (msg.method) {
        case "initialize": {
          const v = PROTOCOLS.includes(prm.protocolVersion) ? prm.protocolVersion : PROTOCOLS[0];
          return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "leuva-patel-lagna", title: "Leuva Patel Lagna", version: "1.0.0" }, instructions: instructions() });
        }
        case "ping": return ok({});
        case "tools/list": return ok({ tools: tools.map(({ name, description, inputSchema, level }) => ({ name, description, inputSchema, annotations: { readOnlyHint: level === "read", destructiveHint: level === "full" } })) });
        case "resources/list": return ok({ resources: [] });
        case "prompts/list": return ok({ prompts: [] });
        case "tools/call": {
          const t = tools.find((x) => x.name === prm.name);
          if (!t) return TOOLS.some((x) => x.name === prm.name) ? ok({ content: [{ type: "text", text: `This connection has "${tok.access}" access; ${prm.name} needs "${TOOLS.find((x) => x.name === prm.name).level}".` }], isError: true }) : err(-32602, "Unknown tool");
          const args = prm.arguments && typeof prm.arguments === "object" && !Array.isArray(prm.arguments) ? prm.arguments : {};
          try { const out = t.run(args, who); return ok({ content: [{ type: "text", text: JSON.stringify(out, null, 1) }], structuredContent: Array.isArray(out) ? { result: out } : out }); }
          catch (e) { if (e instanceof ToolError) return ok({ content: [{ type: "text", text: e.message }], isError: true }); console.error("[mcp]", e); return ok({ content: [{ type: "text", text: "Server error" }], isError: true }); }
        }
        default:
          if (isNote) return null;
          return err(-32601, "Method not found");
      }
    };
    const replies = (Array.isArray(body) ? body.slice(0, 20) : [body]).map(one).filter(Boolean);
    if (!replies.length) { res.writeHead(202, { "Cache-Control": "no-store" }); return res.end(); }
    return send(res, 200, Array.isArray(body) ? replies : replies[0]);
  }

  async function handle(req, res, url, ip) {
    const p = url.pathname, m = req.method;
    if (p === "/mcp") return mcp(req, res, ip);
    if (m === "GET" && (p === "/.well-known/oauth-protected-resource" || p === "/.well-known/oauth-protected-resource/mcp")) { needPublic(); return send(res, 200, protectedResource()); }
    if (m === "GET" && (p === "/.well-known/oauth-authorization-server" || p === "/.well-known/oauth-authorization-server/mcp")) { needPublic(); return send(res, 200, authServer()); }
    if (p.startsWith("/oauth/")) return oauth(req, res, p, m, ip);
    if (p.startsWith("/api/admin/mcp")) return adminTokens(req, res, p, m);
    return send(res, 404, { error: "not_found" });
  }
  return { handle };
};
