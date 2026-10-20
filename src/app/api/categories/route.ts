import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = await getAuthenticatedAdmin();
    const requestedStatus = searchParams.get('status');
    const status = admin && hasPermission(admin.role, 'catalog', 'view') && requestedStatus
      ? requestedStatus
      : 'active';
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;

    const result = await d1Query(
      `SELECT pc.*, COUNT(p.id) AS live_product_count
       FROM product_categories pc
       LEFT JOIN products p ON (p.category_id = pc.id OR p.category_slug = pc.slug) AND p.status IN ('active', 'published')
       WHERE pc.status = ? 
       GROUP BY pc.id
       ORDER BY pc.display_order ASC 
       LIMIT ?`,
      [status, limit]
    );

    const categories = result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      displayOrder: row.display_order,
      status: row.status,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      productCount: Number(row.live_product_count ?? row.product_count ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Categories could not be loaded. Check the database connection and migrations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(admin.role, 'catalog', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, image, displayOrder, status, seoTitle, seoDescription } = body;

    if (status === 'active' && !hasPermission(admin.role, 'catalog', 'publish')) {
      return NextResponse.json({ error: 'You do not have permission to publish categories' }, { status: 403 });
    }

    if (typeof name !== 'string' || typeof slug !== 'string' || !name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await d1Query(
      `INSERT INTO product_categories 
       (id, name, slug, description, image, display_order, status, seo_title, seo_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description || null, image || null, displayOrder || 0, status || 'active', seoTitle || null, seoDescription || null, now, now]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
