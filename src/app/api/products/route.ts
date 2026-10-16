import { NextRequest, NextResponse } from 'next/server';
import { d1Batch, d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = await getAuthenticatedAdmin();
    const requestedStatus = searchParams.get('status');
    const mayViewDrafts = Boolean(admin && hasPermission(admin.role, 'catalog', 'view'));
    const status = mayViewDrafts && requestedStatus ? requestedStatus : 'active';
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('category');
    const bestSeller = searchParams.get('bestSeller');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('isNew');
    const recommended = searchParams.get('recommended');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const parsedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;
    const offset = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0;

    const conditions: string[] = [];
    const params: (string | number | boolean | null)[] = [];

    if (status === 'active') {
      conditions.push("p.status IN ('active', 'published')");
    } else if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    if (categoryId) { conditions.push('p.category_id = ?'); params.push(categoryId); }
    if (categorySlug) {
      conditions.push('pc.slug = ?');
      params.push(categorySlug);
    }
    if (bestSeller === 'true') { conditions.push('p.best_seller = 1'); }
    if (featured === 'true') { conditions.push('p.featured = 1'); }
    if (isNew === 'true') { conditions.push('p.is_new = 1'); }
    if (recommended === 'true') { conditions.push('p.recommended = 1'); }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.short_description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') orderClause = 'ORDER BY min_price ASC';
    if (sort === 'price_desc') orderClause = 'ORDER BY min_price DESC';
    if (sort === 'bestselling') orderClause = 'ORDER BY p.best_seller DESC, p.created_at DESC';
    if (sort === 'top_rated') orderClause = 'ORDER BY p.avg_rating DESC';
    if (sort === 'newest') orderClause = 'ORDER BY p.created_at DESC';

    const productsResult = await d1Query(
      `SELECT p.*, pc.name as category_name, pc.slug as category_slug,
              MIN(COALESCE(pv.price, pv.price_paise)) as min_price
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.status = 'active'
       ${whereClause}
       GROUP BY p.id
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get variants for each product
    const productIds = productsResult.results.map((p: Record<string, unknown>) => p.id as string);
    let variants: Record<string, unknown>[] = [];

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const variantsResult = await d1Query(
        `SELECT * FROM product_variants WHERE product_id IN (${placeholders}) AND status = 'active' ORDER BY weight_grams ASC`,
        productIds
      );
      variants = variantsResult.results;
    }

    const products = productsResult.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      categoryId: row.category_id,
      categoryName: row.category_name,
      shortDescription: row.short_description,
      longDescription: row.long_description,
      images: row.images ? JSON.parse(row.images as string) : [],
      thumbnail: row.thumbnail,
      status: row.status === 'published' ? 'active' : row.status,
      featured: Boolean(row.featured),
      bestSeller: Boolean(row.best_seller),
      isNew: Boolean(row.is_new),
      recommended: Boolean(row.recommended),
      avgRating: row.avg_rating,
      reviewCount: row.review_count,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      variants: variants
        .filter((v: Record<string, unknown>) => v.product_id === row.id)
        .map((v: Record<string, unknown>) => ({
          id: v.id,
          productId: v.product_id,
          name: v.name,
          weight: v.weight,
          weightGrams: v.weight_grams,
          sku: v.sku,
          price: v.price ?? v.price_paise,
          compareAtPrice: v.compare_at_price,
          stock: v.stock ?? v.stock_qty,
          lowStockThreshold: v.low_stock_threshold,
          image: v.image,
          status: v.status,
        })),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ products: [] });
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
    const {
      name, slug, categoryId, categorySlug, shortDescription, longDescription,
      images, thumbnail, ingredients, tasteProfile, texture,
      shelfLife, storageInstructions, packagingInfo, gstRate, hsn,
      status, featured, bestSeller, isNew, recommended,
      seoTitle, seoDescription, seoKeywords, ogImage, spiceLevel, storage, vegMark, variants,
    } = body;

    if (status === 'active' && !hasPermission(admin.role, 'catalog', 'publish')) {
      return NextResponse.json({ error: 'You do not have permission to publish products' }, { status: 403 });
    }

    if (typeof name !== 'string' || typeof slug !== 'string' || !name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    if (!Array.isArray(variants) || variants.length === 0 || variants.length > 10 || variants.some((variant) =>
      !variant || typeof variant.label !== 'string' || !Number.isInteger(variant.weightGrams) || variant.weightGrams <= 0 ||
      !Number.isInteger(variant.pricePaise) || variant.pricePaise <= 0 || typeof variant.sku !== 'string' || !variant.sku.trim()
    )) {
      return NextResponse.json({ error: 'Add valid packs with a label, weight, price, and SKU.' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    let resolvedCategorySlug = typeof categorySlug === 'string' ? categorySlug : '';
    if (categoryId) {
      const category = await d1Query<{ slug: string }>('SELECT slug FROM product_categories WHERE id = ? LIMIT 1', [String(categoryId)]);
      resolvedCategorySlug = category.results[0]?.slug || resolvedCategorySlug;
    }
    if (!resolvedCategorySlug) return NextResponse.json({ error: 'Choose a category for this product.' }, { status: 400 });

    const productImages = Array.isArray(images) ? images : [];
    const productStatus = status === 'active' ? 'published' : status || 'draft';
    const statements = [{
      sql: `INSERT INTO products (
        id, name, slug, category_slug, short_description, description, spice_level, storage,
        veg_mark, country_of_origin, status, featured, sort_order, category_id, long_description,
        images, thumbnail, ingredients, taste_profile, texture, storage_instructions, packaging_info,
        gst_rate, hsn, best_seller, is_new, recommended, seo_title, seo_description, seo_keywords,
        og_image, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        id, name, slug, resolvedCategorySlug, shortDescription || '', longDescription || '', spiceLevel || 'mild',
        storage || storageInstructions || '', vegMark || 'veg', productStatus, featured ? 1 : 0, categoryId || null,
        longDescription || '', JSON.stringify(productImages), thumbnail || productImages[0]?.src || null,
        ingredients || null, tasteProfile || null, texture || null, storageInstructions || storage || '',
        packagingInfo || null, gstRate || 5, hsn || null, bestSeller ? 1 : 0, isNew ? 1 : 0,
        recommended ? 1 : 0, seoTitle || null, seoDescription || null, seoKeywords || null, ogImage || null, now, now,
      ],
    }];
    for (const [index, variant] of variants.entries()) {
      const variantId = crypto.randomUUID();
      const weight = Number(variant.weightGrams);
      const price = Number(variant.pricePaise);
      const stock = variant.stock === '' || variant.stock == null ? null : Number(variant.stock);
      statements.push({
        sql: `INSERT INTO product_variants (
          id, product_id, label, weight_grams, price_paise, sku, stock_qty, min_qty, max_qty,
          step, is_active, sort_order, created_at, updated_at, name, weight, price, stock, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL, 1, 1, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        params: [variantId, id, variant.label, weight, price, variant.sku.trim(), stock, index, now, now,
          variant.label, variant.label, price, stock],
      });
    }
    await d1Batch(statements);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
