"use strict";
// Run with: node --test server/
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lagna-test-"));
process.env.ADMIN_PASSWORD = "correct horse battery";
process.env.TRUST_PROXY = "1";
const { server } = require("./server");

let base;
test.before(() => new Promise((r) => server.listen(0, "127.0.0.1", () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
test.after(() => { server.close(); server.closeAllConnections?.(); });

let ipN = 0; // each test gets its own fake client IP so rate limits don't leak between tests
async function api(method, p, body, headers = {}, ip) {
  const res = await fetch(base + p, {
    method, headers: { "content-type": "application/json", "x-forwarded-for": ip || `10.0.0.${++ipN}`, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null), headers: res.headers };
}
async function adminToken() { return (await api("POST", "/api/admin/login", { password: "correct horse battery" })).body.token; }

test("page has strict CSP with script hashes and no unsafe-inline scripts", async () => {
  const res = await fetch(base + "/");
  const csp = res.headers.get("content-security-policy");
  assert.match(csp, /script-src 'sha256-/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  assert.equal(res.headers.get("x-frame-options"), "DENY");
});

test("only the admin can create groups", async () => {
  const r = await api("POST", "/api/groups", { title: "x", ritual: "sagai", name: "Me" });
  assert.equal(r.status, 403);
});

test("wrong admin password is refused and rate limited", async () => {
  const ip = "10.9.9.9";
  for (let i = 0; i < 5; i++) assert.equal((await api("POST", "/api/admin/login", { password: "nope" }, {}, ip)).status, 401);
  assert.equal((await api("POST", "/api/admin/login", { password: "correct horse battery" }, {}, ip)).status, 429);
});

test("full group flow: create, join, edit, soft delete, purge", async () => {
  const admin = await adminToken();
  const A = { "x-admin-token": admin };
  const c = await api("POST", "/api/groups", { title: "Deep's ring ceremony", ritual: "sagai", date: "2027-01-20", side: "g", name: "Pritesh" }, A);
  assert.equal(c.status, 200);
  assert.match(c.body.code, /^[A-Z2-9]{9}$/);
  const gid = c.body.groupId;

  // without a token: no access
  assert.equal((await api("GET", `/api/g/${gid}`)).status, 401);

  // seeded from the template, groom side only
  const st = (await api("GET", `/api/g/${gid}`, undefined, { authorization: "Bearer " + c.body.token })).body;
  assert.ok(st.entries.length > 10);
  assert.ok(st.entries.every((e) => e.side !== "b"));
  assert.ok(st.steps.length > 3);

  // join with the code (spaces and lower case are fine)
  const pre = await api("POST", "/api/join", { code: c.body.code.toLowerCase().replace(/(...)/g, "$1 ") });
  assert.equal(pre.body.group.title, "Deep's ring ceremony");
  const j = await api("POST", "/api/join", { code: c.body.code, name: "Deep" });
  const M = { authorization: "Bearer " + j.body.token };

  const sec = st.sections.find((s) => s.kind === "item");
  const add = await api("POST", `/api/g/${gid}/op`, { op: "addEntry", sectionId: sec.id, text: "<img src=x onerror=alert(1)> Shreefal", amount: 250 }, M);
  assert.equal(add.status, 200);
  await api("POST", `/api/g/${gid}/op`, { op: "toggle", id: add.body.id, done: true }, M);
  await api("POST", `/api/g/${gid}/op`, { op: "delEntry", id: add.body.id }, M);

  // a member can't purge
  assert.equal((await api("POST", `/api/g/${gid}/admin`, { op: "purgeEntry", id: add.body.id }, M)).status, 403);
  // the soft-deleted entry is still there, marked deleted
  let s2 = (await api("GET", `/api/g/${gid}`, undefined, M)).body;
  const e = s2.entries.find((x) => x.id === add.body.id);
  // activity log goes to the admin only
  assert.deepEqual(s2.activity, []);
  assert.ok((await api("GET", `/api/g/${gid}`, undefined, A)).body.activity.length > 0);
  assert.ok(e.deleted_at && e.done_by === j.body.memberId);

  // admin purges
  assert.equal((await api("POST", `/api/g/${gid}/admin`, { op: "purgeEntry", id: add.body.id }, A)).status, 200);
  s2 = (await api("GET", `/api/g/${gid}`, undefined, M)).body;
  assert.ok(!s2.entries.some((x) => x.id === add.body.id));

  // purge refuses something not soft-deleted first
  const live = s2.entries[0];
  assert.equal((await api("POST", `/api/g/${gid}/admin`, { op: "purgeEntry", id: live.id }, A)).body.error, "delete_first");

  // ids from another group are rejected
  const c2 = await api("POST", "/api/groups", { title: "Other", ritual: "chandlo", name: "P" }, A);
  const other = (await api("GET", `/api/g/${c2.body.groupId}`, undefined, { authorization: "Bearer " + c2.body.token })).body.entries[0];
  assert.equal((await api("POST", `/api/g/${gid}/op`, { op: "delEntry", id: other.id }, M)).status, 404);
  // and a token for group 1 does not open group 2
  assert.equal((await api("GET", `/api/g/${c2.body.groupId}`, undefined, M)).status, 401);

  // admin removes a member: their token stops working
  await api("POST", `/api/g/${gid}/admin`, { op: "removeMember", id: j.body.memberId }, A);
  assert.equal((await api("GET", `/api/g/${gid}`, undefined, M)).status, 401);

  // rotating the code: the old code no longer works
  const rot = await api("POST", `/api/g/${gid}/admin`, { op: "rotateCode" }, A);
  assert.equal((await api("POST", "/api/join", { code: c.body.code })).status, 404);
  assert.equal((await api("POST", "/api/join", { code: rot.body.code })).status, 200);
});

test("input validation", async () => {
  const A = { "x-admin-token": await adminToken() };
  assert.equal((await api("POST", "/api/groups", { title: "x".repeat(200), ritual: "sagai", name: "P" }, A)).status, 400);
  assert.equal((await api("POST", "/api/groups", { title: "ok", ritual: "nope", name: "P" }, A)).status, 400);
  assert.equal((await api("POST", "/api/groups", { title: "ok", ritual: "sagai", name: "P", date: "2027-13-45" }, A)).status, 400);
  const res = await fetch(base + "/api/join", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" });
  assert.equal(res.status, 415);
});

test("guessing join codes is rate limited", async () => {
  const ip = "10.8.8.8";
  for (let i = 0; i < 15; i++) assert.equal((await api("POST", "/api/join", { code: "AAAAAAAAA" }, {}, ip)).status, 404);
  assert.equal((await api("POST", "/api/join", { code: "AAAAAAAAA" }, {}, ip)).status, 429);
});

test("long-poll wakes up on a change", async () => {
  const A = { "x-admin-token": await adminToken() };
  const c = await api("POST", "/api/groups", { title: "Poll", ritual: "goldhana", name: "P" }, A);
  const M = { authorization: "Bearer " + c.body.token };
  const st = (await api("GET", `/api/g/${c.body.groupId}`, undefined, M)).body;
  const waiting = api("GET", `/api/g/${c.body.groupId}/wait?rev=${st.group.rev}`, undefined, M);
  await new Promise((r) => setTimeout(r, 100));
  await api("POST", `/api/g/${c.body.groupId}/op`, { op: "addStep", text: "New step" }, M);
  const w = await waiting;
  assert.equal(w.body.rev, st.group.rev + 1);
});
