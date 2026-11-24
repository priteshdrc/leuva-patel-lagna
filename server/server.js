"use strict";
/*
 * Leuva Patel Lagna – group planning server.
 * Zero npm dependencies: node:http + node:sqlite. Serves the single-page site and a small JSON API.
 *
 * Security model (see SECURITY.md):
 *  - A group is reached only with its join code. Joining gives the device a random
 *    member token; only its SHA-256 is stored. Every group request needs that token.
 *  - Only the admin (ADMIN_PASSWORD) creates groups and permanently deletes anything.
 *    Members can add/edit and soft-delete (shown dashed, restorable).
 *  - Brute-force limits on join codes and admin login, per IP and globally.
 *  - Strict CSP with hashes of the page's own inline scripts; every input length-checked;
 *    SQL is always parameterised.
 */
const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { open } = require("./db");

/* ---------------- config ---------------- */
const env = process.env;
const CFG = {
  port: +(env.PORT || 8200),
  host: env.HOST || "127.0.0.1",
  dataDir: env.DATA_DIR || path.join(__dirname, "..", "data"),
  page: env.PAGE_FILE || path.join(__dirname, "..", "docs", "index.html"),
  templates: env.TEMPLATE_DIR || path.join(__dirname, "..", "src"),
  adminPassword: env.ADMIN_PASSWORD || "",
  openCreate: env.OPEN_CREATE === "1",
  trustProxy: env.TRUST_PROXY !== "0",
  maxGroups: +(env.MAX_GROUPS || 2000),
};
const ADMIN_ENABLED = CFG.adminPassword.length >= 12;
const LIMITS = { sections: 60, entries: 1500, steps: 100, members: 200, text: 200, name: 60, title: 80 };
const ADMIN_SESSION_MS = 30 * 24 * 3600 * 1000;

/* ---------------- helpers ---------------- */
const now = () => Date.now();
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const B32 = "abcdefghijkmnpqrstuvwxyz23456789";
function rid(n = 12) { const b = crypto.randomBytes(n); let s = ""; for (const x of b) s += B32[x & 31]; return s; }
const CODE_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
function newCode() {
  let s = "";
  while (s.length < 9) { const x = crypto.randomBytes(1)[0]; if (x < 248) s += CODE_ALPHA[x % 31]; } // unbiased
  return s;
}
const normCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
const token = () => crypto.randomBytes(32).toString("base64url");
function clean(s, max) {
  if (typeof s !== "string") return null;
  // drop control and bidi-override characters, collapse whitespace
  const t = s.replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, " ").replace(/\s+/g, " ").trim();
  return t && t.length <= max ? t : null;
}
const isDate = (d) => d === "" || (/^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d)));
function safeEqual(a, b) { const x = Buffer.from(sha(a)), y = Buffer.from(sha(b)); return crypto.timingSafeEqual(x, y); }

class HttpError extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
const bad = (code = "bad_request") => new HttpError(400, code);

/* ---------------- rate limiting (in memory) ---------------- */
const buckets = new Map();
function hit(key, max, windowMs) {
  const t = now(); let b = buckets.get(key);
  if (!b || b.reset <= t) { b = { n: 0, reset: t + windowMs }; buckets.set(key, b); }
  b.n++;
  return b.n <= max;
}
function peek(key, max) { const b = buckets.get(key); return !b || b.reset <= now() || b.n < max; }
setInterval(() => { const t = now(); for (const [k, b] of buckets) if (b.reset <= t) buckets.delete(k); }, 60_000).unref();

/* ---------------- templates (ritual data from src/data-*.js) ---------------- */
function loadTemplates() {
  const ctx = { RITUALS: [] };
  vm.createContext(ctx);
  for (const f of fs.readdirSync(CFG.templates).filter((f) => /^data-\d+\.js$/.test(f)).sort())
    vm.runInContext(fs.readFileSync(path.join(CFG.templates, f), "utf8"), ctx, { filename: f, timeout: 1000 });
  return new Map(ctx.RITUALS.map((r) => [r.id, JSON.parse(JSON.stringify(r))]));
}
const TEMPLATES = loadTemplates();

