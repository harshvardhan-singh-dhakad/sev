import { NextRequest, NextResponse } from 'next/server';
import { trackOrder } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, phone } = body;

    if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter your order number (e.g. RSV-2610-00001)' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Please enter your registered 10-digit mobile number' },
        { status: 400 }
      );
    }

    const tracking = await trackOrder(orderNumber.trim(), cleanPhone);

    if (!tracking) {
      // Anti-enumeration: Generic message that doesn't disclose whether order exists
      return NextResponse.json(
        { error: 'No matching order found for this order number and mobile number. Please double check and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (err: any) {
    console.error('POST /api/orders/track error:', err);
    return NextResponse.json(
      { error: 'An error occurred while tracking your order. Please try again later.' },
      { status: 500 }
    );
  }
}
