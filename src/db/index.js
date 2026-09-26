import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema.js";

const dbPath = path.join(process.cwd(), "data", "fahmidas.db");

// `next build`'s "Collecting page data" step imports every API route file —
// across several parallel worker processes — purely to statically analyze
// it. It never actually calls the route handlers, so none of them need a
// real connection to the real database file. Previously this module always
// opened the real file and ran PRAGMA/migration statements at import time,
// so every one of those parallel workers raced to touch the same file and
// several would fail with SQLITE_BUSY ("database is locked").
//
// During the build phase we instead give each worker its own private,
// in-memory database. Nothing touches disk, so there is nothing to
// contend over. The real file (with real data and real migrations) is
// only ever opened once the server actually starts serving requests.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

let sqlite;

if (isBuildPhase) {
  sqlite = new Database(":memory:");
} else {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  // Without this, a second connection that hits the database while another
  // connection briefly holds a write lock fails immediately with
  // "SQLITE_BUSY: database is locked" instead of waiting a moment and
  // retrying.
  sqlite.pragma("busy_timeout = 5000");

  // Always ensure the base schema exists. init.sql uses CREATE TABLE IF NOT
  // EXISTS for every table, so this is safe to run on every boot — it fixes
  // "no such table: products" style errors on a fresh/empty Railway volume,
  // without requiring `npm run db:seed` to have been run manually first.
  try {
    const initSqlPath = path.join(process.cwd(), "src", "db", "init.sql");
    if (fs.existsSync(initSqlPath)) {
      const initSql = fs.readFileSync(initSqlPath, "utf-8");
      sqlite.exec(initSql);
    }
  } catch (e) {
    console.error("Failed to auto-initialize database schema:", e);
  }

  // Safe auto-migration for databases created before the color_images column existed.
  try {
    sqlite.exec("ALTER TABLE products ADD COLUMN color_images TEXT NOT NULL DEFAULT '{}'");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before the compare_at_price column existed.
  try {
    sqlite.exec("ALTER TABLE products ADD COLUMN compare_at_price REAL");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before the admin_role column existed.
  try {
    sqlite.exec("ALTER TABLE users ADD COLUMN admin_role TEXT");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before the avatar_url column existed
  // (profile photo, used by the admin panel's "My Profile" page).
  try {
    sqlite.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before customer-facing account
  // profile fields (date of birth, gender) existed.
  try {
    sqlite.exec("ALTER TABLE users ADD COLUMN date_of_birth TEXT");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }
  try {
    sqlite.exec("ALTER TABLE users ADD COLUMN gender TEXT");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before categories had an image_url column.
  try {
    sqlite.exec("ALTER TABLE categories ADD COLUMN image_url TEXT NOT NULL DEFAULT ''");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before banners had a placement column
  // ("hero" = top slider, "promo" = the single strip banner further down the homepage).
  try {
    sqlite.exec("ALTER TABLE banners ADD COLUMN placement TEXT NOT NULL DEFAULT 'hero'");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before banners had an eyebrow column.
  try {
    sqlite.exec("ALTER TABLE banners ADD COLUMN eyebrow TEXT NOT NULL DEFAULT ''");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration for databases created before banners had text/button
  // position columns (one of 9 anchor points: top-left..bottom-right, or
  // middle-center), letting an admin move the overlay text and CTA button
  // independently so they don't clash with a pre-designed image.
  try {
    sqlite.exec("ALTER TABLE banners ADD COLUMN text_position TEXT NOT NULL DEFAULT 'middle-left'");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }
  try {
    sqlite.exec("ALTER TABLE banners ADD COLUMN button_position TEXT NOT NULL DEFAULT 'bottom-left'");
  } catch (e) {
    // Column already exists (or table not created yet) - ignore.
  }

  // Safe auto-migration: create the password_resets table if it doesn't exist yet.
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
  `);

  // Safe auto-migration: create the newsletter_subscribers table if it doesn't exist yet.
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );
  `);
}

export const db = drizzle(sqlite, { schema });
export { sqlite };

// --- Graceful shutdown ---------------------------------------------------
// better-sqlite3 keeps native (C++) Statement handles open. If the Node
// process exits (SIGTERM/SIGINT from Railway on redeploy/restart, or a
// normal `exit`) before those handles are closed, Node's environment
// cleanup can run after the native addon's cleanup hook fires, which
// crashes the process with:
//   Assertion failed: (env) != nullptr
//   node::RemoveEnvironmentCleanupHook(...)
//   Statement::~Statement()
// Explicitly closing the database on every shutdown path avoids this.
let dbClosed = false;
function closeDb() {
  if (dbClosed) return;
  dbClosed = true;
  try {
    sqlite.close();
  } catch (e) {
    // Already closed or closing failed — nothing more we can do here.
  }
}

process.once("exit", closeDb);
process.once("SIGINT", () => {
  closeDb();
  process.exit(0);
});
process.once("SIGTERM", () => {
  closeDb();
  process.exit(0);
});
