/**
 * lib/r2-middleware.ts — Global error boundary for R2-dependent routes
 *
 * Wrap any API route or server action that touches R2 with `withR2ErrorHandler`
 * to guarantee a clean JSON error response instead of a raw 1101/500.
 *
 * Example usage in app/api/upload/route.ts:
 *
 *   import { withR2ErrorHandler } from "@/lib/r2-middleware";
 *
 *   export const POST = withR2ErrorHandler(async (req) => {
 *     const formData = await req.formData();
 *     const file = formData.get("file") as File;
 *     // ... your R2 logic
 *     return Response.json({ success: true });
 *   });
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerFn = (...args: any[]) => Promise<Response> | Response;

/**
 * Wraps a route handler with a try/catch that returns a structured
 * error response instead of letting the exception bubble up as 1101.
 */
export function withR2ErrorHandler<THandler extends HandlerFn>(handler: THandler): THandler {
  const wrapped = async (...args: Parameters<THandler>): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err: unknown) {
      // Log the full error for debugging (visible in Workers Logs)
      console.error("[R2 ErrorBoundary] Unhandled error:", err);

      const errObj = err as Record<string, unknown> | null;
      const message =
        err instanceof Error
          ? err.message
          : typeof errObj?.message === "string"
          ? errObj.message
          : String(err);

      // Determine if this is a binding-missing or service-unavailable error
      const isBindingError =
        errObj?.code === "R2_BINDING_MISSING" ||
        errObj?.code === "CF_CONTEXT_UNAVAILABLE" ||
        errObj?.status === 503 ||
        message.includes("Cannot read properties of undefined") ||
        message.includes("is not a function") ||
        message.includes("media") ||
        message.includes("R2");

      if (isBindingError) {
        return Response.json(
          {
            error:
              "Storage service is not properly configured. " +
              "The R2 bucket binding may be missing. Check wrangler.toml.",
          },
          { status: 503 },
        );
      }

      // Generic error — never expose internal stack traces in production
      return Response.json(
        {
          error: "An internal server error occurred while accessing storage.",
        },
        { status: 500 },
      );
    }
  };

  return wrapped as unknown as THandler;
}
