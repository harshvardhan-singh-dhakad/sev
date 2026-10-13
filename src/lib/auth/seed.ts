import { execute, queryFirst } from '@/lib/db';
import { hashPassword } from './session';
import { Role } from './permissions';

/** Seed helpers for D1 migrations or an authenticated setup route. */
export async function ensureOwnerUser(
  email: string = process.env.ADMIN_OWNER_EMAIL || 'owner@rasvat.in',
  password: string = process.env.ADMIN_OWNER_PASSWORD || 'RasvatOwner@2026'
): Promise<{ created: boolean; id: string; email: string }> {
  const existing = await queryFirst<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE role = 'owner' LIMIT 1"
  );
  if (existing) return { created: false, id: existing.id, email: existing.email };

  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const cleanEmail = email.toLowerCase().trim();
  await execute(
    `INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'owner', 0, 1, ?, ?)`,
    [id, cleanEmail, hash, salt, 'Rasvat Owner', now, now]
  );
  return { created: true, id, email: cleanEmail };
}

export async function createStaffUser(params: {
  email: string;
  name: string;
  password: string;
  role: Role;
}): Promise<{ id: string; email: string }> {
  const email = params.email.toLowerCase().trim();
  if (await queryFirst<{ id: string }>('SELECT id FROM users WHERE email = ?', [email])) {
    throw new Error(`User with email '${email}' already exists`);
  }

  const { hash, salt } = await hashPassword(params.password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`,
    [id, email, hash, salt, params.name, params.role, now, now]
  );
  return { id, email };
}
