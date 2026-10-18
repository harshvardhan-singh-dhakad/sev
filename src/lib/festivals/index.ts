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
