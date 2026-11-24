"use strict";
// SQLite storage (Node's built-in node:sqlite, no native add-ons to compile on the Pi).
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS groups (
  id          TEXT PRIMARY KEY,           -- internal id, used in URLs; gives no access by itself
  code        TEXT NOT NULL UNIQUE,       -- the join code people type (secret)
  title       TEXT NOT NULL,
  ritual      TEXT NOT NULL,
  date        TEXT NOT NULL DEFAULT '',
  side        TEXT NOT NULL DEFAULT 'all',
  owner_admin INTEGER NOT NULL DEFAULT 1, -- created by the site admin
  owner_hash  TEXT,                       -- owner token hash when created in open mode
  rev         INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  removed    INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS members_group ON members(group_id);

CREATE TABLE IF NOT EXISTS tokens (       -- one per device that joined; only the SHA-256 is stored
  hash       TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_seen  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tokens_member ON tokens(member_id);

CREATE TABLE IF NOT EXISTS sections (     -- a "type": a heading that groups items or to-dos
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('item','todo')),
  name       TEXT NOT NULL,
  i18n       TEXT,                        -- JSON [gu,en,hi] while it is still the template text
  pos        REAL NOT NULL,
  created_by TEXT, created_at INTEGER NOT NULL,
  deleted_by TEXT, deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS sections_group ON sections(group_id);

CREATE TABLE IF NOT EXISTS entries (      -- an item or a to-do
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  i18n       TEXT,
  side       TEXT NOT NULL DEFAULT '',
  amount     INTEGER,
  assignee   TEXT,
  pos        REAL NOT NULL,
  done_by    TEXT, done_at INTEGER,
  created_by TEXT, created_at INTEGER NOT NULL,
  updated_by TEXT, updated_at INTEGER,
  deleted_by TEXT, deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS entries_group ON entries(group_id);

CREATE TABLE IF NOT EXISTS steps (        -- the ritual's steps (vidhi)
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  i18n       TEXT,
  pos        REAL NOT NULL,
  created_by TEXT, created_at INTEGER NOT NULL,
  updated_by TEXT, updated_at INTEGER,
  deleted_by TEXT, deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS steps_group ON steps(group_id);

CREATE TABLE IF NOT EXISTS activity (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id  TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id TEXT,                         -- NULL = admin
  action    TEXT NOT NULL,
  detail    TEXT NOT NULL DEFAULT '',
  at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS activity_group ON activity(group_id, id);

CREATE TABLE IF NOT EXISTS admin_sessions (
  hash       TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
`;

function open(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "lagna.db"));
  db.exec(SCHEMA);
  return db;
}

module.exports = { open };
