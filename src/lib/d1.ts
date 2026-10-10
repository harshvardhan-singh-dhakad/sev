// Cloudflare D1 API helper
// All D1 access is via Cloudflare Workers API routes

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;

const D1_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}`;

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: {
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    duration: number;
  };
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<D1Result<T>> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_D1_DATABASE_ID) {
    throw new Error('Cloudflare D1 configuration is missing. Check environment variables.');
  }

  const response = await fetch(`${D1_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`D1 query failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`D1 query error: ${JSON.stringify(data.errors)}`);
  }

  return data.result[0] as D1Result<T>;
}

export async function d1Batch(
  statements: { sql: string; params?: (string | number | boolean | null)[] }[]
): Promise<D1Result[]> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_D1_DATABASE_ID) {
    throw new Error('Cloudflare D1 configuration is missing. Check environment variables.');
  }

  const response = await fetch(`${D1_BASE_URL}/batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      statements: statements.map((s) => ({ sql: s.sql, params: s.params || [] })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`D1 batch failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`D1 batch error: ${JSON.stringify(data.errors)}`);
  }

  return data.result as D1Result[];
}