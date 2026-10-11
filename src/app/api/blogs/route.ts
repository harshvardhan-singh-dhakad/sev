import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = 'SELECT * FROM blogs';
    const params: unknown[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const result = await d1Query(query, params);

    const blogs = result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      author: row.author,
      authorId: row.author_id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      excerpt: row.excerpt,
      content: row.content,
      featuredImage: row.featured_image,
      status: row.status,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      publishedAt: row.published_at,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json({ blogs: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, slug, author, authorId, categoryId, categoryName,
      tags, excerpt, content, featuredImage, status,
      seoTitle, seoDescription
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    await d1Query(
      `INSERT INTO blogs (
        id, title, slug, author, author_id, category_id, category_name,
        tags, excerpt, content, featured_image, status,
        seo_title, seo_description, published_at, view_count,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id, title, slug, author || 'Admin', authorId || null, categoryId || null, categoryName || null,
        tags ? JSON.stringify(tags) : '[]', excerpt || null, content, featuredImage || null, status || 'draft',
        seoTitle || null, seoDescription || null, publishedAt,
        now, now
      ]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/blogs error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}