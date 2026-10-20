import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { getAdminStoreSettings } from '@/lib/settings';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const [productsRes, categoriesRes, ordersRes, revenueRes, recentOrdersRes, settings] = await Promise.all([
      d1Query<{ count: number }>("SELECT COUNT(*) as count FROM products WHERE status IN ('active', 'published')"),
      d1Query<{ count: number }>("SELECT COUNT(*) as count FROM product_categories WHERE status = 'active'"),
      d1Query<{ count: number }>("SELECT COUNT(*) as count FROM orders"),
      d1Query<{ total: number }>("SELECT SUM(total) as total FROM orders WHERE status NOT IN ('cancelled', 'refunded')"),
      d1Query<Record<string, unknown>>(
        `SELECT id, order_number, customer_name, customer_phone, total, status, created_at 
         FROM orders ORDER BY created_at DESC LIMIT 5`
      ),
      getAdminStoreSettings().catch(() => null),
    ]);

    const productsCount = productsRes.results[0]?.count ?? 0;
    const categoriesCount = categoriesRes.results[0]?.count ?? 0;
    const ordersCount = ordersRes.results[0]?.count ?? 0;
    const totalRevenuePaise = revenueRes.results[0]?.total ?? 0;

    return NextResponse.json({
      stats: {
        productsCount,
        categoriesCount,
        ordersCount,
        totalRevenuePaise,
        minCartValuePaise: settings?.min_cart_value_paise ?? 24900,
        bulkMinKg: settings?.bulk_minimum_kg ?? 5,
      },
      recentOrders: (recentOrdersRes.results || []).map((row) => ({
        id: String(row.id),
        orderNumber: String(row.order_number),
        customerName: String(row.customer_name || 'Customer'),
        customerPhone: String(row.customer_phone || ''),
        totalPaise: Number(row.total || 0),
        status: String(row.status || 'pending_payment'),
        createdAt: String(row.created_at || ''),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('GET /api/admin/dashboard-stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
