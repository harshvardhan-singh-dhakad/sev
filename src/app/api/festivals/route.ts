import { NextRequest, NextResponse } from 'next/server';
import { listActiveFestivals, getFestivalBySlug } from '@/lib/festivals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const festival = await getFestivalBySlug(slug);
      if (!festival) {
        return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
      }
      return NextResponse.json({ festival });
    }

    const festivals = await listActiveFestivals();
    return NextResponse.json({ festivals });
  } catch (error) {
    console.error('GET /api/festivals error:', error);
    return NextResponse.json({ error: 'Failed to fetch festive campaigns' }, { status: 500 });
  }
}
