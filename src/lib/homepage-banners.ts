import { execute, queryFirst } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { BANNER_PLACEMENTS, type BannerPlacement, type HomepageBanner } from '@/lib/homepage-banner-types';

export type { BannerPlacement, HomepageBanner } from '@/lib/homepage-banner-types';

const SETTING_KEY = 'homepage_banners';
const ALLOWED_PLACEMENTS = new Set<string>(BANNER_PLACEMENTS.map((item) => item.value));

export function normalizeBanners(input: unknown): HomepageBanner[] {
  if (!Array.isArray(input) || input.length > 10) throw new Error('You can add up to 10 homepage banners.');
  return input.map((value) => {
    const item = value as Partial<HomepageBanner>;
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, 120) : '';
    const imageUrl = typeof item.imageUrl === 'string' ? item.imageUrl.trim().slice(0, 1000) : '';
    const imageAlt = typeof item.imageAlt === 'string' ? item.imageAlt.trim().slice(0, 200) : '';
    const linkUrl = typeof item.linkUrl === 'string' ? item.linkUrl.trim().slice(0, 1000) : '';
    const placement = typeof item.placement === 'string' ? item.placement : '';
    const startsAt = typeof item.startsAt === 'string' ? item.startsAt.trim() : '';
    const endsAt = typeof item.endsAt === 'string' ? item.endsAt.trim() : '';
    const displayOrder = Number(item.displayOrder);
    if (!title || !imageUrl || !imageAlt || !ALLOWED_PLACEMENTS.has(placement)) {
      throw new Error('Each banner needs a title, poster, alt text, and a valid placement.');
    }
    if (!(imageUrl.startsWith('/') && !imageUrl.startsWith('//')) && !/^https:\/\//i.test(imageUrl)) {
      throw new Error('Poster URL must be a local path or secure HTTPS URL.');
    }
    if (linkUrl && !(linkUrl.startsWith('/') && !linkUrl.startsWith('//')) && !/^https:\/\//i.test(linkUrl)) {
      throw new Error('Banner link must be a local path or secure HTTPS URL.');
    }
    if ((startsAt && !Number.isFinite(Date.parse(startsAt))) || (endsAt && !Number.isFinite(Date.parse(endsAt)))) {
      throw new Error('Enter valid start and end dates.');
    }
    if (startsAt && endsAt && Date.parse(startsAt) >= Date.parse(endsAt)) {
      throw new Error('The end date must be after the start date.');
    }
    return {
      id: typeof item.id === 'string' && item.id ? item.id.slice(0, 80) : crypto.randomUUID(),
      title,
      imageUrl,
      imageAlt,
      linkUrl,
      placement: placement as BannerPlacement,
      displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.min(999, Math.round(displayOrder))) : 0,
      enabled: Boolean(item.enabled),
      startsAt,
      endsAt,
    };
  });
}

export async function getAdminHomepageBanners(): Promise<HomepageBanner[]> {
  try {
    const setting = await queryFirst<{ value: string }>('SELECT value FROM settings WHERE key = ?', [SETTING_KEY]);
    if (!setting?.value) return [];
    return normalizeBanners(JSON.parse(setting.value));
  } catch {
    return [];
  }
}

export async function getPublishedHomepageBanners(): Promise<HomepageBanner[]> {
  const banners = await getAdminHomepageBanners();
  const now = Date.now();
  return banners.filter((banner) =>
    banner.enabled &&
    (!banner.startsAt || Date.parse(banner.startsAt) <= now) &&
    (!banner.endsAt || Date.parse(banner.endsAt) > now)
  );
}

export async function saveHomepageBanners(
  banners: unknown,
  userId: string,
  userName: string
): Promise<HomepageBanner[]> {
  const normalized = normalizeBanners(banners);
  const before = await getAdminHomepageBanners();
  const mediaCounts = new Map<string, number>();
  for (const banner of before) {
    if (banner.imageUrl.startsWith('/api/media/')) mediaCounts.set(banner.imageUrl, (mediaCounts.get(banner.imageUrl) || 0) - 1);
  }
  for (const banner of normalized) {
    if (banner.imageUrl.startsWith('/api/media/')) mediaCounts.set(banner.imageUrl, (mediaCounts.get(banner.imageUrl) || 0) + 1);
  }
  for (const [url, delta] of mediaCounts) {
    if (delta !== 0) {
      await execute('UPDATE media SET usage_count = MAX(0, usage_count + ?) WHERE url = ?', [delta, url]);
    }
  }
  await execute(
    `INSERT INTO settings (key, value, updated_at, updated_by)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    [SETTING_KEY, JSON.stringify(normalized), new Date().toISOString(), userId]
  );
  await logAuditEvent({
    userId,
    userName,
    userRole: 'owner',
    action: 'settings_change',
    entityType: 'homepage_banners',
    entityId: SETTING_KEY,
    changesBefore: { banners: before },
    changesAfter: { banners: normalized },
  });
  return normalized;
}
