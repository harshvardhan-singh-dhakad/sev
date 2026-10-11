import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { Role } from './permissions';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  totp_enabled: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

const SESSION_COOKIE_NAME = 'rasvat_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const { hash } = hashPassword(password, storedSalt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export function checkLoginRateLimit(identifier: string): { isLocked: boolean; lockTimeRemainingMinutes?: number } {
  const db = getDb();
  const row = db.prepare('SELECT attempts, locked_until FROM login_attempts WHERE identifier = ?').get(identifier) as {
    attempts: number;
    locked_until?: string;
  } | undefined;

  if (!row) return { isLocked: false };

  if (row.locked_until) {
    const lockedUntil = new Date(row.locked_until).getTime();
    const now = Date.now();
    if (now < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil - now) / 60000);
      return { isLocked: true, lockTimeRemainingMinutes: remainingMinutes };
    } else {
      // Lock expired, reset
      db.prepare('DELETE FROM login_attempts WHERE identifier = ?').run(identifier);
      return { isLocked: false };
    }
  }

  return { isLocked: false };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  const db = getDb();
  if (success) {
    db.prepare('DELETE FROM login_attempts WHERE identifier = ?').run(identifier);
    return;
  }

  const now = new Date().toISOString();
  const row = db.prepare('SELECT attempts FROM login_attempts WHERE identifier = ?').get(identifier) as {
    attempts: number;
  } | undefined;

  if (!row) {
    db.prepare('INSERT INTO login_attempts (id, identifier, attempts, last_attempt_at) VALUES (?, ?, ?, ?)').run(
      crypto.randomUUID(),
      identifier,
      1,
      now
    );
  } else {
    const newAttempts = row.attempts + 1;
    let lockedUntil: string | null = null;
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    }
    db.prepare(
      'UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt_at = ? WHERE identifier = ?'
    ).run(newAttempts, lockedUntil, now, identifier);
  }
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createSession(userId: string, userAgent?: string, ipAddress?: string): string {
  const db = getDb();
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, user_agent, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, tokenHash, expiresAt, userAgent || null, ipAddress || null, createdAt);

  return token;
}

export function validateSessionToken(token: string): AdminUser | null {
  if (!token) return null;
  const db = getDb();
  const tokenHash = hashToken(token);

  const row = db.prepare(`
    SELECT s.id as session_id, s.expires_at, u.id, u.email, u.name, u.role, u.totp_enabled, u.is_active, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND u.is_active = 1
  `).get(tokenHash) as (AdminUser & { session_id: string; expires_at: string }) | undefined;

  if (!row) return null;

  // Check expiration
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(row.session_id);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    totp_enabled: Boolean(row.totp_enabled),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
  };
}

export function destroySession(token: string): void {
  const db = getDb();
  const tokenHash = hashToken(token);
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

/**
 * Server-side helper to read the current authenticated admin user from Next.js request cookies.
 */
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  return validateSessionToken(sessionCookie.value);
}

export { SESSION_COOKIE_NAME };
