import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await d1Query(
      `SELECT * FROM product_categories 
       WHERE status = ? 
       ORDER BY display_order ASC 
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
      productCount: row.product_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    // Return empty array on DB not configured yet
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, image, displayOrder, status, seoTitle, seoDescription } = body;

    if (!name || !slug) {
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