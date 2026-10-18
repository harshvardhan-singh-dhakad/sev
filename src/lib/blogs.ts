import { d1Query } from '@/lib/d1';

export interface PublishedBlog {
  id: string;
  title: string;
  slug: string;
  author: string;
  categoryName: string | null;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
}

function mapBlog(row: Record<string, unknown>): PublishedBlog {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    author: row.author ? String(row.author) : 'Aron Bites',
    categoryName: row.category_name ? String(row.category_name) : null,
    excerpt: row.excerpt ? String(row.excerpt) : '',
    content: String(row.content || ''),
    featuredImage: row.featured_image ? String(row.featured_image) : null,
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
  };
}

export async function getPublishedBlogs(limit = 50): Promise<PublishedBlog[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  const result = await d1Query<Record<string, unknown>>(
    `SELECT id, title, slug, author, category_name, excerpt, content,
            featured_image, seo_title, seo_description, published_at
       FROM blogs WHERE status = 'published'
      ORDER BY published_at DESC LIMIT ?`,
    [safeLimit],
  );
  return result.results.map(mapBlog);
}

export async function getPublishedBlog(slug: string): Promise<PublishedBlog | null> {
  const result = await d1Query<Record<string, unknown>>(
    `SELECT id, title, slug, author, category_name, excerpt, content,
            featured_image, seo_title, seo_description, published_at
       FROM blogs WHERE status = 'published' AND slug = ? LIMIT 1`,
    [slug],
  );
  return result.results[0] ? mapBlog(result.results[0]) : null;
}

// Blog HTML is admin-authored, but still render only a small safe tag allowlist.
export function safeBlogHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|svg)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?(?!p\b|h[2-4]\b|ul\b|ol\b|li\b|strong\b|em\b|b\b|i\b|blockquote\b|pre\b|code\b|br\b|hr\b)[a-z][^>]*>/gi, '')
    .replace(/<(p|h[2-4]|ul|ol|li|strong|em|b|i|blockquote|pre|code|br|hr)\b[^>]*>/gi, '<$1>')
    .replace(/<\/(p|h[2-4]|ul|ol|li|strong|em|b|i|blockquote|pre|code|br|hr)\s*>/gi, '</$1>');
}
