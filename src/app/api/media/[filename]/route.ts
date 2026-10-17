import { getMediaObject } from '@/lib/media';

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await context.params;
    // A generated UUID plus extension is the only valid public object name.
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) return new Response(null, { status: 404 });
    const object = await getMediaObject(filename);
    if (!object) return new Response(null, { status: 404 });
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    // R2 binding missing → return 503 so Cloudflare does NOT throw Error 1101
    if (error.code === 'R2_BINDING_MISSING' || error.code === 'CF_CONTEXT_UNAVAILABLE' || error.status === 503) {
      console.error('GET /api/media/[filename] – R2 binding unavailable:', error.message);
      return new Response('Media storage is temporarily unavailable.', { status: 503 });
    }
    console.error('GET /api/media/[filename] error:', error);
    return new Response(null, { status: 500 });
  }
}
