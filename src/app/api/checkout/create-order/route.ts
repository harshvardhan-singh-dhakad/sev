import { NextRequest, NextResponse } from 'next/server';
import { createPendingOrder, attachRazorpayOrderId } from '@/lib/orders';
import { createRazorpayOrder } from '@/lib/razorpay';

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, shippingAddress, items, notes } = body;

    // Validate Customer Name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (at least 2 characters)' },
        { status: 400 }
      );
    }

    // Validate Indian Phone
    const cleanPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10);
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9' },
        { status: 400 }
      );
    }

    // Validate Email if provided
    if (customerEmail && !EMAIL_REGEX.test(customerEmail.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate Shipping Address
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return NextResponse.json(
        { error: 'Delivery address details are required' },
        { status: 400 }
      );
    }

    const { line1, line2, landmark, city, state, pincode } = shippingAddress;

    if (!line1 || typeof line1 !== 'string' || line1.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a valid House / Flat / Street address (Line 1)' },
        { status: 400 }
      );
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid City / District' },
        { status: 400 }
      );
    }

    if (!state || typeof state !== 'string' || state.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please select a valid State / UT' },
        { status: 400 }
      );
    }

    const cleanPincode = String(pincode || '').trim();
    if (!PINCODE_REGEX.test(cleanPincode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit Indian postal PIN code' },
        { status: 400 }
      );
    }

    // Validate Items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.variantId || typeof item.qty !== 'number' || item.qty <= 0) {
        return NextResponse.json(
          { error: 'Invalid cart item configuration or quantity' },
          { status: 400 }
        );
      }
    }

    // Call unified authoritative orders engine
    const { order, items: createdItems } = await createPendingOrder({
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: customerEmail ? customerEmail.trim() : null,
      shippingAddress: {
        line1: line1.trim(),
        line2: line2 ? line2.trim() : undefined,
        landmark: landmark ? landmark.trim() : undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPincode,
      },
      items: items.map((i: any) => ({
        variantId: i.variantId,
        qty: Math.floor(i.qty),
      })),
      notes: notes ? String(notes).trim() : null,
    });

    // Create corresponding Razorpay Order
    let razorpayData;
    try {
      const razorpayOrder = await createRazorpayOrder({
        amount: order.total,
        currency: 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          order_number: order.order_number,
          public_token: order.public_token,
        },
      });

      await attachRazorpayOrderId(order.id, razorpayOrder.id);

      razorpayData = {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    } catch (rzpErr) {
      console.error('Razorpay order initialization error:', rzpErr);
      return NextResponse.json(
        { error: 'Payment gateway is not available. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          publicToken: order.public_token,
          status: order.status,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          itemsCount: createdItems.length,
        },
        razorpay: razorpayData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/checkout/create-order error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize order. Please try again.' },
      { status: 400 }
    );
  }
}
