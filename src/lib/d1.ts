import { getCloudflareContext } from '@opennextjs/cloudflare';

type SqlValue = string | number | boolean | null;

interface D1Meta {
  changes?: number;
  last_row_id?: number;
  rows_read?: number;
  rows_written?: number;
  duration?: number;
}

interface D1AllResult<T> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

interface D1Statement {
  bind(...values: SqlValue[]): D1Statement;
  all<T>(): Promise<D1AllResult<T>>;
  run(): Promise<{ success: boolean; meta: D1Meta }>;
}

interface D1Binding {
  prepare(sql: string): D1Statement;
  batch<T>(statements: D1Statement[]): Promise<Array<D1AllResult<T> | { success: boolean; meta: D1Meta }>>;
}

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

export interface SqlStatement {
  sql: string;
  params?: SqlValue[];
}

/**
 * Gets the D1 binding injected into the Worker by Wrangler.
 * A Worker must use this binding instead of the Cloudflare REST API.
 *
 * Throws a structured error with `status: 503` and `code: 'D1_BINDING_MISSING'`
 * so API routes can return an appropriate HTTP response instead of crashing
 * the Worker with an unhandled exception (Error 1101 / HTTP 500).
 */
async function getD1(): Promise<D1Binding> {
  let context: Awaited<ReturnType<typeof getCloudflareContext>>;

  try {
    context = await getCloudflareContext({ async: true });
  } catch (ctxError) {
    const message = ctxError instanceof Error ? ctxError.message : String(ctxError);
    throw Object.assign(
      new Error(`D1: Failed to obtain Cloudflare request context. ${message}`),
      { status: 503, code: 'CF_CONTEXT_UNAVAILABLE' }
    );
  }

  const db = (context.env as Record<string, unknown>).DB as D1Binding | undefined;

  if (!db || typeof db.prepare !== 'function') {
    throw Object.assign(
      new Error(
        'D1: Cloudflare binding "DB" is missing or invalid. ' +
        'Ensure [[d1_databases]] with binding = "DB" exists in wrangler.toml ' +
        'and the Worker was (re-)deployed afterwards.'
      ),
      { status: 503, code: 'D1_BINDING_MISSING' }
    );
  }

  return db;
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = []
): Promise<D1Result<T>> {
  const db = await getD1();
  const result = await db.prepare(sql).bind(...params).all<T>();

  return {
    results: result.results ?? [],
    success: result.success,
    meta: result.meta ?? {},
  };
}

export async function d1Execute(
  sql: string,
  params: SqlValue[] = []
): Promise<{ changes: number }> {
  const db = await getD1();
  const result = await db.prepare(sql).bind(...params).run();

  if (!result.success) {
    throw new Error('D1 write operation failed.');
  }

  return { changes: result.meta?.changes ?? 0 };
}

/** Runs statements atomically. D1 rolls the whole batch back if one fails. */
export async function d1Batch(statements: SqlStatement[]): Promise<void> {
  if (statements.length === 0) return;

  const db = await getD1();
  const prepared = statements.map((statement) =>
    db.prepare(statement.sql).bind(...(statement.params ?? []))
  );
  const results = await db.batch(prepared);

  if (results.some((result) => !result.success)) {
    throw new Error('D1 batch operation failed.');
  }
}
