import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { connection } from 'next/server';
import { getPublishedBlogs } from '@/lib/blogs';
import { listStorefrontProducts } from '@/lib/storefront-catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const staticPages = [
    '/', '/shop', '/about', '/bulk-orders', '/samples', '/contact', '/blog',
    '/shipping-policy', '/refund-policy', '/privacy-policy', '/terms',
  ];
  const products = (await listStorefrontProducts({}, 'popular', 1, 100).catch(() => ({ products: [] }))).products;
  const blogs = await getPublishedBlogs(100).catch(() => []);

  return [
    ...staticPages.map((path) => ({ url: absoluteUrl(path) })),
    ...products.map((product) => ({
      url: absoluteUrl(`/shop/${product.slug}`),
      lastModified: new Date(),
    })),
    ...blogs.map((blog) => ({
      url: absoluteUrl(`/blog/${blog.slug}`),
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : undefined,
    })),
  ];
}
