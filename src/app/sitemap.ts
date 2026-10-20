import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { absoluteUrl } from '@/lib/site-url';
import { d1Query } from '@/lib/d1';

// Ensure the sitemap is never statically frozen at build time,
// and is dynamically re-computed from Cloudflare D1 on every request.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductRow {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
  thumbnail: string | null;
  images: string | null;
}

interface BlogRow {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  featured_image: string | null;
}

interface FestivalRow {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
}

function parseDate(dateStr: unknown, fallback: Date): Date {
  if (typeof dateStr === 'string' && dateStr.trim()) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function extractImageUrls(thumbnail: unknown, imagesRaw: unknown): string[] {
  const urls: string[] = [];
  if (typeof thumbnail === 'string' && thumbnail.trim()) {
    urls.push(thumbnail.trim());
  }
  if (typeof imagesRaw === 'string' && imagesRaw.trim()) {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string' && item.trim()) {
            urls.push(item.trim());
          } else if (
            item &&
            typeof item === 'object' &&
            'src' in item &&
            typeof (item as { src: unknown }).src === 'string'
          ) {
            urls.push((item as { src: string }).src.trim());
          }
        }
      }
    } catch {
      // Invalid or non-JSON string, ignore
    }
  }

  return Array.from(new Set(urls.filter((url) => typeof url === 'string' && url.length > 0))).map((url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return absoluteUrl(url.startsWith('/') ? url : `/${url}`);
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Opt in to dynamic request-time rendering
  await connection();
  const now = new Date();

  // 1. Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/shop'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/bulk-orders'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/custom-box'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: absoluteUrl('/samples'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/track-order'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/shipping-policy'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/refund-policy'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Dynamic Products directly from Cloudflare D1
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { results: products } = await d1Query<ProductRow>(
      `SELECT slug, updated_at, created_at, thumbnail, images
       FROM products
       WHERE status IN ('active', 'published')
       ORDER BY updated_at DESC, created_at DESC`
    );

    productPages = (products || [])
      .filter((p) => p.slug && p.slug.trim())
      .map((product) => {
        const lastMod = parseDate(product.updated_at || product.created_at, now);
        const images = extractImageUrls(product.thumbnail, product.images);

        return {
          url: absoluteUrl(`/shop/${product.slug.trim()}`),
          lastModified: lastMod,
          changeFrequency: 'daily',
          priority: 0.85,
          ...(images.length > 0 ? { images } : {}),
        };
      });
  } catch (error) {
    console.error('[sitemap] Failed to fetch products from D1:', error);
  }

  // 3. Dynamic Blogs from Cloudflare D1
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { results: blogs } = await d1Query<BlogRow>(
      `SELECT slug, published_at, updated_at, created_at, featured_image
       FROM blogs
       WHERE status = 'published'
       ORDER BY published_at DESC, created_at DESC`
    );

    blogPages = (blogs || [])
      .filter((b) => b.slug && b.slug.trim())
      .map((blog) => {
        const lastMod = parseDate(blog.published_at || blog.updated_at || blog.created_at, now);
        const images = blog.featured_image ? extractImageUrls(blog.featured_image, null) : [];

        return {
          url: absoluteUrl(`/blog/${blog.slug.trim()}`),
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.75,
          ...(images.length > 0 ? { images } : {}),
        };
      });
  } catch (error) {
    console.error('[sitemap] Failed to fetch blogs from D1:', error);
  }

  // 4. Dynamic Festivals / Occasions from Cloudflare D1
  let festivalPages: MetadataRoute.Sitemap = [];
  try {
    const { results: festivals } = await d1Query<FestivalRow>(
      `SELECT slug, updated_at, created_at, banner_url, thumbnail_url
       FROM festivals
       WHERE is_active = 1
       ORDER BY sort_order ASC, created_at DESC`
    );

    festivalPages = (festivals || [])
      .filter((f) => f.slug && f.slug.trim())
      .map((festival) => {
        const lastMod = parseDate(festival.updated_at || festival.created_at, now);
        const images = extractImageUrls(festival.thumbnail_url || festival.banner_url, null);

        return {
          url: absoluteUrl(`/festive/${festival.slug.trim()}`),
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8,
          ...(images.length > 0 ? { images } : {}),
        };
      });
  } catch (error) {
    console.error('[sitemap] Failed to fetch festivals from D1:', error);
  }

  return [...staticPages, ...productPages, ...blogPages, ...festivalPages];
}

