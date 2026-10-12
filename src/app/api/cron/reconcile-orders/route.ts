import { NextRequest, NextResponse } from 'next/server';
import { reconcilePendingOrders } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET || process.env.RECONCILIATION_CRON_SECRET;

    // Secure cron endpoint against unauthorized calls
    if (cronSecret) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const summary = await reconcilePendingOrders({
      staleMinutes: 30,
      expireHours: 24,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err: any) {
    console.error('Reconciliation cron error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error during order reconciliation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
