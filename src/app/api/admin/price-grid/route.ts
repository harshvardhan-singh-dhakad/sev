import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'catalog', 'view');

    const result = await d1Query(
      `SELECT p.id AS product_id, p.name AS product_name, p.slug, p.status AS product_status,
              pv.id AS variant_id, pv.label, pv.weight_grams, pv.price_paise,
              pv.compare_at_price, pv.sku, pv.stock_qty, pv.status AS variant_status
         FROM products p
         LEFT JOIN product_variants pv ON pv.product_id = p.id
        ORDER BY p.name COLLATE NOCASE, pv.weight_grams ASC
        LIMIT 1000`
    );

    const rows = result.results.map((row: Record<string, unknown>) => ({
      productId: row.product_id,
      productName: row.product_name,
      slug: row.slug,
      productStatus: row.product_status,
      variantId: row.variant_id,
      pack: row.label,
      weightGrams: row.weight_grams,
      pricePaise: row.price_paise,
      compareAtPricePaise: row.compare_at_price,
      sku: row.sku,
      stock: row.stock_qty,
      variantStatus: row.variant_status,
    }));

    return NextResponse.json({ rows });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/price-grid error:', error);
    return NextResponse.json({ error: 'Failed to load the price grid' }, { status: 500 });
  }
}
