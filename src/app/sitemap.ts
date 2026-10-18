import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { connection } from 'next/server';
import { getPublishedBlogs } from '@/lib/blogs';
import { listStorefrontProducts } from '@/lib/storefront-catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const staticPages: { url: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1.0 },
    { url: absoluteUrl('/shop'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/bulk-orders'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/samples'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/contact'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/shipping-policy'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/refund-policy'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/terms'), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const products = (await listStorefrontProducts({}, 'popular', 1, 100).catch(() => ({ products: [] }))).products;
  const blogs = await getPublishedBlogs(100).catch(() => []);

  return [
    ...staticPages.map((page) => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/shop/${product.slug}`),
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...blogs.map((blog) => ({
      url: absoluteUrl(`/blog/${blog.slug}`),
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
  ];
}
