import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'sales', 'view');

    // Aggregate both registered accounts and customer profiles from orders
    const result = await d1Query(
      `SELECT 
        COALESCE(c.id, 'cust-' || lower(hex(randomblob(4)))) AS id,
        COALESCE(o.customer_email, c.email) AS email,
        MAX(COALESCE(o.customer_name, 'Account Customer')) AS name,
        MAX(o.customer_phone) AS phone,
        MAX(o.shipping_city) AS city,
        MAX(o.shipping_state) AS state,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total), 0) AS total_spent_paise,
        COALESCE(c.role, 'buyer') AS role,
        MIN(COALESCE(o.created_at, c.created_at)) AS created_at
      FROM orders o
      LEFT JOIN customers c ON c.email = o.customer_email
      WHERE o.customer_email IS NOT NULL AND o.customer_email != ''
      GROUP BY COALESCE(o.customer_email, c.email)
      ORDER BY created_at DESC LIMIT 500`
    );

    return NextResponse.json({
      customers: (result.results || []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        email: String(row.email || ''),
        name: String(row.name || 'Customer'),
        phone: String(row.phone || ''),
        city: String(row.city || ''),
        state: String(row.state || ''),
        totalOrders: Number(row.total_orders || 0),
        totalSpentPaise: Number(row.total_spent_paise || 0),
        role: String(row.role || 'customer'),
        createdAt: String(row.created_at || ''),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
