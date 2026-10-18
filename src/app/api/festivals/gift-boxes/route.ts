import { NextRequest, NextResponse } from 'next/server';
import { listGiftBoxes, getFestivalBySlug } from '@/lib/festivals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let festivalId = searchParams.get('festivalId') || undefined;
    const festivalSlug = searchParams.get('festivalSlug');

    if (!festivalId && festivalSlug) {
      const fest = await getFestivalBySlug(festivalSlug);
      if (fest) {
        festivalId = fest.id;
      }
    }

    const boxes = await listGiftBoxes(festivalId, true);
    return NextResponse.json({ boxes });
  } catch (error) {
    console.error('GET /api/festivals/gift-boxes error:', error);
    return NextResponse.json({ error: 'Failed to load gift boxes' }, { status: 500 });
  }
}
