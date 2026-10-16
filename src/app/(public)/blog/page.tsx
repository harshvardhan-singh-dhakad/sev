import type { Metadata } from 'next';
import { connection } from 'next/server';
import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import { getPublishedBlogs, type PublishedBlog } from '@/lib/blogs';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Sev Stories & Recipes',
  description: 'Recipes, serving ideas, and stories about authentic Indian sev and namkeen from Rasvat.',
  alternates: { canonical: absoluteUrl('/blog') },
};

export default async function BlogPage() {
  await connection();
  let blogs: PublishedBlog[] = [];
  try { blogs = await getPublishedBlogs(); } catch { /* Show the empty state while the blog database is unavailable. */ }

  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 min-h-[55vh]">
        <header className="max-w-2xl mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Rasvat Journal</p>
          <h1 className="text-4xl font-black mt-2">Sev Stories & Recipes</h1>
          <p className="mt-3 text-gray-600">Ideas, recipes, and stories from the world of sev and namkeen.</p>
        </header>
        {blogs.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article key={blog.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <Link href={`/blog/${blog.slug}`} className="block">
                  {blog.featuredImage ? <Image src={blog.featuredImage} alt="" width={640} height={360} className="w-full aspect-video object-cover" /> : null}
                  <div className="p-5">
                    {blog.categoryName ? <p className="text-xs uppercase text-primary font-bold">{blog.categoryName}</p> : null}
                    <h2 className="text-xl font-bold mt-2">{blog.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">{blog.excerpt}</p>
                    {blog.publishedAt ? <time className="block text-xs text-gray-500 mt-4" dateTime={blog.publishedAt}>{new Date(blog.publishedAt).toLocaleDateString('en-IN')}</time> : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : <p className="rounded-xl bg-white border border-gray-200 p-6 text-gray-600">No articles are published yet. Please check back soon.</p>}
      </main>
    </PublicLayout>
  );
}
