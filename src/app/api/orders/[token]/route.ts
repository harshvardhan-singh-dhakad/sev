import { NextRequest, NextResponse } from 'next/server';
import { getOrderByToken } from '@/lib/orders';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { error: 'Order token is required' },
        { status: 400 }
      );
    }

    const order = await getOrderByToken(token.trim());

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or invalid token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error('GET /api/orders/[token] error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}
