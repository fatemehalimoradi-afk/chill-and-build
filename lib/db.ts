import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "hackathon.db");

const globalForDb = globalThis as unknown as { _db: Database.Database | undefined };

function openDb() {
  const fs = require("fs");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Base tables (never changes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password     TEXT    NOT NULL,
      display_name TEXT,
      role         TEXT,
      tshirt       TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id   INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (team_id, user_id),
      UNIQUE (user_id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT    NOT NULL UNIQUE,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT    NOT NULL
    );
  `);

  // Migration: replace old invitations table (had NOT NULL team_id)
  // with new schema where team_id is nullable (team created on acceptance)
  const version = (db.pragma("user_version") as { user_version: number }[])[0].user_version;

  if (version < 1) {
    db.exec(`
      DROP TABLE IF EXISTS invitations;
      CREATE TABLE invitations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id     INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        inviter_id  INTEGER NOT NULL REFERENCES users(id),
        invitee_id  INTEGER NOT NULL REFERENCES users(id),
        token       TEXT    NOT NULL UNIQUE,
        status      TEXT    NOT NULL DEFAULT 'pending',
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        expires_at  TEXT    NOT NULL
      );
      PRAGMA user_version = 1;
    `);
  }

  return db;
}

export const db: Database.Database =
  globalForDb._db ?? (globalForDb._db = openDb());
