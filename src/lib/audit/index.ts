import { execute, query, queryFirst } from '@/lib/db';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes_before: Record<string, unknown> | null;
  changes_after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export async function logAuditEvent(entry: {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changesBefore?: Record<string, unknown> | null;
  changesAfter?: Record<string, unknown> | null;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (
        id, user_id, user_name, user_role, action, entity_type, entity_id,
        changes_before, changes_after, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        entry.userId || null,
        entry.userName || null,
        entry.userRole || null,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.changesBefore ? JSON.stringify(entry.changesBefore) : null,
        entry.changesAfter ? JSON.stringify(entry.changesAfter) : null,
        entry.ipAddress || null,
        new Date().toISOString(),
      ]
    );
  } catch (error) {
    // Audit failures must be visible without making a successful user action fail.
    console.error('Failed to append to audit log:', error);
  }
}

export async function listAuditLogs(filters: {
  entityType?: string;
  action?: string;
  userId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit || 50, 1), 100);
  const offset = Math.max(filters.offset || 0, 0);
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

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const count = await queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
    params
  );
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    total: Number(count?.count || 0),
    logs: rows.map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string | null,
      user_name: row.user_name as string | null,
      user_role: row.user_role as string | null,
      action: row.action as string,
      entity_type: row.entity_type as string,
      entity_id: row.entity_id as string,
      changes_before: row.changes_before ? JSON.parse(row.changes_before as string) : null,
      changes_after: row.changes_after ? JSON.parse(row.changes_after as string) : null,
      ip_address: row.ip_address as string | null,
      created_at: row.created_at as string,
    })),
  };
}
