/**
 * CLI script to bootstrap or reset the Owner administrator
 * Usage: node scripts/seed-admin.js <email> <password>
 */

const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const email = process.argv[2] || process.env.ADMIN_OWNER_EMAIL || 'owner@rasvat.in';
const password = process.argv[3] || process.env.ADMIN_OWNER_PASSWORD || 'RasvatOwner@2026';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'rasvat.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Ensure users table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'editor', 'support')),
    totp_secret TEXT,
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Hash password
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
const now = new Date().toISOString();

const existing = db.prepare("SELECT id FROM users WHERE role = 'owner'").get();

if (existing) {
  db.prepare(`
    UPDATE users SET email = ?, password_hash = ?, salt = ?, updated_at = ? WHERE id = ?
  `).run(email, hash, salt, now, existing.id);
  console.log(`[OK] Owner user updated successfully: ${email}`);
} else {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, email, hash, salt, 'Rasvat Owner', 'owner', 0, 1, now, now);
  console.log(`[OK] Owner user created successfully: ${email}`);
}
