"use strict";
// Run with: node --test server/mcp.test.js
const test = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lagna-mcp-"));
process.env.ADMIN_PASSWORD = "correct horse battery";
process.env.PUBLIC_URL = "https://lagna.example.org";
process.env.TRUST_PROXY = "1";
const { server } = require("./server");

let base;
test.before(() => new Promise((r) => server.listen(0, "127.0.0.1", () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
test.after(() => { server.close(); server.closeAllConnections?.(); });

let ipN = 0;
async function req(method, p, { json, form, headers = {}, ip } = {}) {
  const h = { "x-forwarded-for": ip || `10.1.0.${++ipN}`, ...headers };
  let body;
  if (json !== undefined) { h["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form !== undefined) { h["content-type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(form).toString(); }
  const res = await fetch(base + p, { method, headers: h, body, redirect: "manual" });
  const text = await res.text();
  let data = null; try { data = JSON.parse(text); } catch {}
  return { status: res.status, body: data, text, headers: res.headers };
}
const admin = async () => (await req("POST", "/api/admin/login", { json: { password: "correct horse battery" } })).body.token;
async function newToken(access) {
  const A = { "x-admin-token": await admin() };
  return (await req("POST", "/api/admin/mcp", { json: { name: "Test " + access, access, days: 30 }, headers: A })).body.token;
}
let rpcId = 0;
async function rpc(tok, method, params) {
  const r = await req("POST", "/mcp", { json: { jsonrpc: "2.0", id: ++rpcId, method, params }, headers: { authorization: "Bearer " + tok } });
  return r.body;
}
const call = async (tok, name, args) => { const r = await rpc(tok, "tools/call", { name, arguments: args }); return { ...r.result, data: r.result && !r.result.isError ? JSON.parse(r.result.content[0].text) : null }; };

test("no token: 401 that points to the OAuth metadata", async () => {
  const r = await req("POST", "/mcp", { json: { jsonrpc: "2.0", id: 1, method: "initialize", params: {} } });
  assert.equal(r.status, 401);
  assert.match(r.headers.get("www-authenticate"), /resource_metadata="https:\/\/lagna\.example\.org\/\.well-known\/oauth-protected-resource\/mcp"/);
  const prm = await req("GET", "/.well-known/oauth-protected-resource/mcp");
  assert.equal(prm.body.resource, "https://lagna.example.org/mcp");
  const as = await req("GET", "/.well-known/oauth-authorization-server");
  assert.deepEqual(as.body.code_challenge_methods_supported, ["S256"]);
});

test("only the admin can make tokens", async () => {
  assert.equal((await req("POST", "/api/admin/mcp", { json: { name: "x", access: "full", days: 30 } })).status, 403);
});

test("access levels limit the tools", async () => {
  const read = await newToken("read"), add = await newToken("add"), full = await newToken("full");
  const names = async (t) => (await rpc(t, "tools/list", {})).result.tools.map((x) => x.name);
  const r = await names(read), a = await names(add), f = await names(full);
  assert.ok(r.includes("get_group") && !r.includes("add_item"));
  assert.ok(a.includes("add_item") && !a.includes("purge_deleted"));
  assert.ok(f.includes("purge_deleted") && f.includes("remove_member"));
  // calling a tool above your level is refused
  const denied = await call(read, "create_group", { title: "x", ritual: "sagai" });
  assert.ok(denied.isError);
});

test("tools: create, add, tick, soft delete, restore, purge, logged via MCP", async () => {
  const full = await newToken("full"), add = await newToken("add");
  const init = await rpc(add, "initialize", { protocolVersion: "2025-06-18" });
  assert.equal(init.result.protocolVersion, "2025-06-18");
  assert.match(init.result.instructions, /Today is \d{4}-\d{2}-\d{2}/);

  const c = await call(add, "create_group", { title: "Deep's ring ceremony", ritual: "sagai", date: "2027-01-20", side: "g", your_name: "Pritesh" });
  assert.match(c.data.code, /^[A-Z2-9]{3}-[A-Z2-9]{3}-[A-Z2-9]{3}$/);

  const g = await call(add, "get_group", { group: "deep" });
  assert.equal(g.data.title, "Deep's ring ceremony");
  assert.ok(g.data.items.length >= 2 && g.data.steps.length > 3);

  const added = await call(add, "add_item", { group: "Deep's ring ceremony", text: "ચાંદીનો સિક્કો", type: "hall", amount: 1100 });
  assert.ok(!added.isError, added.content?.[0]?.text);
  assert.ok(!(await call(add, "update_item", { group: "deep", item: "ચાંદીનો", done: true })).isError);
  // matching by English text of a template item works too
  assert.ok(!(await call(add, "update_item", { group: "deep", item: "Engagement rings", assignee: "Pritesh" })).isError);

  assert.ok(!(await call(add, "delete_item", { group: "deep", item: "ચાંદીનો" })).isError);
  let st = await call(add, "get_group", { group: "deep" });
  const coin = st.data.items.flatMap((s) => s.entries).find((e) => e.text === "ચાંદીનો સિક્કો");
  assert.ok(coin.deleted && coin.done && coin.amount === 1100);

  // "add" can't purge; "full" can, but only deleted things
  assert.ok((await call(add, "purge_deleted", { group: "deep", item: coin.id })).isError);
  assert.ok((await call(full, "purge_deleted", { group: "deep", item: "Engagement rings" })).isError);
  assert.ok(!(await call(full, "purge_deleted", { group: "deep", item: coin.id })).isError);
  st = await call(add, "get_group", { group: "deep" });
  assert.ok(!st.data.items.flatMap((s) => s.entries).some((e) => e.id === coin.id));

  const act = await call(add, "get_activity", { group: "deep" });
  assert.ok(act.data.some((x) => /^MCP: Test (add|full)$/.test(x.who) && x.action === "addEntry"));

  // ambiguous / unknown names come back as helpful errors, not crashes
  const amb = await call(add, "update_item", { group: "deep", item: "a", done: true });
  assert.ok(amb.isError && /several|No item/.test(amb.content[0].text));
});

test("revoked token stops working", async () => {
  const A = { "x-admin-token": await admin() };
  const made = (await req("POST", "/api/admin/mcp", { json: { name: "temp", access: "read", days: 0 }, headers: A })).body;
  assert.equal((await rpc(made.token, "ping", {})).result !== undefined, true);
  await req("POST", "/api/admin/mcp/revoke", { json: { id: made.id }, headers: A });
  assert.equal((await req("POST", "/mcp", { json: { jsonrpc: "2.0", id: 1, method: "ping" }, headers: { authorization: "Bearer " + made.token } })).status, 401);
});

test("OAuth: register, consent with admin password, PKCE, refresh rotation, reuse detection", async () => {
  // only allowed redirect hosts
  assert.equal((await req("POST", "/oauth/register", { json: { client_name: "Evil", redirect_uris: ["https://evil.example/cb"] } })).status, 400);
  const reg = await req("POST", "/oauth/register", { json: { client_name: "Claude", redirect_uris: ["https://claude.ai/api/mcp/auth_callback"] } });
  assert.equal(reg.status, 201);
  const client_id = reg.body.client_id, redirect_uri = "https://claude.ai/api/mcp/auth_callback";
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const q = { response_type: "code", client_id, redirect_uri, code_challenge: challenge, code_challenge_method: "S256", state: "xyz" };

  const page = await req("GET", "/oauth/authorize?" + new URLSearchParams(q));
  assert.equal(page.status, 200);
  assert.match(page.text, /Claude/);
  assert.match(page.headers.get("content-security-policy"), /form-action 'self' https:\/\/claude\.ai/);
  // wrong password: page again, no redirect
  const wrong = await req("POST", "/oauth/authorize", { form: { ...q, access: "add", password: "nope", decision: "allow" }, ip: "10.7.7.7" });
  assert.equal(wrong.status, 401);
  // right password: redirect with code and state
  const ok = await req("POST", "/oauth/authorize", { form: { ...q, access: "add", password: "correct horse battery", decision: "allow" } });
  assert.equal(ok.status, 302);
  const loc = new URL(ok.headers.get("location"));
  assert.equal(loc.origin + loc.pathname, redirect_uri);
  assert.equal(loc.searchParams.get("state"), "xyz");
  const code = loc.searchParams.get("code");

  // bad verifier fails, and burns the code
  assert.equal((await req("POST", "/oauth/token", { form: { grant_type: "authorization_code", code, redirect_uri, client_id, code_verifier: "x".repeat(43) } })).status, 400);
  // new code, right verifier
  const ok2 = await req("POST", "/oauth/authorize", { form: { ...q, access: "add", password: "correct horse battery", decision: "allow" } });
  const code2 = new URL(ok2.headers.get("location")).searchParams.get("code");
  const tok = await req("POST", "/oauth/token", { form: { grant_type: "authorization_code", code: code2, redirect_uri, client_id, code_verifier: verifier } });
  assert.equal(tok.status, 200);
  assert.equal(tok.body.scope, "add");
  // codes are single use
  assert.equal((await req("POST", "/oauth/token", { form: { grant_type: "authorization_code", code: code2, redirect_uri, client_id, code_verifier: verifier } })).status, 400);

  const tools = await rpc(tok.body.access_token, "tools/list", {});
  assert.ok(tools.result.tools.some((t) => t.name === "add_item"));

  // refresh rotates; the old refresh token used again revokes the whole connection
  const r1 = await req("POST", "/oauth/token", { form: { grant_type: "refresh_token", refresh_token: tok.body.refresh_token, client_id } });
  assert.equal(r1.status, 200);
  assert.notEqual(r1.body.refresh_token, tok.body.refresh_token);
  assert.equal((await req("POST", "/mcp", { json: { jsonrpc: "2.0", id: 1, method: "ping" }, headers: { authorization: "Bearer " + tok.body.access_token } })).status, 401);
  assert.equal((await req("POST", "/oauth/token", { form: { grant_type: "refresh_token", refresh_token: tok.body.refresh_token, client_id } })).status, 400);
  assert.equal((await req("POST", "/mcp", { json: { jsonrpc: "2.0", id: 1, method: "ping" }, headers: { authorization: "Bearer " + r1.body.access_token } })).status, 401);

  // deny goes back with access_denied
  const deny = await req("POST", "/oauth/authorize", { form: { ...q, decision: "deny" } });
  assert.equal(new URL(deny.headers.get("location")).searchParams.get("error"), "access_denied");
});
