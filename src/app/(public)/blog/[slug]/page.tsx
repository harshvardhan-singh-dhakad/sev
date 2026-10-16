import type { Metadata } from 'next';
import { connection } from 'next/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import { getPublishedBlog, safeBlogHtml } from '@/lib/blogs';
import { absoluteUrl } from '@/lib/site-url';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlog(slug).catch(() => null);
  if (!post) return { title: 'Article Not Found', robots: { index: false, follow: false } };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: post.publishedAt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlog(slug).catch(() => null);
  if (!post) notFound();

  const articleUrl = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.excerpt, datePublished: post.publishedAt || undefined,
    author: { '@type': 'Organization', name: post.author }, mainEntityOfPage: articleUrl,
    image: post.featuredImage ? [post.featuredImage] : undefined,
  };

  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 max-w-4xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <article>
          <header className="mb-8">
            {post.categoryName ? <p className="text-sm font-bold uppercase text-primary">{post.categoryName}</p> : null}
            <h1 className="text-4xl sm:text-5xl font-black mt-2">{post.title}</h1>
            <p className="text-sm text-gray-600 mt-4">By {post.author}{post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('en-IN')}` : ''}</p>
          </header>
          {post.featuredImage ? <Image src={post.featuredImage} alt="" width={1200} height={675} priority className="w-full rounded-2xl aspect-video object-cover mb-8" /> : null}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeBlogHtml(post.content) }} />
        </article>
      </main>
    </PublicLayout>
  );
}
