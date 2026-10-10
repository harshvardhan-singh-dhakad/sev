import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Tag, Newspaper } from 'lucide-react';
import { Blog } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';

const DEMO_BLOGS: Blog[] = [
  {
    id: 'b1',
    title: 'The Art of Making Perfect Indori Sev',
    slug: 'art-of-making-perfect-indori-sev',
    author: 'Rasvat Team',
    authorId: 'a1',
    categoryId: 'c1',
    categoryName: 'Sev',
    tags: ['indori', 'recipe', 'tradition'],
    excerpt:
      'Discover the secret behind the perfect crunch and authentic flavor of Indori Sev — a culinary tradition that dates back generations.',
    content: '',
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 324,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b2',
    title: '5 Ways to Use Sev in Your Daily Cooking',
    slug: '5-ways-to-use-sev-in-daily-cooking',
    author: 'Rasvat Team',
    authorId: 'a1',
    categoryId: 'c2',
    categoryName: 'Recipes',
    tags: ['recipes', 'cooking', 'chaat'],
    excerpt:
      'Beyond the snack bowl — explore creative ways to incorporate premium Sev into your everyday meals, from breakfast to dinner.',
    content: '',
    status: 'published',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 189,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b3',
    title: 'Bulk Sev Buying Guide for Retailers',
    slug: 'bulk-sev-buying-guide-for-retailers',
    author: 'Rasvat Team',
    authorId: 'a1',
    categoryId: 'c3',
    categoryName: 'Business',
    tags: ['bulk', 'wholesale', 'retailers'],
    excerpt:
      'A comprehensive guide for retailers and distributors on sourcing quality Sev in bulk — pricing, quantities, storage and more.',
    content: '',
    status: 'published',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 421,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getLatestBlogs(): Promise<Blog[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blogs?status=published&limit=3`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEMO_BLOGS;
    const data = await res.json();
    return data.blogs?.length ? data.blogs : DEMO_BLOGS;
  } catch {
    return DEMO_BLOGS;
  }
}

export async function BlogPreviewSection() {
  const blogs = await getLatestBlogs();

  return (
    <section
      className="section"
      style={{ background: '#F8FAFC' }}
      aria-labelledby="blog-preview-heading"
    >
      <div className="container-site">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 rounded-full"
              style={{
                background: 'var(--color-accent-tint)',
                color: 'var(--color-primary)',
                padding: '6px 14px',
              }}
            >
              From Our Blog
            </span>
            <h2
              id="blog-preview-heading"
              className="section-heading"
              style={{ color: 'var(--color-ink)', marginBottom: 0 }}
            >
              Sev Stories & Insights
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-neutral-100 flex-shrink-0"
            style={{
              color: 'var(--color-ink)',
              border: '1.5px solid #CBD5E1',
              background: '#FFFFFF',
            }}
          >
            View All Blogs
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
      style={{ border: '1.5px solid #E2E8F0' }}
    >
      {/* Image */}
      <Link href={`/blog/${blog.slug}`}>
        <div
          className="aspect-video overflow-hidden"
          style={{ background: '#F8FAFC' }}
        >
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              width={600}
              height={338}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper size={44} className="text-neutral-400" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-3">
          {blog.categoryName && (
            <span
              className="inline-flex items-center text-xs font-semibold rounded-full"
              style={{
                fontSize: '0.6875rem',
                background: 'var(--color-accent-tint)',
                color: 'var(--color-primary)',
                padding: '6px 14px',
              }}
            >
              <Tag size={10} className="mr-1" />
              {blog.categoryName}
            </span>
          )}
          {blog.publishedAt && (
            <span className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
              <Calendar size={11} />
              {formatDate(blog.publishedAt)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h3
            className="font-bold mb-2.5 group-hover:text-primary transition-colors line-clamp-2"
            style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.0625rem', color: 'var(--color-ink)' }}
          >
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: '#64748B' }}>
          {truncate(blog.excerpt, 120)}
        </p>

        {/* Read more */}
        <Link
          href={`/blog/${blog.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Read More
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}