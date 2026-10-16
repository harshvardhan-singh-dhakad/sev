import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

interface FirebaseIdentity {
  users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
}

interface AccountOrderRow {
  id: string;
  order_number: string;
  public_token: string;
  status: string;
  customer_email: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_landmark: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paid_at: string | null;
  tracking_courier: string | null;
  tracking_awb: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountOrderItemRow {
  id: string;
  order_id: string;
  product_name: string;
  pack_label: string;
  weight_grams: number;
  unit_price: number;
  qty: number;
  line_total: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!token) return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 });
    if (!apiKey) return NextResponse.json({ error: 'Account services are not configured.' }, { status: 503 });

    const verification = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!verification.ok) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

    const identity = await verification.json() as FirebaseIdentity;
    const email = identity.users?.[0]?.email?.trim().toLowerCase();
    if (!identity.users?.[0]?.localId || !email) {
      return NextResponse.json({ error: 'An account email is required to show order history.' }, { status: 403 });
    }
    if (!identity.users[0].emailVerified) {
      return NextResponse.json(
        { code: 'email_verification_required', error: 'Verify your email address to view your order history.' },
        { status: 403 }
      );
    }

    const countResult = await d1Query<{ count: number }>(
      'SELECT COUNT(*) AS count FROM orders WHERE LOWER(TRIM(customer_email)) = ?',
      [email]
    );
    const result = await d1Query<AccountOrderRow>(
      `SELECT id, order_number, public_token, status, customer_email,
              shipping_line1, shipping_line2, shipping_landmark, shipping_city, shipping_state, shipping_pincode,
              subtotal, shipping, total, paid_at, tracking_courier, tracking_awb, tracking_url, created_at, updated_at
       FROM orders
       WHERE LOWER(TRIM(customer_email)) = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [email]
    );
    const orders = result.results;
    if (!orders.length) return NextResponse.json({ orders: [], totalOrders: Number(countResult.results[0]?.count || 0) });

    const orderIds = orders.map((order) => order.id);
    const placeholders = orderIds.map(() => '?').join(', ');
    const itemResult = await d1Query<AccountOrderItemRow>(
      `SELECT id, order_id, product_name, pack_label, weight_grams, unit_price, qty, line_total
       FROM order_items WHERE order_id IN (${placeholders}) ORDER BY created_at ASC`,
      orderIds
    );
    const itemsByOrder = new Map<string, AccountOrderItemRow[]>();
    for (const item of itemResult.results) {
      const items = itemsByOrder.get(item.order_id) || [];
      items.push(item);
      itemsByOrder.set(item.order_id, items);
    }

    return NextResponse.json({
      totalOrders: Number(countResult.results[0]?.count || 0),
      orders: orders.map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) || [],
      })),
    });
  } catch (error) {
    console.error('GET /api/account/orders error:', error);
    return NextResponse.json({ error: 'Could not load your orders right now. Please try again.' }, { status: 500 });
  }
}
