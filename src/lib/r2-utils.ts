/**
 * lib/r2-utils.ts — Defensive R2 access utilities
 *
 * These helpers wrap every R2 operation with try/catch and null-safety
 * so that a missing binding or a transient R2 error never produces an
 * unhandled exception (Cloudflare Error 1101 / HTTP 500).
 *
 * Usage in any server-side code (route handlers, server actions, server components):
 *
 *   import { getR2Bucket, safeR2Get, safeR2Put } from "@/lib/r2-utils";
 *
 *   // Check if the binding exists (sync or async)
 *   const bucket = await getR2BucketAsync();
 *   if (!bucket) {
 *     return Response.json({ error: "Storage unavailable" }, { status: 503 });
 *   }
 *
 *   // Safe GET
 *   const obj = await safeR2Get("uploads/photo.jpg");
 *   if (!obj.ok) return new Response(obj.error, { status: obj.status });
 *
 *   // Safe PUT
 *   const result = await safeR2Put("uploads/photo.jpg", fileBody, {
 *     httpMetadata: { contentType: "image/jpeg" },
 *   });
 *   if (!result.ok) return Response.json({ error: result.error }, { status: 500 });
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface R2BucketLike {
  get(key: string, options?: Record<string, unknown>): Promise<R2ObjectBodyLike | null>;
  put(
    key: string,
    value: ReadableStream | string | ArrayBuffer | ArrayBufferView | null,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<R2ObjectHeadLike | null>;
  list(options?: Record<string, unknown>): Promise<R2ObjectsListLike>;
}

export interface R2ObjectBodyLike {
  body: ReadableStream;
  bodyUsed: boolean;
  readonly key: string;
  readonly size: number;
  readonly etag: string;
  readonly httpEtag: string;
  readonly uploaded: Date;
  readonly httpMetadata?: Record<string, unknown>;
  readonly customMetadata?: Record<string, string>;
  writeHttpMetadata?(headers: Headers): void;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2ObjectHeadLike {
  readonly key: string;
  readonly size: number;
  readonly etag: string;
  readonly httpEtag: string;
  readonly uploaded: Date;
  readonly httpMetadata?: Record<string, unknown>;
  readonly customMetadata?: Record<string, string>;
}

export interface R2ObjectsListLike {
  objects: R2ObjectHeadLike[];
  delimitedPrefixes: string[];
  truncated: boolean;
  cursor?: string;
}

/**
 * Resolves an R2Bucket from an environment object, checking exact name,
 * lowercase name, and uppercase name to prevent naming case mismatches.
 */
function extractBucketFromEnv(env: Record<string, unknown>, bindingName: string): R2BucketLike | null {
  const candidate =
    env[bindingName] ??
    env[bindingName.toLowerCase()] ??
    env[bindingName.toUpperCase()] ??
    null;

  if (candidate && typeof (candidate as Record<string, unknown>).get === "function") {
    return candidate as R2BucketLike;
  }
  return null;
}

// ---------------------------------------------------------------------------
// getR2Bucket — synchronously retrieve the R2 binding by name
// Returns null if the binding is missing (instead of throwing)
// ---------------------------------------------------------------------------

/**
 * Retrieve the R2 bucket binding synchronously.
 *
 * @param bindingName - The binding variable name from wrangler.toml (default: "media")
 * @returns The R2Bucket or null if the binding is not configured.
 */
