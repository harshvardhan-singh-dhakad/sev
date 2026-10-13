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
  } catch (error) {
    console.error('GET /api/media/[filename] error:', error);
    return new Response(null, { status: 503 });
  }
}
