import crypto from 'node:crypto';
import { getDb } from '@/lib/db';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string; // e.g. 'create', 'update', 'delete', 'price_change', 'stock_change', 'role_change', 'settings_change'
  entity_type: string; // e.g. 'product', 'variant', 'category', 'user', 'settings', 'media'
  entity_id: string;
  changes_before: Record<string, unknown> | null;
  changes_after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export function logAuditEvent(entry: {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changesBefore?: Record<string, unknown> | null;
  changesAfter?: Record<string, unknown> | null;
  ipAddress?: string | null;
}): void {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, user_name, user_role, action, entity_type, entity_id,
        changes_before, changes_after, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.userId || null,
      entry.userName || null,
      entry.userRole || null,
      entry.action,
      entry.entityType,
      entry.entityId,
      entry.changesBefore ? JSON.stringify(entry.changesBefore) : null,
      entry.changesAfter ? JSON.stringify(entry.changesAfter) : null,
      entry.ipAddress || null,
      now
    );
  } catch (err) {
    console.error('Failed to append to audit log:', err);
  }
}

export function listAuditLogs(filters: {
  entityType?: string;
  action?: string;
  userId?: string;
  limit?: number;
  offset?: number;
} = {}): { logs: AuditLogEntry[]; total: number } {
  const db = getDb();
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.entityType) {
    conditions.push('entity_type = ?');
    params.push(filters.entityType);
  }
  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }
  if (filters.userId) {
    conditions.push('user_id = ?');
    params.push(filters.userId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`).get(...params) as { count: number };
  const total = countRow ? countRow.count : 0;

  const rows = db.prepare(`
    SELECT * FROM audit_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Record<string, unknown>[];

  const logs: AuditLogEntry[] = rows.map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string | null,
    user_name: r.user_name as string | null,
    user_role: r.user_role as string | null,
    action: r.action as string,
    entity_type: r.entity_type as string,
    entity_id: r.entity_id as string,
    changes_before: r.changes_before ? JSON.parse(r.changes_before as string) : null,
    changes_after: r.changes_after ? JSON.parse(r.changes_after as string) : null,
    ip_address: r.ip_address as string | null,
    created_at: r.created_at as string,
  }));

  return { logs, total };
}
