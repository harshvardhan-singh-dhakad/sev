/**
 * Cloudflare Worker database facade.
 *
 * The previous implementation opened a `node:sqlite` file under `data/`.
 * Workers do not have a persistent local filesystem, so importing it made
 * deployed routes fail with Error 1101. All execution now stays on D1.
 */
import { d1Batch, d1Execute, d1Query, type SqlStatement } from '@/lib/d1';

export type SqlValue = string | number | boolean | null;
export type { SqlStatement };

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = []
): Promise<T[]> {
  return (await d1Query<T>(sql, params)).results;
}

export async function queryFirst<T = Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params: SqlValue[] = []
): Promise<{ changes: number }> {
  return d1Execute(sql, params);
}

export async function batch(statements: SqlStatement[]): Promise<void> {
  return d1Batch(statements);
}
