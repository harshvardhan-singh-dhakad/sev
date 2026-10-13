/**
 * Unified Orders DB Interface
 * Supports atomic transactions across local SQLite (Node.js test/dev) and Cloudflare D1 (Edge Worker).
 */

import { d1Batch, d1Execute, d1Query } from '@/lib/d1';

export interface SqlStatement {
  sql: string;
  params?: (string | number | boolean | null)[];
}

/**
 * Executes a single read query returning an array of rows.
 */
export async function orderDbQuery<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const res = await d1Query<T>(sql, params);
  return res.results;
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
  await d1Batch(statements);
}

/**
 * Executes a single write statement.
 */
export async function orderDbExecute(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ changes: number }> {
  return d1Execute(sql, params);
}
