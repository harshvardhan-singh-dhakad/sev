/**
 * `wrangler types` emits a generic `Body.json<T>()` signature. When no type
 * parameter is supplied, TypeScript infers `unknown`, which is incompatible
 * with the existing application code that predates that generated type.
 *
 * Keep the browser-compatible default as `any`; individual call sites can
 * still provide a stricter type parameter where appropriate.
 */
interface Body {
  json<T = any>(): Promise<T>;
}
