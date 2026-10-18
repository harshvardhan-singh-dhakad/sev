import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Execute } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { listGiftBoxes, getGiftBoxById } from '@/lib/festivals';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'view');

    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId') || undefined;

    // Admin views all gift boxes (both active and inactive)
    const boxes = await listGiftBoxes(festivalId, false);
    return NextResponse.json({ boxes });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('GET /api/admin/festivals/gift-boxes error:', error);
    return NextResponse.json({ error: 'Failed to load gift boxes' }, { status: 500 });
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
      festivalId,
      title,
      slug,
      imageUrl,
      pricePaise,
      comparePricePaise,
      weightLabel,
      description,
      itemsIncluded,
      badge,
      isActive,
      sortOrder,
    } = body;

    if (!festivalId || !title || !pricePaise) {
      return NextResponse.json(
        { error: 'festivalId, title, and price are required' },
        { status: 400 }
      );
    }

    const cleanTitle = String(title).trim();
    const cleanSlug = (slug ? String(slug) : cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const id = `gbox_${cleanSlug}_${Date.now()}`;
    const now = new Date().toISOString();

    const itemsJson = JSON.stringify(Array.isArray(itemsIncluded) ? itemsIncluded : []);

    await d1Execute(
      `INSERT INTO festive_gift_boxes (
        id, festival_id, title, slug, image_url, price_paise, compare_price_paise,
        weight_label, description, items_included, badge, is_active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(festivalId).trim(),
        cleanTitle,
        cleanSlug,
        imageUrl ? String(imageUrl).trim() : '/images/placeholder-sev.svg',
        Number(pricePaise),
        comparePricePaise ? Number(comparePricePaise) : null,
        weightLabel ? String(weightLabel).trim() : null,
        description ? String(description).trim() : null,
        itemsJson,
        badge ? String(badge).trim() : null,
        isActive !== undefined ? (isActive ? 1 : 0) : 1,
        sortOrder !== undefined ? Number(sortOrder) : 0,
        now,
        now,
      ]
    );

    const created = await getGiftBoxById(id);
    return NextResponse.json({ success: true, box: created });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('POST /api/admin/festivals/gift-boxes error:', error);
    return NextResponse.json({ error: 'Failed to create gift box' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'edit');

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const {
      id,
      festivalId,
      title,
      slug,
      imageUrl,
      pricePaise,
      comparePricePaise,
      weightLabel,
      description,
      itemsIncluded,
      badge,
      isActive,
      sortOrder,
    } = body;

    const existing = await d1Query(
      `SELECT * FROM festive_gift_boxes WHERE id = ? LIMIT 1`,
      [String(id)]
    );
    if (existing.results.length === 0) {
      return NextResponse.json({ error: 'Gift box not found' }, { status: 404 });
    }

    const current = existing.results[0] as Record<string, unknown>;
    const now = new Date().toISOString();

    const updatedFestivalId = festivalId !== undefined ? String(festivalId).trim() : (current.festival_id as string);
    const updatedTitle = title !== undefined ? String(title).trim() : (current.title as string);
    const updatedSlug = slug !== undefined ? String(slug).trim() : (current.slug as string);
    const updatedImage = imageUrl !== undefined ? String(imageUrl).trim() : (current.image_url as string);
    const updatedPrice = pricePaise !== undefined ? Number(pricePaise) : Number(current.price_paise);
    const updatedCompare = comparePricePaise !== undefined
      ? (comparePricePaise ? Number(comparePricePaise) : null)
      : (current.compare_price_paise !== null ? Number(current.compare_price_paise) : null);
    const updatedWeight = weightLabel !== undefined ? (String(weightLabel).trim() || null) : ((current.weight_label as string) || null);
    const updatedDesc = description !== undefined ? (String(description).trim() || null) : ((current.description as string) || null);
    const updatedItems = itemsIncluded !== undefined
      ? JSON.stringify(Array.isArray(itemsIncluded) ? itemsIncluded : [])
      : (current.items_included as string);
    const updatedBadge = badge !== undefined ? (String(badge).trim() || null) : ((current.badge as string) || null);
    const updatedActive = isActive !== undefined ? (isActive ? 1 : 0) : Number(current.is_active || 0);
    const updatedSort = sortOrder !== undefined ? Number(sortOrder) : Number(current.sort_order || 0);

    await d1Execute(
      `UPDATE festive_gift_boxes
          SET festival_id = ?,
              title = ?,
              slug = ?,
              image_url = ?,
              price_paise = ?,
              compare_price_paise = ?,
              weight_label = ?,
              description = ?,
              items_included = ?,
              badge = ?,
              is_active = ?,
              sort_order = ?,
              updated_at = ?
        WHERE id = ?`,
      [
        updatedFestivalId,
        updatedTitle,
        updatedSlug,
        updatedImage,
        updatedPrice,
        updatedCompare,
        updatedWeight,
        updatedDesc,
        updatedItems,
        updatedBadge,
        updatedActive,
        updatedSort,
        now,
        String(id),
      ]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('PATCH /api/admin/festivals/gift-boxes error:', error);
    return NextResponse.json({ error: 'Failed to update gift box' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'content', 'delete');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await d1Execute(`DELETE FROM festive_gift_boxes WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('DELETE /api/admin/festivals/gift-boxes error:', error);
    return NextResponse.json({ error: 'Failed to delete gift box' }, { status: 500 });
  }
}
