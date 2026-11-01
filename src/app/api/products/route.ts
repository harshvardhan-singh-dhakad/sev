import { NextRequest, NextResponse } from 'next/server';
import { d1Batch, d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    } else if (status === 'all') {
      // Return all products regardless of status
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

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Products could not be loaded. Check the database connection and migrations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    if (!hasPermission(admin.role, 'catalog', 'create')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to create products.' }, { status: 403 });
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

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    // 1. Clean and Auto-Resolve URL Slug (guarantees no unique constraint crashes)
    let cleanSlug = typeof slug === 'string' && slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!cleanSlug) {
      cleanSlug = `product-${Date.now().toString(36)}`;
    }

    let finalSlug = cleanSlug;
    let slugCounter = 1;
    while (true) {
      const existingSlug = await d1Query<{ id: string }>(
        'SELECT id FROM products WHERE slug = ? LIMIT 1',
        [finalSlug]
      );
      if (existingSlug.results.length === 0) break;
      slugCounter++;
      finalSlug = `${cleanSlug}-${slugCounter}`;
    }

    // 2. Validate Variants/Packs
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: 'At least one pack variant is required.' }, { status: 400 });
    }

    // 3. Resolve Category
    let resolvedCategorySlug = typeof categorySlug === 'string' ? categorySlug : '';
    let resolvedCategoryId = categoryId ? String(categoryId) : null;
    if (resolvedCategoryId) {
      const category = await d1Query<{ id: string; slug: string }>(
        'SELECT id, slug FROM product_categories WHERE id = ? LIMIT 1',
        [resolvedCategoryId]
      );
      if (category.results[0]) {
        resolvedCategorySlug = category.results[0].slug;
      }
    }
    if (!resolvedCategorySlug) {
      // Fallback to first active category if available
      const defaultCat = await d1Query<{ id: string; slug: string }>(
        'SELECT id, slug FROM product_categories WHERE status = "active" ORDER BY display_order ASC LIMIT 1'
      );
      if (defaultCat.results[0]) {
        resolvedCategoryId = defaultCat.results[0].id;
        resolvedCategorySlug = defaultCat.results[0].slug;
      }
    }
    if (!resolvedCategorySlug) {
      return NextResponse.json({ error: 'Choose a category for this product.' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const productImages = Array.isArray(images) ? images : [];
    const productStatus = status === 'active' ? 'published' : status || 'draft';

    // 4. Auto-generate and Auto-Deduplicate Variant SKUs
    const usedSkusInBatch = new Set<string>();
    const processedVariants: Array<{
      variantId: string;
      label: string;
      weight: number;
      price: number;
      compareAtPrice: number | null;
      sku: string;
      stock: number | null;
      variantImage: string | null;
    }> = [];

    for (const [index, variant] of variants.entries()) {
      const variantId = crypto.randomUUID();
      const weight = Number(variant.weightGrams);
      if (!Number.isFinite(weight) || weight <= 0) {
        return NextResponse.json({ error: `Pack #${index + 1} ki weight valid grams me honi chahiye.` }, { status: 400 });
      }

      const price = Number(variant.pricePaise);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: `Pack #${index + 1} ki selling price enter karein.` }, { status: 400 });
      }

      const compareAtPrice =
        variant.compareAtPricePaise != null && Number(variant.compareAtPricePaise) > 0
          ? Number(variant.compareAtPricePaise)
          : null;
      const stock = variant.stock === '' || variant.stock == null ? null : Number(variant.stock);
      const variantImage = variant.image ? String(variant.image).trim() : null;
      const label = typeof variant.label === 'string' && variant.label.trim()
        ? variant.label.trim()
        : `${weight >= 1000 ? `${weight / 1000} kg` : `${weight} g`}`;

      // Smart SKU Generation:
      let baseSku = typeof variant.sku === 'string' && variant.sku.trim()
        ? variant.sku.trim().toUpperCase()
        : `${finalSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${weight}G`;

      if (!baseSku) baseSku = `SKU-${weight}G`;

      // Guarantee 100% database & batch uniqueness for SKU
      let finalSku = baseSku;
      let skuCounter = 1;
      while (true) {
        if (usedSkusInBatch.has(finalSku.toUpperCase())) {
          skuCounter++;
          finalSku = `${baseSku}-${skuCounter}`;
          continue;
        }

        const existingSku = await d1Query<{ id: string }>(
          'SELECT id FROM product_variants WHERE UPPER(sku) = UPPER(?) LIMIT 1',
          [finalSku]
        );
        if (existingSku.results.length === 0) break;
        skuCounter++;
        finalSku = `${baseSku}-${skuCounter}`;
      }

      usedSkusInBatch.add(finalSku.toUpperCase());

      processedVariants.push({
        variantId,
        label,
        weight,
        price,
        compareAtPrice,
        sku: finalSku,
        stock,
        variantImage,
      });
    }

    // 5. Batch insert product and variants
    const statements = [{
      sql: `INSERT INTO products (
        id, name, slug, category_slug, short_description, description, spice_level, storage,
        veg_mark, country_of_origin, status, featured, sort_order, category_id, long_description,
        images, thumbnail, ingredients, taste_profile, texture, storage_instructions, packaging_info,
        gst_rate, hsn, best_seller, is_new, recommended, seo_title, seo_description, seo_keywords,
        og_image, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        id, name.trim(), finalSlug, resolvedCategorySlug, shortDescription || '', longDescription || '', spiceLevel || 'mild',
        storage || storageInstructions || '', vegMark || 'veg', productStatus, featured ? 1 : 0, resolvedCategoryId,
        longDescription || '', JSON.stringify(productImages), thumbnail || productImages[0]?.src || null,
        ingredients || null, tasteProfile || null, texture || null, storageInstructions || storage || '',
        packagingInfo || null, gstRate || 5, hsn || null, bestSeller ? 1 : 0, isNew ? 1 : 0,
        recommended ? 1 : 0, seoTitle || null, seoDescription || null, seoKeywords || null, ogImage || null, now, now,
      ],
    }];

    for (const [index, pv] of processedVariants.entries()) {
      statements.push({
        sql: `INSERT INTO product_variants (
          id, product_id, label, weight_grams, price_paise, compare_at_price, sku, stock_qty, min_qty, max_qty,
          step, is_active, sort_order, created_at, updated_at, name, weight, price, stock, status, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, 1, 1, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        params: [
          pv.variantId, id, pv.label, pv.weight, pv.price, pv.compareAtPrice, pv.sku, pv.stock, index, now, now,
          pv.label, pv.label, pv.price, pv.stock, pv.variantImage
        ],
      });
    }

    await d1Batch(statements);

    return NextResponse.json({
      success: true,
      id,
      slug: finalSlug,
      message: 'Product listing successfully created!',
    }, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    const msg = error?.message || String(error);
    if (msg.includes('UNIQUE constraint failed: products.slug')) {
      return NextResponse.json(
        { error: 'Product URL slug already exists. Please choose a different slug.' },
        { status: 409 }
      );
    }
    if (msg.includes('UNIQUE constraint failed: product_variants.sku')) {
      return NextResponse.json(
        { error: 'Variant SKU already exists. Each pack must have a unique SKU.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg || 'Failed to create product' }, { status: 500 });
  }
}
