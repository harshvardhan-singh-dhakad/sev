import { cookies } from 'next/headers';
import { execute, queryFirst } from '@/lib/db';
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
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const encoder = new TextEncoder();

function randomHex(bytesLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLength));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

/** Web Crypto equivalent of Node's PBKDF2-SHA512; safe in a Worker. */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const finalSalt = salt || randomHex(16);
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(finalSalt),
      iterations: 100000,
      hash: 'SHA-512',
    },
    passwordKey,
    512
  );
  return { hash: toHex(bits), salt: finalSalt };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, storedSalt);
  return constantTimeEqual(hash, storedHash);
}

export async function checkLoginRateLimit(
  identifier: string
): Promise<{ isLocked: boolean; lockTimeRemainingMinutes?: number }> {
  const row = await queryFirst<{ attempts: number; locked_until: string | null }>(
    'SELECT attempts, locked_until FROM login_attempts WHERE identifier = ?',
    [identifier]
  );

  if (!row) return { isLocked: false };
  if (row.locked_until) {
    const lockedUntil = new Date(row.locked_until).getTime();
    if (Date.now() < lockedUntil) {
      return { isLocked: true, lockTimeRemainingMinutes: Math.ceil((lockedUntil - Date.now()) / 60000) };
    }
    await execute('DELETE FROM login_attempts WHERE identifier = ?', [identifier]);
  }
  return { isLocked: false };
}

export async function recordLoginAttempt(identifier: string, success: boolean): Promise<void> {
  if (success) {
    await execute('DELETE FROM login_attempts WHERE identifier = ?', [identifier]);
    return;
  }

  const row = await queryFirst<{ attempts: number }>(
    'SELECT attempts FROM login_attempts WHERE identifier = ?',
    [identifier]
  );
  const now = new Date().toISOString();

  if (!row) {
    await execute(
      'INSERT INTO login_attempts (id, identifier, attempts, last_attempt_at) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), identifier, 1, now]
    );
    return;
  }

  const attempts = row.attempts + 1;
  const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
    ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
    : null;
  await execute(
    'UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt_at = ? WHERE identifier = ?',
    [attempts, lockedUntil, now, identifier]
  );
}

export function createSessionToken(): string {
  return randomHex(32);
}

export async function hashToken(token: string): Promise<string> {
  return sha256(token);
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const token = createSessionToken();
  const now = new Date();
  await execute(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, user_agent, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      userId,
      await hashToken(token),
      new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
      userAgent || null,
      ipAddress || null,
      now.toISOString(),
    ]
  );
  return token;
}

export async function validateSessionToken(token: string): Promise<AdminUser | null> {
  if (!token) return null;

  const row = await queryFirst<AdminUser & { session_id: string; expires_at: string }>(
    `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.name, u.role,
            u.totp_enabled, u.is_active, u.created_at
       FROM sessions s JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ? AND u.is_active = 1`,
    [await hashToken(token)]
  );

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await execute('DELETE FROM sessions WHERE id = ?', [row.session_id]);
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

export async function destroySession(token: string): Promise<void> {
  if (token) await execute('DELETE FROM sessions WHERE token_hash = ?', [await hashToken(token)]);
}

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
  return sessionCookie?.value ? validateSessionToken(sessionCookie.value) : null;
}

export { SESSION_COOKIE_NAME };
