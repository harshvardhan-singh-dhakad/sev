import { d1Query } from '@/lib/d1';
import type { CatalogCategory, CatalogProduct, CatalogVariant, SpiceLevel } from '@/lib/types';

type Row = Record<string, unknown>;

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return null; }
}

function mapImages(value: unknown, fallback?: unknown): CatalogProduct['images'] {
  const images = parseJson(value);
  const fallbackStr = typeof fallback === 'string' && fallback.trim() ? fallback.trim() : null;
  const parsed = Array.isArray(images) && images.length > 0 ? images : (fallbackStr || parseJson(fallback));
  if (typeof parsed === 'string' && parsed) return [{ src: parsed, alt: '', sort: 0, is_primary: true, variant_ids: [] }];
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item, index) => {
    if (typeof item === 'string' && item) return [{ src: item, alt: '', sort: index, is_primary: index === 0, variant_ids: [] }];
    if (!item || typeof item !== 'object') return [];
    const image = item as Row;
    const src = String(image.src ?? image.url ?? image.image ?? '');
    return src ? [{
      src,
      alt: String(image.alt ?? ''),
      sort: Number(image.sort ?? index),
      is_primary: Boolean(image.is_primary ?? index === 0),
      variant_ids: Array.isArray(image.variant_ids) ? image.variant_ids.map(String) : [],
    }] : [];
  });
}

function mapProduct(row: Row, variants: Row[]): CatalogProduct {
  const images = mapImages(row.images, row.thumbnail);
  const mappedVariants: CatalogVariant[] = variants.map((variant) => {
    const weight = Number(variant.weight_grams ?? 0);
    return {
      id: String(variant.id),
      label: String(variant.label ?? variant.weight ?? variant.name ?? `${weight}g`),
      weight_grams: weight,
      price: Number(variant.price ?? variant.price_paise ?? 0),
      mrp: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
      sku: String(variant.sku ?? ''),
      stock_qty: variant.stock_qty == null ? (variant.stock == null ? null : Number(variant.stock)) : Number(variant.stock_qty),
      min_qty: Number(variant.min_qty ?? 1),
      max_qty: variant.max_qty == null ? null : Number(variant.max_qty),
      step: Number(variant.step ?? 1),
      is_active: variant.status ? variant.status === 'active' : Boolean(Number(variant.is_active ?? 1)),
      sort_order: Number(variant.sort_order ?? 0),
      badge: null,
      image: (typeof variant.image === 'string' && (variant.image.trim().startsWith('{') || variant.image.trim().startsWith('[')))
        ? (() => {
            try {
              const p = JSON.parse(variant.image.trim());
              return Array.isArray(p) ? p[0] : (p.front || p[Object.keys(p)[0]] || null);
            } catch { return String(variant.image); }
          })()
        : (variant.image ? String(variant.image) : null),
    };
  });

  // Ensure each pack/variant image (Front & Back) is registered in the images array with variant_ids
  variants.forEach((v) => {
    const vId = String(v.id);
    let vImages: Array<{ url: string; label: string }> = [];

    if (v.image && typeof v.image === 'string' && v.image.trim()) {
      const raw = v.image.trim();
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            vImages = parsed.filter(Boolean).map((u, i) => ({ url: String(u), label: i === 0 ? 'Front' : 'Back' }));
          } else if (typeof parsed === 'object' && parsed !== null) {
            if (parsed.front) vImages.push({ url: String(parsed.front), label: 'Front' });
            if (parsed.back) vImages.push({ url: String(parsed.back), label: 'Back' });
          }
        } catch {
          vImages = [{ url: raw, label: 'Front' }];
        }
      } else {
        vImages = [{ url: raw, label: 'Front' }];
      }
    }

    vImages.forEach((imgItem) => {
      const existing = images.find((img) => img.src === imgItem.url);
      if (existing) {
        if (!existing.variant_ids.includes(vId)) {
          existing.variant_ids.push(vId);
        }
      } else {
        images.push({
          src: imgItem.url,
          alt: `${row.name} - ${v.label || v.weight || 'Pack'} (${imgItem.label})`,
          sort: images.length,
          is_primary: images.length === 0,
          variant_ids: [vId],
        });
      }
    });
  });

  const rawStatus = String(row.status ?? 'draft');
  const status = rawStatus === 'published' ? 'active' : rawStatus;
  return {
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category_slug ?? row.categorySlug ?? ''),
    short_description: String(row.short_description ?? ''),
    description: String(row.long_description ?? row.description ?? ''),
    spice_level: (['mild', 'medium', 'hot'].includes(String(row.spice_level)) ? row.spice_level : 'mild') as SpiceLevel,
    ingredients: row.ingredients == null ? null : String(row.ingredients),
    allergens: row.allergens == null ? null : String(row.allergens),
    shelf_life_days: Number(row.shelf_life_days ?? 0),
    storage: String(row.storage ?? row.storage_instructions ?? ''),
    veg_mark: row.veg_mark === 'non-veg' ? 'non-veg' : 'veg',
    country_of_origin: String(row.country_of_origin ?? 'India'),
    usage_ideas: [],
    status: status === 'active' || status === 'archived' ? status : 'draft',
    featured: Boolean(Number(row.featured ?? 0) || Number(row.best_seller ?? 0)),
    badge: row.badge == null ? null : String(row.badge),
    default_variant_id: String(mappedVariants[0]?.id ?? ''),
    images,
    variants: mappedVariants,
  };
}

