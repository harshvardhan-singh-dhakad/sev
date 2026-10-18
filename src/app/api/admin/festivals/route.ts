import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Execute } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { listAllFestivals } from '@/lib/festivals';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'view');

    const festivals = await listAllFestivals();
    return NextResponse.json({ festivals });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('GET /api/admin/festivals error:', error);
    return NextResponse.json({ error: 'Failed to load festivals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'create');

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      name,
      slug,
      religionCategory = 'universal',
      tagline,
      description,
      bannerUrl,
      thumbnailUrl,
      themeColor = '#d97706',
      greetingTemplates = [],
      featuredProductIds = [],
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!name || !slug || !tagline) {
      return NextResponse.json({ error: 'Name, slug, and tagline are required' }, { status: 400 });
    }

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `fest_${cleanSlug}_${Date.now()}`;
    const now = new Date().toISOString();

    await d1Execute(
      `INSERT INTO festivals (
        id, name, slug, religion_category, tagline, description, banner_url, thumbnail_url,
        theme_color, greeting_templates, featured_product_ids, is_active, sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(name).trim(),
        cleanSlug,
        String(religionCategory),
        String(tagline).trim(),
        description ? String(description).trim() : null,
        bannerUrl ? String(bannerUrl).trim() : null,
        thumbnailUrl ? String(thumbnailUrl).trim() : null,
        themeColor ? String(themeColor).trim() : '#d97706',
        JSON.stringify(Array.isArray(greetingTemplates) ? greetingTemplates : []),
        JSON.stringify(Array.isArray(featuredProductIds) ? featuredProductIds : []),
        isActive ? 1 : 0,
        Number(sortOrder || 0),
        now,
        now,
      ]
    );

    return NextResponse.json({ success: true, id, slug: cleanSlug }, { status: 201 });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('POST /api/admin/festivals error:', error);
    return NextResponse.json({ error: 'Failed to create festival' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'edit');

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { id, name, tagline, description, bannerUrl, themeColor, greetingTemplates, featuredProductIds, isActive, sortOrder } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await d1Query(`SELECT * FROM festivals WHERE id = ? LIMIT 1`, [id]);
    if (existing.results.length === 0) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
    }

    const current = existing.results[0] as Record<string, unknown>;
    const now = new Date().toISOString();

    const updatedName = name !== undefined ? String(name).trim() : (current.name as string);
    const updatedTagline = tagline !== undefined ? String(tagline).trim() : (current.tagline as string);
    const updatedDesc = description !== undefined ? (String(description).trim() || null) : ((current.description as string) || null);
    const updatedBanner = bannerUrl !== undefined ? (String(bannerUrl).trim() || null) : ((current.banner_url as string) || null);
    const updatedColor = themeColor !== undefined ? String(themeColor).trim() : (current.theme_color as string);
    const updatedGreetings = greetingTemplates !== undefined
      ? JSON.stringify(Array.isArray(greetingTemplates) ? greetingTemplates : [])
      : (current.greeting_templates as string);
    const updatedProducts = featuredProductIds !== undefined
      ? JSON.stringify(Array.isArray(featuredProductIds) ? featuredProductIds : [])
      : (current.featured_product_ids as string);
    const updatedActive = isActive !== undefined ? (isActive ? 1 : 0) : Number(current.is_active || 0);
    const updatedSort = sortOrder !== undefined ? Number(sortOrder) : Number(current.sort_order || 0);

    await d1Execute(
      `UPDATE festivals
          SET name = ?,
              tagline = ?,
              description = ?,
              banner_url = ?,
              theme_color = ?,
              greeting_templates = ?,
              featured_product_ids = ?,
              is_active = ?,
              sort_order = ?,
              updated_at = ?
        WHERE id = ?`,
      [
        updatedName,
        updatedTagline,
        updatedDesc,
        updatedBanner,
        updatedColor,
        updatedGreetings,
        updatedProducts,
        updatedActive,
        updatedSort,
        now,
        id,
      ]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('PATCH /api/admin/festivals error:', error);
    return NextResponse.json({ error: 'Failed to update festival' }, { status: 500 });
  }
}
