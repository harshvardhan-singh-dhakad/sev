/**
 * Rasvat Catalog Module
 * The SINGLE authoritative entry point for pages and components to access product data.
 * All seed data is encapsulated behind this interface.
 */

import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_STORE_SETTINGS } from './data/seed-products';
import { EDGE_CASE_FIXTURES } from './data/fixtures';
import {
  CatalogCategory as Category,
  CatalogImage as Image,
  CatalogProduct as Product,
  CatalogVariant as Variant,
  SpiceLevel,
  StoreSettings as Settings,
} from './types';

export type { Product, Variant, Image, Category, Settings, SpiceLevel };

export interface ProductFilters {
  category?: string | null;
  spice_level?: SpiceLevel | null;
  search?: string | null;
  min_price?: number | null; // in paise
  max_price?: number | null; // in paise
  status?: 'active' | 'draft' | 'archived';
  featured?: boolean | null;
}

export type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest';

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Returns default variant of a product (usually 250g).
 */
export function getDefaultVariant(product: Product): Variant {
  const found = product.variants.find((v) => v.id === product.default_variant_id);
  return found || product.variants[0];
}

/**
 * Lists catalog products with comprehensive filtering, sorting, and pagination.
 */
export function listProducts(
  filters: ProductFilters = {},
  sort: SortOption = 'popular',
  page: number = 1,
  limit: number = 12
): PaginatedProducts {
  const targetStatus = filters.status || 'active';

  // Strictly filter by status (fixtures are 'draft' so they are not included in public catalog)
  let items = SEED_PRODUCTS.filter((p) => p.status === targetStatus);

  // Category filter
  if (filters.category && filters.category !== 'all') {
    const cat = filters.category.toLowerCase().trim();
    items = items.filter((p) => p.category.toLowerCase() === cat);
  }

  // Spice level filter
  if (filters.spice_level) {
    items = items.filter((p) => p.spice_level === filters.spice_level);
  }

  // Search filter
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Featured filter
  if (typeof filters.featured === 'boolean') {
    items = items.filter((p) => p.featured === filters.featured);
  }

  // Price range filter (based on default variant price in paise)
  if (typeof filters.min_price === 'number') {
    items = items.filter((p) => getDefaultVariant(p).price >= filters.min_price!);
  }
  if (typeof filters.max_price === 'number') {
    items = items.filter((p) => getDefaultVariant(p).price <= filters.max_price!);
  }

  // Sorting
  const sorted = [...items].sort((a, b) => {
    const priceA = getDefaultVariant(a).price;
    const priceB = getDefaultVariant(b).price;

    switch (sort) {
      case 'price_asc':
        return priceA - priceB;
      case 'price_desc':
        return priceB - priceA;
      case 'newest':
        return a.slug.localeCompare(b.slug);
      case 'popular':
      default:
        // Featured first, then products with badges, then stable order
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.badge && !b.badge) return -1;
        if (!a.badge && b.badge) return 1;
        return a.slug.localeCompare(b.slug);
    }
  });

  const total = sorted.length;
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (safePage - 1) * limit;
  const paginatedItems = sorted.slice(offset, offset + limit);

  return {
    products: paginatedItems,
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

/**
 * Retrieves a single product by slug.
 * Also checks edge-case fixtures for testing and QA preview if not found in active seeds.
 */
export function getProductBySlug(slug: string, includeFixtures: boolean = true): Product | null {
  const cleanSlug = slug.toLowerCase().trim();
  const foundSeed = SEED_PRODUCTS.find((p) => p.slug.toLowerCase() === cleanSlug);
  if (foundSeed) return foundSeed;

  if (includeFixtures) {
    const foundFixture = EDGE_CASE_FIXTURES.find((f) => f.slug.toLowerCase() === cleanSlug);
    if (foundFixture) return foundFixture;
  }

  return null;
}

/**
 * Returns related products (prioritizing same category first, then featured).
 */
export function getRelatedProducts(
  productSlug: string,
  categorySlug: string,
  limit: number = 4
): Product[] {
  const currentSlug = productSlug.toLowerCase().trim();
  const currentCat = categorySlug.toLowerCase().trim();

  const sameCategory = SEED_PRODUCTS.filter(
    (p) => p.status === 'active' && p.category.toLowerCase() === currentCat && p.slug.toLowerCase() !== currentSlug
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const otherProducts = SEED_PRODUCTS.filter(
    (p) =>
      p.status === 'active' &&
      p.slug.toLowerCase() !== currentSlug &&
      !sameCategory.some((sc) => sc.slug === p.slug)
  );

  return [...sameCategory, ...otherProducts].slice(0, limit);
}

/**
 * Returns all active product categories.
 */
export function listCategories(): Category[] {
  return [...SEED_CATEGORIES].sort((a, b) => a.display_order - b.display_order);
}

/**
 * Returns official store settings (minimum cart threshold, limits, etc.).
 */
export function getStoreSettings(): Settings {
  return { ...SEED_STORE_SETTINGS };
}