/* ---------------- page + CSP ---------------- */
let PAGE = "", CSP = "";
function loadPage() {
  PAGE = fs.readFileSync(CFG.page, "utf8");
  const hashes = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${crypto.createHash("sha256").update(m[1]).digest("base64")}'`);
  CSP = [
    "default-src 'none'",
    `script-src ${hashes.join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}
loadPage();

/* ---------------- database ---------------- */
const db = open(CFG.dataDir);
const q = (sql) => { const s = db.prepare(sql); return s; };
function tx(fn) { db.exec("BEGIN IMMEDIATE"); try { const r = fn(); db.exec("COMMIT"); return r; } catch (e) { db.exec("ROLLBACK"); throw e; } }

const S = {
  groupById: q("SELECT * FROM groups WHERE id = ?"),
  groupByCode: q("SELECT * FROM groups WHERE code = ?"),
  countGroups: q("SELECT COUNT(*) n FROM groups"),
  insertGroup: q("INSERT INTO groups (id, code, title, ritual, date, side, owner_admin, owner_hash, created_at) VALUES (?,?,?,?,?,?,?,?,?)"),
  bump: q("UPDATE groups SET rev = rev + 1 WHERE id = ? RETURNING rev"),
  members: q("SELECT id, name, removed FROM members WHERE group_id = ? ORDER BY created_at"),
  member: q("SELECT * FROM members WHERE id = ? AND group_id = ?"),
  countMembers: q("SELECT COUNT(*) n FROM members WHERE group_id = ? AND removed = 0"),
  insertMember: q("INSERT INTO members (id, group_id, name, created_at) VALUES (?,?,?,?)"),
  tokenRow: q("SELECT t.*, m.removed FROM tokens t JOIN members m ON m.id = t.member_id WHERE t.hash = ?"),
  insertToken: q("INSERT INTO tokens (hash, member_id, group_id, created_at, last_seen) VALUES (?,?,?,?,?)"),
  touchToken: q("UPDATE tokens SET last_seen = ? WHERE hash = ?"),
  sections: q("SELECT * FROM sections WHERE group_id = ? ORDER BY kind, pos"),
  entries: q("SELECT * FROM entries WHERE group_id = ? ORDER BY pos"),
  steps: q("SELECT * FROM steps WHERE group_id = ? ORDER BY pos"),
  activity: q("SELECT id, member_id, action, detail, at, via FROM activity WHERE group_id = ? ORDER BY id DESC LIMIT 80"),
  log: q("INSERT INTO activity (group_id, member_id, action, detail, at, via) VALUES (?,?,?,?,?,?)"),
  adminSession: q("SELECT * FROM admin_sessions WHERE hash = ? AND expires_at > ?"),
};

/* ---------------- long-poll waiters ---------------- */
const waiters = new Map(); // groupId -> Set<fn>
function bump(gid) {
  const rev = S.bump.get(gid).rev;
  const set = waiters.get(gid);
  if (set) { waiters.delete(gid); for (const fn of set) fn(rev); }
  return rev;
}

/* ---------------- seeding a group from a ritual template ---------------- */
function seedGroup(gid, r, side, by) {
  const keep = (e) => !e[3] || side === "all" || e[3] === side;
  const t = now();
  const insSec = q("INSERT INTO sections (id, group_id, kind, name, i18n, pos, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)");
  const insEnt = q("INSERT INTO entries (id, group_id, section_id, text, i18n, side, pos, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)");
  const insStep = q("INSERT INTO steps (id, group_id, text, i18n, pos, created_by, created_at) VALUES (?,?,?,?,?,?,?)");
  const defaults = { item: ["સામાન", "Items", "सामान"], todo: ["કામ", "To-do", "काम"] };
  for (const [kind, list] of [["item", r.items || []], ["todo", r.todos || []]]) {
    let sec = null, pos = 0, spos = 0;
    const newSec = (arr) => { sec = rid(); insSec.run(sec, gid, kind, arr[0], JSON.stringify(arr), spos++, by, t); };
    for (const e of list) {
      if (!Array.isArray(e)) { if (e && e.h) newSec(e.h); continue; }
      if (!keep(e)) continue;
      if (!sec) newSec(defaults[kind]);
      insEnt.run(rid(), gid, sec, e[0], JSON.stringify(e.slice(0, 3)), e[3] || "", pos++, by, t);
    }
    if (!sec) newSec(defaults[kind]);
  }
  (r.steps || []).forEach((s, i) => insStep.run(rid(), gid, s[0], JSON.stringify(s.slice(0, 3)), i, by, t));
  // drop template headings that ended up empty after the side filter
  q("DELETE FROM sections WHERE group_id = ? AND NOT EXISTS (SELECT 1 FROM entries e WHERE e.section_id = sections.id) AND (SELECT COUNT(*) FROM sections s2 WHERE s2.group_id = sections.group_id AND s2.kind = sections.kind) > 1").run(gid);
}

/* ---------------- auth ---------------- */
function bearer(req) { const h = req.headers.authorization || ""; return h.startsWith("Bearer ") ? h.slice(7).trim() : ""; }
function isAdmin(req) {
  const t = req.headers["x-admin-token"];
  if (!ADMIN_ENABLED || typeof t !== "string" || t.length < 20 || t.length > 100) return false;
  return !!S.adminSession.get(sha(t), now());
}
// Who is calling for this group: { memberId|null, admin, owner }
function groupAuth(req, g) {
  const admin = isAdmin(req);
  const ot = req.headers["x-owner-token"];
  const owner = admin || (!!g.owner_hash && typeof ot === "string" && ot.length < 100 && safeEqual(sha(ot), g.owner_hash));
  const t = bearer(req);
  if (t && t.length < 100) {
    const row = S.tokenRow.get(sha(t));
    if (row && row.group_id === g.id && !row.removed) {
      if (now() - row.last_seen > 60_000) S.touchToken.run(now(), row.hash);
      return { memberId: row.member_id, admin, owner, tokenHash: row.hash };
    }
  }
  if (admin || owner) return { memberId: null, admin, owner };
  throw new HttpError(401, "not_member");
}

/* ---------------- state ---------------- */
const parse = (s) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
function state(g, who) {
  const pick = (r) => ({ ...r, i18n: parse(r.i18n), group_id: undefined });
  return {
    group: { id: g.id, code: g.code, title: g.title, ritual: g.ritual, date: g.date, side: g.side, rev: g.rev, created_at: g.created_at },
    me: { memberId: who.memberId, admin: who.admin, owner: who.owner },
    members: S.members.all(g.id),
    sections: S.sections.all(g.id).map(pick),
    entries: S.entries.all(g.id).map(pick),
    steps: S.steps.all(g.id).map(pick),
    // the activity log is for the admin (and an open-mode group owner) only
    activity: who.admin || who.owner ? S.activity.all(g.id) : [],
  };
}

/* ---------------- group operations (any member) ---------------- */
function must(row, code = "not_found") { if (!row) throw new HttpError(404, code); return row; }
function opMember(g, who, b) {
  const by = who.memberId, t = now(), gid = g.id;
  const log = (action, detail) => S.log.run(gid, by, action, String(detail || "").slice(0, 120), t, who.via || null);
  const text = (v, max = LIMITS.text) => { const c = clean(v, max); if (!c) throw bad("text"); return c; };
  const amount = (v) => { if (v === null || v === "" || v === undefined) return null; const n = Number(v); if (!Number.isInteger(n) || n < 0 || n > 1e9) throw bad("amount"); return n; };
  const assignee = (v) => { if (!v) return null; const m = S.member.get(String(v), gid); if (!m || m.removed) throw bad("assignee"); return m.id; };
  const side = (v) => (v === "b" || v === "g" ? v : "");
  const sec = (id) => must(q("SELECT * FROM sections WHERE id = ? AND group_id = ?").get(String(id), gid));
  const ent = (id) => must(q("SELECT * FROM entries WHERE id = ? AND group_id = ?").get(String(id), gid));
  const stp = (id) => must(q("SELECT * FROM steps WHERE id = ? AND group_id = ?").get(String(id), gid));
  const label = (r) => r.text || r.name;

  switch (b.op) {
    case "addSection": {
      const kind = b.kind === "todo" ? "todo" : "item";
      if (q("SELECT COUNT(*) n FROM sections WHERE group_id = ?").get(gid).n >= LIMITS.sections) throw bad("limit");
      const name = text(b.name, LIMITS.name);
      const pos = (q("SELECT MAX(pos) p FROM sections WHERE group_id = ? AND kind = ?").get(gid, kind).p ?? -1) + 1;
      const id = rid();
      q("INSERT INTO sections (id, group_id, kind, name, pos, created_by, created_at) VALUES (?,?,?,?,?,?,?)").run(id, gid, kind, name, pos, by, t);
      log("addSection", name); return { id };
    }
    case "editSection": { const s = sec(b.id); const name = text(b.name, LIMITS.name);
      q("UPDATE sections SET name = ?, i18n = NULL WHERE id = ?").run(name, s.id); log("editSection", name); return {}; }
    case "delSection": { const s = sec(b.id); if (!s.deleted_at) { q("UPDATE sections SET deleted_by = ?, deleted_at = ? WHERE id = ?").run(by, t, s.id); log("delSection", label(s)); } return {}; }
    case "restoreSection": { const s = sec(b.id); q("UPDATE sections SET deleted_by = NULL, deleted_at = NULL WHERE id = ?").run(s.id); log("restoreSection", label(s)); return {}; }

    case "addEntry": {
      const s = sec(b.sectionId); if (s.deleted_at) throw bad("section_deleted");
      if (q("SELECT COUNT(*) n FROM entries WHERE group_id = ?").get(gid).n >= LIMITS.entries) throw bad("limit");
      const tx_ = text(b.text);
      const pos = (q("SELECT MAX(pos) p FROM entries WHERE section_id = ?").get(s.id).p ?? -1) + 1;
      const id = rid();
      q("INSERT INTO entries (id, group_id, section_id, text, side, amount, assignee, pos, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .run(id, gid, s.id, tx_, side(b.side), amount(b.amount), assignee(b.assignee), pos, by, t);
      log("addEntry", tx_); return { id };
    }
    case "editEntry": {
      const e = ent(b.id);
      const nt = b.text === undefined ? null : text(b.text);
      const changedText = nt !== null && nt !== e.text;
      q("UPDATE entries SET text = ?, i18n = ?, amount = ?, assignee = ?, side = ?, updated_by = ?, updated_at = ? WHERE id = ?").run(
        changedText ? nt : e.text, changedText ? null : e.i18n,
        b.amount === undefined ? e.amount : amount(b.amount),
        b.assignee === undefined ? e.assignee : assignee(b.assignee),
        b.side === undefined ? e.side : side(b.side), by, t, e.id);
      log("editEntry", changedText ? nt : e.text); return {};
    }
    case "toggle": {
      const e = ent(b.id); if (e.deleted_at) throw bad("deleted");
      if (b.done) q("UPDATE entries SET done_by = ?, done_at = ? WHERE id = ?").run(by, t, e.id);
      else q("UPDATE entries SET done_by = NULL, done_at = NULL WHERE id = ?").run(e.id);
      log(b.done ? "done" : "undone", e.text); return {};
    }
    case "delEntry": { const e = ent(b.id); if (!e.deleted_at) { q("UPDATE entries SET deleted_by = ?, deleted_at = ? WHERE id = ?").run(by, t, e.id); log("delEntry", e.text); } return {}; }
    case "restoreEntry": { const e = ent(b.id); q("UPDATE entries SET deleted_by = NULL, deleted_at = NULL WHERE id = ?").run(e.id); log("restoreEntry", e.text); return {}; }

    case "addStep": {
      if (q("SELECT COUNT(*) n FROM steps WHERE group_id = ?").get(gid).n >= LIMITS.steps) throw bad("limit");
      const tx_ = text(b.text);
      const pos = (q("SELECT MAX(pos) p FROM steps WHERE group_id = ?").get(gid).p ?? -1) + 1;
      const id = rid();
      q("INSERT INTO steps (id, group_id, text, pos, created_by, created_at) VALUES (?,?,?,?,?,?)").run(id, gid, tx_, pos, by, t);
      log("addStep", tx_); return { id };
    }
    case "editStep": { const s = stp(b.id); const tx_ = text(b.text);
      if (tx_ !== s.text) q("UPDATE steps SET text = ?, i18n = NULL, updated_by = ?, updated_at = ? WHERE id = ?").run(tx_, by, t, s.id);
      log("editStep", tx_); return {}; }
    case "delStep": { const s = stp(b.id); if (!s.deleted_at) { q("UPDATE steps SET deleted_by = ?, deleted_at = ? WHERE id = ?").run(by, t, s.id); log("delStep", s.text); } return {}; }
    case "restoreStep": { const s = stp(b.id); q("UPDATE steps SET deleted_by = NULL, deleted_at = NULL WHERE id = ?").run(s.id); log("restoreStep", s.text); return {}; }
    case "moveStep": {
      const s = stp(b.id); const dir = b.dir === -1 ? -1 : 1;
      const other = q(`SELECT * FROM steps WHERE group_id = ? AND pos ${dir < 0 ? "<" : ">"} ? ORDER BY pos ${dir < 0 ? "DESC" : "ASC"} LIMIT 1`).get(gid, s.pos);
      if (other) { q("UPDATE steps SET pos = ? WHERE id = ?").run(other.pos, s.id); q("UPDATE steps SET pos = ? WHERE id = ?").run(s.pos, other.id); }
      return {};
    }

    case "editGroup": {
      const title = b.title === undefined ? g.title : text(b.title, LIMITS.title);
      const date = b.date === undefined ? g.date : String(b.date);
      if (!isDate(date)) throw bad("date");
      q("UPDATE groups SET title = ?, date = ? WHERE id = ?").run(title, date, gid);
      log("editGroup", title + (date ? " · " + date : "")); return {};
    }
    case "addMember": { // add someone by name before they join; they pick this name when they open the invite
      const name = text(b.name, LIMITS.name);
      if (S.countMembers.get(gid).n >= LIMITS.members) throw bad("limit");
      if (S.members.all(gid).some((m) => !m.removed && m.name.toLowerCase() === name.toLowerCase())) throw bad("member_exists");
      const id = rid(); S.insertMember.run(id, gid, name, t);
      log("addMember", name); return { id };
    }
    case "renameMe": {
      if (!by) throw bad("not_member");
      const name = text(b.name, LIMITS.name);
      q("UPDATE members SET name = ? WHERE id = ?").run(name, by); log("renameMe", name); return {};
    }
    default: throw bad("unknown_op");
  }
}

/* ---------------- group operations (admin / group owner only) ---------------- */
function opAdmin(g, who, b) {
  if (!who.admin && !who.owner) throw new HttpError(403, "admin_only");
  const gid = g.id, t = now();
  const log = (action, detail) => S.log.run(gid, who.memberId, action, String(detail || "").slice(0, 120), t, who.via || null);
  const delOnly = (table, id) => {
    const r = must(q(`SELECT * FROM ${table} WHERE id = ? AND group_id = ?`).get(String(id), gid));
    if (!r.deleted_at) throw bad("delete_first"); // permanent delete only after a soft delete
    q(`DELETE FROM ${table} WHERE id = ?`).run(r.id);
    return r.text || r.name;
  };
  switch (b.op) {
    case "purgeEntry": log("purge", delOnly("entries", b.id)); return {};
    case "purgeStep": log("purge", delOnly("steps", b.id)); return {};
    case "purgeSection": log("purge", delOnly("sections", b.id)); return {}; // its entries go with it (FK cascade)
    case "purgeAllDeleted": {
      const n = tx(() => ["entries", "steps", "sections"].reduce((a, tb) => a + Number(q(`DELETE FROM ${tb} WHERE group_id = ? AND deleted_at IS NOT NULL`).run(gid).changes), 0));
      log("purgeAll", String(n)); return { purged: n };
    }
    case "removeMember": {
      const m = must(S.member.get(String(b.id), gid));
      tx(() => { q("UPDATE members SET removed = 1 WHERE id = ?").run(m.id); q("DELETE FROM tokens WHERE member_id = ?").run(m.id); q("UPDATE entries SET assignee = NULL WHERE assignee = ?").run(m.id); });
      log("removeMember", m.name); return {};
    }
    case "rotateCode": {
      let code; do { code = newCode(); } while (S.groupByCode.get(code));
      q("UPDATE groups SET code = ? WHERE id = ?").run(code, gid); log("rotateCode", ""); return { code };
    }
    case "deleteGroup": {
      if (!who.admin) throw new HttpError(403, "admin_only");
      if (b.confirm !== g.title) throw bad("confirm");
      q("DELETE FROM groups WHERE id = ?").run(gid);
      const set = waiters.get(gid); if (set) { waiters.delete(gid); for (const fn of set) fn(-1); }
      return { deleted: true };
    }
    default: throw bad("unknown_op");
  }
}

/* ---------------- admin password (shared by login and the OAuth consent page) ---------------- */
async function checkAdminPassword(password, ip) {
  if (!ADMIN_ENABLED) throw new HttpError(403, "admin_disabled");
  if (!peek("login:" + ip, 5) || !peek("login:all", 30)) throw new HttpError(429, "too_many_attempts");
  if (typeof password !== "string" || !safeEqual(password, CFG.adminPassword)) {
    hit("login:" + ip, 5, 15 * 60_000); hit("login:all", 30, 15 * 60_000);
    console.warn(`[security] failed admin password from ${ip}`);
    await new Promise((r) => setTimeout(r, 400));
    throw new HttpError(401, "wrong_password");
  }
}

/* ---------------- creating a group (web and MCP) ---------------- */
function createGroup(b, admin) {
  if (S.countGroups.get().n >= CFG.maxGroups) throw bad("limit");
  const title = clean(b.title, LIMITS.title), name = clean(b.name, LIMITS.name);
  const r = TEMPLATES.get(String(b.ritual));
  const date = String(b.date || ""); const side = ["b", "g"].includes(b.side) ? b.side : "all";
  if (!title || !name || !r || !isDate(date)) throw bad("fields");
  const gid = rid(), mid = rid(), mt = token(), ownerT = admin ? null : token();
  let code; do { code = newCode(); } while (S.groupByCode.get(code));
  tx(() => {
    S.insertGroup.run(gid, code, title, r.id, date, side, admin ? 1 : 0, ownerT ? sha(ownerT) : null, now());
    S.insertMember.run(mid, gid, name, now());
    S.insertToken.run(sha(mt), mid, gid, now(), now());
    seedGroup(gid, r, side, mid);
    S.log.run(gid, mid, "create", title, now(), b.via || null);
  });
  return { groupId: gid, code, token: mt, memberId: mid, ownerToken: ownerT };
}

/* ---------------- HTTP plumbing ---------------- */
function clientIp(req) {
  if (CFG.trustProxy) { const x = req.headers["x-forwarded-for"]; if (typeof x === "string" && x) return x.split(",")[0].trim().slice(0, 64); }
  return req.socket.remoteAddress || "?";
}
const BASE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};
function send(res, status, body, extra = {}) {
  const json = typeof body !== "string";
  const data = json ? JSON.stringify(body) : body;
  res.writeHead(status, {
    ...BASE_HEADERS,
    "Content-Type": json ? "application/json; charset=utf-8" : "text/html; charset=utf-8",
    "Cache-Control": json ? "no-store" : "no-cache",
    "Content-Length": Buffer.byteLength(data),
    ...(json ? { "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'" } : { "Content-Security-Policy": CSP }),
    ...extra,
  });
  res.end(data);
}
function readJson(req, max = 16 * 1024) {
  return new Promise((resolve, reject) => {
    const ct = String(req.headers["content-type"] || "");
    if (!ct.startsWith("application/json")) return reject(new HttpError(415, "json_only"));
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > max) { reject(new HttpError(413, "too_large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { const v = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); if (!v || typeof v !== "object" || Array.isArray(v)) throw 0; resolve(v); } catch { reject(bad("bad_json")); } });
    req.on("error", reject);
  });
}

async function route(req, res) {
  const url = new URL(req.url, "http://x");
  const p = url.pathname, m = req.method, ip = clientIp(req);

  if (m === "GET" && (p === "/" || p === "/index.html")) return send(res, 200, PAGE);
  if (p === "/mcp" || p.startsWith("/.well-known/oauth-") || p.startsWith("/oauth/") || p.startsWith("/api/admin/mcp")) {
    if (!hit("api:" + ip, 600, 60_000)) throw new HttpError(429, "slow_down");
    return MCP.handle(req, res, url, ip);
  }
  if (!p.startsWith("/api/")) return send(res, 404, { error: "not_found" });

  // general per-IP ceiling for the whole API
  if (!hit("api:" + ip, 600, 60_000)) throw new HttpError(429, "slow_down");

  if (m === "GET" && p === "/api/health") return send(res, 200, { ok: true, app: "lagna", admin: ADMIN_ENABLED, openCreate: CFG.openCreate, rituals: [...TEMPLATES.keys()] });

  /* ---- admin session ---- */
  if (m === "POST" && p === "/api/admin/login") {
    if (!ADMIN_ENABLED) throw new HttpError(403, "admin_disabled");
    const b = await readJson(req);
    await checkAdminPassword(b.password, ip);
    const t = token();
    q("DELETE FROM admin_sessions WHERE expires_at < ?").run(now());
    q("INSERT INTO admin_sessions (hash, created_at, expires_at) VALUES (?,?,?)").run(sha(t), now(), now() + ADMIN_SESSION_MS);
    console.log(`[security] admin login from ${ip}`);
    return send(res, 200, { token: t });
  }
  if (m === "POST" && p === "/api/admin/logout") {
    const t = req.headers["x-admin-token"]; if (typeof t === "string") q("DELETE FROM admin_sessions WHERE hash = ?").run(sha(t));
    return send(res, 200, { ok: true });
  }
  if (m === "GET" && p === "/api/admin/me") return send(res, 200, { admin: isAdmin(req) });
  if (m === "GET" && p === "/api/admin/groups") {
    if (!isAdmin(req)) throw new HttpError(403, "admin_only");
    return send(res, 200, { groups: q("SELECT g.id, g.code, g.title, g.ritual, g.date, g.created_at, (SELECT COUNT(*) FROM members m WHERE m.group_id = g.id AND m.removed = 0) members FROM groups g ORDER BY g.created_at DESC").all() });
  }

  /* ---- create a group ---- */
  if (m === "POST" && p === "/api/groups") {
    const admin = isAdmin(req);
    if (!admin && !CFG.openCreate) throw new HttpError(403, "admin_only");
    if (!admin && !hit("create:" + ip, 5, 3600_000)) throw new HttpError(429, "too_many_groups");
    const b = await readJson(req);
    return send(res, 200, createGroup({ title: b.title, name: b.name, ritual: b.ritual, date: b.date, side: b.side }, admin));
  }

  /* ---- join with a code ---- */
  if (m === "POST" && p === "/api/join") {
    if (!peek("join:" + ip, 15) || !peek("join:all", 300)) throw new HttpError(429, "too_many_attempts");
    const b = await readJson(req);
    const g = S.groupByCode.get(normCode(b.code));
    if (!g) { hit("join:" + ip, 15, 10 * 60_000); hit("join:all", 300, 10 * 60_000); await new Promise((r) => setTimeout(r, 300)); throw new HttpError(404, "wrong_code"); }
    if (!b.name && !b.memberId) // preview: who is in it
      return send(res, 200, { group: { id: g.id, title: g.title, ritual: g.ritual, date: g.date }, members: S.members.all(g.id).filter((x) => !x.removed).map(({ id, name }) => ({ id, name })) });
    if (!hit("joined:" + ip, 30, 3600_000)) throw new HttpError(429, "too_many_attempts");
    let mid;
    if (b.memberId) { const mem = S.member.get(String(b.memberId), g.id); if (!mem || mem.removed) throw bad("member"); mid = mem.id; }
    else {
      const name = clean(b.name, LIMITS.name); if (!name) throw bad("name");
      if (S.countMembers.get(g.id).n >= LIMITS.members) throw bad("limit");
      mid = rid(); S.insertMember.run(mid, g.id, name, now());
    }
    const t = token();
    S.insertToken.run(sha(t), mid, g.id, now(), now());
    S.log.run(g.id, mid, "join", "", now(), null); bump(g.id);
    return send(res, 200, { groupId: g.id, token: t, memberId: mid });
  }

  /* ---- a group ---- */
  const gm = p.match(/^\/api\/g\/([a-z2-9]{12})(\/[a-z]+)?$/);
  if (gm) {
    const g = S.groupById.get(gm[1]);
    if (!g) throw new HttpError(404, "no_group");
    const who = groupAuth(req, g);
    const sub = gm[2] || "";
    if (m === "GET" && sub === "") return send(res, 200, state(g, who));
    if (m === "GET" && sub === "/wait") {
      const since = +url.searchParams.get("rev") || 0;
      if (g.rev !== since) return send(res, 200, { rev: g.rev });
      if (!hit("wait:" + ip, 120, 60_000)) throw new HttpError(429, "slow_down");
      let done = false; const set = waiters.get(g.id) || new Set(); waiters.set(g.id, set);
      const finish = (rev) => { if (done) return; done = true; clearTimeout(timer); set.delete(finish); if (!res.writableEnded) send(res, 200, { rev }); };
      const timer = setTimeout(() => finish(g.rev), 25_000);
      set.add(finish); res.on("close", () => { done = true; clearTimeout(timer); set.delete(finish); });
      return;
    }
    if (m === "POST" && (sub === "/op" || sub === "/admin")) {
      if (!hit("write:" + (who.tokenHash || ip), 240, 60_000)) throw new HttpError(429, "slow_down");
      const b = await readJson(req);
      if (typeof b.op !== "string") throw bad("op");
      const out = sub === "/op" ? opMember(g, who, b) : opAdmin(g, who, b);
      const rev = b.op === "deleteGroup" ? -1 : bump(g.id);
      return send(res, 200, { ok: true, rev, ...out });
    }
    if (m === "POST" && sub === "/leave") {
      if (who.tokenHash) q("DELETE FROM tokens WHERE hash = ?").run(who.tokenHash);
      return send(res, 200, { ok: true });
    }
  }
  return send(res, 404, { error: "not_found" });
}

const MCP = require("./mcp")({
  db, q, S, tx, now, sha, rid, token, clean, isDate, normCode, hit, peek, HttpError, bad, send, readJson,
  CFG, LIMITS, TEMPLATES, ADMIN_ENABLED, isAdmin, checkAdminPassword, createGroup, opMember, opAdmin, bump, state,
});

const server = http.createServer((req, res) => {
  route(req, res).catch((e) => {
    if (res.headersSent) return res.destroy();
    if (e instanceof HttpError) return send(res, e.status, { error: e.code });
    console.error("[error]", e && e.stack || e);
    send(res, 500, { error: "server_error" });
  });
});
server.headersTimeout = 15_000;
server.requestTimeout = 30_000;
server.keepAliveTimeout = 30_000;

if (require.main === module) {
  if (!ADMIN_ENABLED) console.warn("[warn] ADMIN_PASSWORD is missing or shorter than 12 characters: admin features are off, so nobody can create groups.");
  server.listen(CFG.port, CFG.host, () => console.log(`lagna listening on http://${CFG.host}:${CFG.port} (${TEMPLATES.size} rituals, data in ${CFG.dataDir})`));
  const stop = () => { server.close(); try { db.close(); } catch {} process.exit(0); };
  process.on("SIGTERM", stop); process.on("SIGINT", stop);
}

module.exports = { server, db, CFG, TEMPLATES, newCode };
