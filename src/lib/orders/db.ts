/**
 * Unified Orders DB Interface
 * Supports atomic transactions across local SQLite (Node.js test/dev) and Cloudflare D1 (Edge Worker).
 */

import { getDb, query as localQuery } from '@/lib/db';
import { d1Batch, d1Query } from '@/lib/d1';

export interface SqlStatement {
  sql: string;
  params?: (string | number | boolean | null)[];
}

/**
 * Checks whether to execute via Cloudflare D1 API or local SQLite.
 */
function isCloudflareD1(): boolean {
  return (
    process.env.USE_D1 === 'true' &&
    Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
  );
}

/**
 * Executes a single read query returning an array of rows.
 */
export async function orderDbQuery<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  if (isCloudflareD1()) {
    const res = await d1Query<T>(sql, params);
    return res.results;
  }

  return localQuery<T>(sql, params);
}

/**
 * Executes a single read query returning the first matching row or null.
 */
export async function orderDbQueryFirst<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T | null> {
  const rows = await orderDbQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Executes an atomic batch of SQL statements.
 * If any statement fails (e.g. negative stock check constraint), the entire batch rolls back.
 */
export async function orderDbBatch(statements: SqlStatement[]): Promise<void> {
  if (isCloudflareD1()) {
    await d1Batch(statements);
    return;
  }

  // Local SQLite atomic transaction
  const db = getDb();
  db.exec('BEGIN IMMEDIATE;');
  try {
    for (const stmt of statements) {
      db.prepare(stmt.sql).run(...(stmt.params || []));
    }
    db.exec('COMMIT;');
  } catch (error) {
    try {
      db.exec('ROLLBACK;');
    } catch {
      // Ignored if rollback already happened
    }
    throw error;
  }
}

/**
 * Executes a single write statement.
 */
export async function orderDbExecute(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ changes: number }> {
  if (isCloudflareD1()) {
    const res = await d1Query(sql, params);
    return { changes: res.meta?.changes ?? 1 };
  }

  const db = getDb();
  const info = db.prepare(sql).run(...params);
  return { changes: Number(info.changes) };
}
