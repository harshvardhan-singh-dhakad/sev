import { NextRequest, NextResponse } from 'next/server';
import { d1Batch, d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasPermission(admin.role, 'catalog', 'view')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const result = await d1Query<Record<string, unknown>>(
      `SELECT p.*, pc.name AS category_name, pc.slug AS joined_category_slug
         FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id
        WHERE p.id = ? LIMIT 1`, [id]
    );
    const product = result.results[0];
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const variantResult = await d1Query<Record<string, unknown>>(
      `SELECT id, label, weight_grams, price_paise, sku, stock_qty, is_active, status
         FROM product_variants WHERE product_id = ? ORDER BY sort_order, weight_grams`, [id]
    );
    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.category_id,
        categorySlug: product.category_slug,
        shortDescription: product.short_description,
        description: product.long_description || product.description || '',
        status: product.status === 'published' ? 'active' : product.status,
        variants: variantResult.results.map((variant) => ({
          id: variant.id,
          label: variant.label,
          weightGrams: variant.weight_grams,
          pricePaise: variant.price_paise,
          sku: variant.sku,
          stock: variant.stock_qty,
          isActive: Boolean(variant.is_active) && variant.status !== 'inactive',
        })),
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Product could not be loaded' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasPermission(admin.role, 'catalog', 'edit')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const body = await request.json();
    const { name, slug, categoryId, categorySlug, shortDescription, longDescription, description, status, variants } = body;
    if (typeof name !== 'string' || !name.trim() || typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'Product name and a valid URL slug are required' }, { status: 400 });
    }
    if (!['draft', 'active', 'published', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Choose a valid publishing status' }, { status: 400 });
    }
    const isPublishing = status === 'active' || status === 'published';
    if (isPublishing && !hasPermission(admin.role, 'catalog', 'publish')) {
      return NextResponse.json({ error: 'You do not have permission to publish products' }, { status: 403 });
    }
    if (typeof shortDescription !== 'string' || typeof (longDescription ?? description) !== 'string') {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }
    if (!Array.isArray(variants) || variants.length === 0 || variants.length > 10 || variants.some((variant) =>
      !variant || typeof variant.label !== 'string' || !variant.label.trim() || !Number.isInteger(Number(variant.weightGrams)) || Number(variant.weightGrams) <= 0 ||
      !Number.isInteger(Number(variant.pricePaise)) || Number(variant.pricePaise) <= 0 || typeof variant.sku !== 'string' || !variant.sku.trim() ||
      (variant.stock !== null && variant.stock !== '' && variant.stock !== undefined && (!Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0))
    )) {
      return NextResponse.json({ error: 'Add valid packs with label, weight, price, and SKU.' }, { status: 400 });
    }

    const existing = await d1Query<{ id: string }>('SELECT id FROM products WHERE id = ? LIMIT 1', [id]);
    if (!existing.results[0]) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    let resolvedCategoryId: string | null = null;
    let resolvedCategorySlug = typeof categorySlug === 'string' ? categorySlug : '';
    if (categoryId) {
      const category = await d1Query<{ id: string; slug: string }>(
        'SELECT id, slug FROM product_categories WHERE id = ? LIMIT 1', [String(categoryId)]
      );
      if (!category.results[0]) return NextResponse.json({ error: 'Choose a valid category' }, { status: 400 });
      resolvedCategoryId = category.results[0].id;
      resolvedCategorySlug = category.results[0].slug;
    }
    if (!resolvedCategorySlug) return NextResponse.json({ error: 'Choose a category for this product.' }, { status: 400 });

    const currentVariants = await d1Query<{ id: string }>('SELECT id FROM product_variants WHERE product_id = ?', [id]);
    const currentIds = new Set(currentVariants.results.map((variant) => variant.id));
    const suppliedExistingIds = variants.filter((variant) => variant.id).map((variant) => String(variant.id));
    if (suppliedExistingIds.some((variantId: string) => !currentIds.has(variantId))) {
      return NextResponse.json({ error: 'A pack does not belong to this product. Refresh and try again.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const nextStatus = status === 'active' ? 'published' : status;
    const statements = [{
      sql: `UPDATE products
               SET name = ?, slug = ?, category_slug = ?, short_description = ?,
                   description = ?, long_description = ?, category_id = ?, status = ?, updated_at = ?
             WHERE id = ?`,
      params: [name.trim(), slug.trim(), resolvedCategorySlug, shortDescription.trim(),
        (longDescription ?? description).trim(), (longDescription ?? description).trim(),
        resolvedCategoryId, nextStatus, now, id],
    }];

    const keptIds = new Set<string>();
    for (const [index, variant] of variants.entries()) {
      const variantId = variant.id ? String(variant.id) : crypto.randomUUID();
      const weight = Number(variant.weightGrams);
      const price = Number(variant.pricePaise);
      const stock = variant.stock === '' || variant.stock == null ? null : Number(variant.stock);
      const active = variant.isActive === false ? 0 : 1;
      const variantStatus = active ? 'active' : 'inactive';
      keptIds.add(variantId);
      if (currentIds.has(variantId)) {
        statements.push({
          sql: `UPDATE product_variants
                   SET label = ?, weight_grams = ?, price_paise = ?, sku = ?, stock_qty = ?,
                       is_active = ?, sort_order = ?, name = ?, weight = ?, price = ?, stock = ?,
                       status = ?, updated_at = ?
                 WHERE id = ? AND product_id = ?`,
          params: [variant.label.trim(), weight, price, variant.sku.trim(), stock, active, index,
            variant.label.trim(), variant.label.trim(), price, stock, variantStatus, now, variantId, id],
        });
      } else {
        statements.push({
          sql: `INSERT INTO product_variants (
                 id, product_id, label, weight_grams, price_paise, sku, stock_qty, min_qty,
                 max_qty, step, is_active, sort_order, created_at, updated_at,
                 name, weight, price, stock, status
               ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [variantId, id, variant.label.trim(), weight, price, variant.sku.trim(), stock,
            active, index, now, now, variant.label.trim(), variant.label.trim(), price, stock, variantStatus],
        });
      }
    }

    const removedIds = [...currentIds].filter((variantId) => !keptIds.has(variantId));
    if (removedIds.length) {
      statements.push({
        sql: `UPDATE product_variants SET is_active = 0, status = 'inactive', updated_at = ? WHERE product_id = ? AND id IN (${removedIds.map(() => '?').join(',')})`,
        params: [now, id, ...removedIds],
      });
    }

    await d1Batch(statements);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Product could not be updated. Check the slug and SKU are unique.' }, { status: 400 });
  }
}
