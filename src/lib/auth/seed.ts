import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { hashPassword } from './session';
import { Role } from './permissions';

export function ensureOwnerUser(
  email: string = process.env.ADMIN_OWNER_EMAIL || 'owner@rasvat.in',
  password: string = process.env.ADMIN_OWNER_PASSWORD || 'RasvatOwner@2026'
): { created: boolean; id: string; email: string } {
  const db = getDb();
  const existingOwner = db.prepare("SELECT id, email FROM users WHERE role = 'owner'").get() as {
    id: string;
    email: string;
  } | undefined;

  if (existingOwner) {
    return { created: false, id: existingOwner.id, email: existingOwner.email };
  }

  const { hash, salt } = hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, email.toLowerCase().trim(), hash, salt, 'Rasvat Owner', 'owner', 0, 1, now, now);

  return { created: true, id, email };
}

export function createStaffUser(params: {
  email: string;
  name: string;
  password: string;
  role: Role;
}): { id: string; email: string } {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(params.email.toLowerCase().trim());
  if (existing) {
    throw new Error(`User with email '${params.email}' already exists`);
  }

  const { hash, salt } = hashPassword(params.password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, params.email.toLowerCase().trim(), hash, salt, params.name, params.role, 0, 1, now, now);

  return { id, email: params.email };
}
