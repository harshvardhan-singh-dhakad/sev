import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'sales', 'view');
    const result = await d1Query(
      `SELECT id, order_number, status, customer_name, customer_phone, customer_email,
              shipping_city, shipping_state, total, created_at, updated_at
         FROM orders ORDER BY created_at DESC LIMIT 250`
    );
    return NextResponse.json({ orders: result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      city: row.shipping_city,
      state: row.shipping_state,
      totalPaise: row.total,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