export async function getStorefrontCategories(): Promise<CatalogCategory[]> {
  const { results } = await d1Query<Row>(
    `SELECT c.slug, c.name, COALESCE(c.description, '') AS description,
            c.display_order, c.status, c.image
     FROM product_categories c
     WHERE c.status = 'active'
     ORDER BY c.display_order ASC, c.name ASC`
  );
  return results.map((row) => ({
    slug: String(row.slug), name: String(row.name), description: String(row.description ?? ''),
    display_order: Number(row.display_order ?? 0), status: 'active',
    ...(row.image ? { image: String(row.image) } : {}),
  }));
}

export interface StorefrontProductFilters {
  category?: string | null;
  spice_level?: SpiceLevel | null;
  search?: string | null;
  featured?: boolean | null;
}

export type StorefrontSort = 'popular' | 'price_asc' | 'price_desc' | 'newest';

export async function listStorefrontProducts(
  filters: StorefrontProductFilters = {}, sort: StorefrontSort = 'popular', page = 1, limit = 12,
) {
  const conditions = ["p.status IN ('active', 'published')"];
  const params: (string | number)[] = [];
  if (filters.category && filters.category !== 'all') { conditions.push('COALESCE(pc.slug, p.category_slug) = ?'); params.push(filters.category); }
  if (filters.spice_level) { conditions.push('p.spice_level = ?'); params.push(filters.spice_level); }
  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.short_description LIKE ? OR pc.name LIKE ?)');
    const query = `%${filters.search.trim()}%`;
    params.push(query, query, query);
  }
  if (filters.featured === true) conditions.push('(p.featured = 1 OR p.best_seller = 1)');

  const where = `WHERE ${conditions.join(' AND ')}`;
  const totals = await d1Query<Row>(
    `SELECT COUNT(DISTINCT p.id) AS total FROM products p
     LEFT JOIN product_categories pc ON pc.id = p.category_id
     INNER JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active' ${where}`,
    params,
  );
  const total = Number(totals.results[0]?.total ?? 0);
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const order = sort === 'price_asc' ? 'min_price ASC' : sort === 'price_desc' ? 'min_price DESC' : sort === 'newest' ? 'p.created_at DESC' : 'p.featured DESC, p.best_seller DESC, p.sort_order ASC, p.created_at DESC';
  const { results } = await d1Query<Row>(
    `SELECT p.*, COALESCE(pc.slug, p.category_slug) AS category_slug,
            MIN(COALESCE(pv.price, pv.price_paise)) AS min_price
     FROM products p
     LEFT JOIN product_categories pc ON pc.id = p.category_id
     INNER JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
     ${where}
     GROUP BY p.id ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, safeLimit, (safePage - 1) * safeLimit],
  );
  const ids = results.map((row) => String(row.id));
  const variants = ids.length ? (await d1Query<Row>(
    `SELECT * FROM product_variants WHERE product_id IN (${ids.map(() => '?').join(',')})
     AND status = 'active' ORDER BY COALESCE(sort_order, 0), weight_grams`, ids,
  )).results : [];
  const products = results.map((row) => mapProduct(row, variants.filter((variant) => variant.product_id === row.id)));
  return { products, total, page: safePage, limit: safeLimit, totalPages: Math.max(1, Math.ceil(total / safeLimit)) };
}

export async function getStorefrontProduct(slug: string): Promise<CatalogProduct | null> {
  const { results } = await d1Query<Row>(
    `SELECT p.*, COALESCE(pc.slug, p.category_slug) AS category_slug FROM products p
     LEFT JOIN product_categories pc ON pc.id = p.category_id
     WHERE p.slug = ? AND p.status IN ('active', 'published') LIMIT 1`, [slug],
  );
  const row = results[0];
  if (!row) return null;
  const variants = await d1Query<Row>(
    `SELECT * FROM product_variants WHERE product_id = ?
     AND status = 'active' ORDER BY COALESCE(sort_order, 0), weight_grams`, [String(row.id)],
  );
  return variants.results.length ? mapProduct(row, variants.results) : null;
}

export async function getRelatedStorefrontProducts(slug: string, category: string, limit = 4) {
  const { products } = await listStorefrontProducts({ category }, 'popular', 1, limit + 1);
  const related = products.filter((product) => product.slug !== slug).slice(0, limit);
  if (related.length >= limit) return related;
  const more = await listStorefrontProducts({}, 'popular', 1, limit + 1);
  return [...related, ...more.products.filter((product) => product.slug !== slug && !related.some((item) => item.slug === product.slug))].slice(0, limit);
}