export function getR2Bucket(bindingName: string = "media"): R2BucketLike | null {
  try {
    // 1. Try sync OpenNext Cloudflare context if in active request scope
    try {
      const syncContext = getCloudflareContext({ async: false });
      if (syncContext?.env) {
        const bucket = extractBucketFromEnv(syncContext.env as Record<string, unknown>, bindingName);
        if (bucket) return bucket;
      }
    } catch {
      // Ignore sync context errors (e.g. during SSG or outside active request context)
    }

    // 2. Try globalThis scope
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envGlobal = globalThis as any;
    const envObj = envGlobal?.env ?? envGlobal;

    if (envObj && typeof envObj === "object") {
      const bucket = extractBucketFromEnv(envObj as Record<string, unknown>, bindingName);
      if (bucket) return bucket;
    }

    return null;
  } catch (err) {
    console.error(`[R2] Failed to access R2 binding "${bindingName}":`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// getR2BucketAsync — asynchronously retrieve the R2 binding (recommended for OpenNext)
// ---------------------------------------------------------------------------

/**
 * Retrieve the R2 bucket binding asynchronously via OpenNext context.
 *
 * @param bindingName - The binding variable name from wrangler.toml (default: "media")
 * @returns The R2Bucket or null if the binding is not configured.
 */
export async function getR2BucketAsync(bindingName: string = "media"): Promise<R2BucketLike | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    if (context?.env) {
      const bucket = extractBucketFromEnv(context.env as Record<string, unknown>, bindingName);
      if (bucket) return bucket;
    }
  } catch {
    // Fall back to sync checks if async context retrieval is unavailable
  }

  return getR2Bucket(bindingName);
}

// ---------------------------------------------------------------------------
// safeR2Get — get an object, never throws
// ---------------------------------------------------------------------------

export async function safeR2Get(
  key: string,
  bindingName: string = "media",
): Promise<{ ok: true; data: R2ObjectBodyLike } | { ok: false; error: string; status: number }> {
  const bucket = await getR2BucketAsync(bindingName);
  if (!bucket) {
    return { ok: false, error: "R2 bucket binding not available", status: 503 };
  }

  try {
    const obj = await bucket.get(key);
    if (obj === null) {
      return { ok: false, error: "Object not found", status: 404 };
    }
    return { ok: true, data: obj };
  } catch (err) {
    console.error(`[R2] GET failed for key "${key}":`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown R2 error",
      status: 500,
    };
  }
}

// ---------------------------------------------------------------------------
// safeR2Put — put an object, never throws
// ---------------------------------------------------------------------------

export async function safeR2Put(
  key: string,
  value: ReadableStream | string | ArrayBuffer | ArrayBufferView | null,
  options?: {
    httpMetadata?: Record<string, unknown>;
    customMetadata?: Record<string, string>;
  },
  bindingName: string = "media",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const bucket = await getR2BucketAsync(bindingName);
  if (!bucket) {
    return { ok: false, error: "R2 bucket binding not available" };
  }

  try {
    await bucket.put(key, value, options);
    return { ok: true };
  } catch (err) {
    console.error(`[R2] PUT failed for key "${key}":`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown R2 error",
    };
  }
}

// ---------------------------------------------------------------------------
// safeR2Delete — delete an object, never throws
// ---------------------------------------------------------------------------

export async function safeR2Delete(
  key: string,
  bindingName: string = "media",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const bucket = await getR2BucketAsync(bindingName);
  if (!bucket) {
    return { ok: false, error: "R2 bucket binding not available" };
  }

  try {
    await bucket.delete(key);
    return { ok: true };
  } catch (err) {
    console.error(`[R2] DELETE failed for key "${key}":`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown R2 error",
    };
  }
}

// ---------------------------------------------------------------------------
// safeR2Head — check if an object exists, never throws
// ---------------------------------------------------------------------------

export async function safeR2Head(
  key: string,
  bindingName: string = "media",
): Promise<{ ok: true; exists: boolean; size?: number } | { ok: false; error: string }> {
  const bucket = await getR2BucketAsync(bindingName);
  if (!bucket) {
    return { ok: false, error: "R2 bucket binding not available" };
  }

  try {
    const head = await bucket.head(key);
    return { ok: true, exists: head !== null, size: head?.size };
  } catch (err) {
    console.error(`[R2] HEAD failed for key "${key}":`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown R2 error",
    };
  }
}

// ---------------------------------------------------------------------------
// safeR2List — list objects, never throws
// ---------------------------------------------------------------------------

export async function safeR2List(
  options?: {
    limit?: number;
    prefix?: string;
    cursor?: string;
  },
  bindingName: string = "media",
): Promise<{ ok: true; objects: R2ObjectHeadLike[]; truncated: boolean; cursor?: string } | { ok: false; error: string }> {
  const bucket = await getR2BucketAsync(bindingName);
  if (!bucket) {
    return { ok: false, error: "R2 bucket binding not available" };
  }

  try {
    const result = await bucket.list(options);
    return {
      ok: true,
      objects: result.objects,
      truncated: result.truncated,
      cursor: result.cursor,
    };
  } catch (err) {
    console.error(`[R2] LIST failed:`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown R2 error",
    };
  }
}
