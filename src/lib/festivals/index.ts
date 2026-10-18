import { d1Query, d1Execute } from '@/lib/d1';

export type ReligionCategory = 'universal' | 'hindu' | 'muslim' | 'sikh' | 'christian';

export interface FestivalRecord {
  id: string;
  name: string;
  slug: string;
  religionCategory: ReligionCategory;
  tagline: string;
  description: string;
  bannerUrl: string;
  thumbnailUrl: string;
  themeColor: string;
  greetingTemplates: string[];
  featuredProductIds: string[];
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

function parseJsonArray(jsonStr: unknown): string[] {
  if (Array.isArray(jsonStr)) return jsonStr as string[];
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapFestivalRow(row: Record<string, unknown>): FestivalRecord {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    religionCategory: (row.religion_category as ReligionCategory) || 'universal',
    tagline: String(row.tagline || ''),
    description: String(row.description || ''),
    bannerUrl: String(row.banner_url || ''),
    thumbnailUrl: String(row.thumbnail_url || ''),
    themeColor: String(row.theme_color || '#d97706'),
    greetingTemplates: parseJsonArray(row.greeting_templates),
    featuredProductIds: parseJsonArray(row.featured_product_ids),
    isActive: Boolean(row.is_active),
    startsAt: (row.starts_at as string | null) || null,
    endsAt: (row.ends_at as string | null) || null,
    sortOrder: Number(row.sort_order || 0),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

export async function listActiveFestivals(): Promise<FestivalRecord[]> {
  const result = await d1Query(
    `SELECT * FROM festivals WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC`
  );
  return result.results.map((row: Record<string, unknown>) => mapFestivalRow(row));
}

export async function getFestivalBySlug(slug: string): Promise<FestivalRecord | null> {
  const result = await d1Query(
    `SELECT * FROM festivals WHERE slug = ? LIMIT 1`,
    [slug.toLowerCase().trim()]
  );
  if (result.results.length === 0) return null;
  return mapFestivalRow(result.results[0] as Record<string, unknown>);
}

export async function listAllFestivals(): Promise<FestivalRecord[]> {
  const result = await d1Query(
    `SELECT * FROM festivals ORDER BY sort_order ASC, created_at DESC`
  );
  return result.results.map((row: Record<string, unknown>) => mapFestivalRow(row));
}

export interface GiftBoxRecord {
  id: string;
  festivalId: string;
  festivalName?: string;
  title: string;
  slug: string;
  imageUrl: string;
  pricePaise: number;
  comparePricePaise: number | null;
  weightLabel: string;
  description: string;
  itemsIncluded: string[];
  badge: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function mapGiftBoxRow(row: Record<string, unknown>): GiftBoxRecord {
  return {
    id: String(row.id),
    festivalId: String(row.festival_id || ''),
    festivalName: row.festival_name ? String(row.festival_name) : undefined,
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    imageUrl: String(row.image_url || '/images/placeholder-sev.svg'),
    pricePaise: Number(row.price_paise || 0),
    comparePricePaise: row.compare_price_paise ? Number(row.compare_price_paise) : null,
    weightLabel: String(row.weight_label || ''),
    description: String(row.description || ''),
    itemsIncluded: parseJsonArray(row.items_included),
    badge: (row.badge as string | null) || null,
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

export async function listGiftBoxes(festivalId?: string, activeOnly: boolean = true): Promise<GiftBoxRecord[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (activeOnly) {
    conditions.push('b.is_active = 1');
  }
  if (festivalId) {
    conditions.push('b.festival_id = ?');
    params.push(festivalId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await d1Query(
    `SELECT b.*, f.name as festival_name
     FROM festive_gift_boxes b
     LEFT JOIN festivals f ON b.festival_id = f.id
     ${whereClause}
     ORDER BY b.sort_order ASC, b.created_at DESC`,
    params
  );

  return result.results.map((row: Record<string, unknown>) => mapGiftBoxRow(row));
}

export async function getGiftBoxById(id: string): Promise<GiftBoxRecord | null> {
  const result = await d1Query(
    `SELECT b.*, f.name as festival_name
     FROM festive_gift_boxes b
     LEFT JOIN festivals f ON b.festival_id = f.id
     WHERE b.id = ? LIMIT 1`,
    [id]
  );
  if (result.results.length === 0) return null;
  return mapGiftBoxRow(result.results[0] as Record<string, unknown>);
}

