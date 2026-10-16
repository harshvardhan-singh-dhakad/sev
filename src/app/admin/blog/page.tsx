'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';

interface BlogPost { id: string; title: string; slug: string; status: string; author: string; publishedAt?: string | null; updatedAt?: string }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPosts() {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/blogs?status=${status}&limit=50`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Blog posts could not be loaded.');
      setPosts(data.blogs ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Blog posts could not be loaded.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void loadPosts(); }, [status]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Content & media</p><h1 className="mt-1 text-2xl font-black text-slate-900">Blog posts</h1><p className="mt-1 text-sm text-slate-600">Drafts and published articles stored in D1.</p></div>
        <div className="flex items-center gap-2">
          <select aria-label="Blog status" value={status} onChange={(event) => setStatus(event.target.value)} className="form-select"><option value="published">Published</option><option value="draft">Drafts</option></select>
          <button type="button" onClick={() => void loadPosts()} className="btn btn-outline" aria-label="Refresh posts"><RefreshCw size={16} /></button>
          <Link href="/admin/blog/new" className="btn btn-primary"><Plus size={16} /> New post</Link>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-8 text-sm text-slate-500">Loading posts…</p> : posts.length === 0 ? <div className="p-10 text-center"><h2 className="font-bold text-slate-900">No {status} posts yet</h2><p className="mt-1 text-sm text-slate-600">Create an article to publish it on the public blog.</p></div> :
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{posts.map((post) => <tr key={post.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{post.title}</p><p className="text-xs text-slate-500">/blog/{post.slug}</p></td><td className="px-5 py-4 text-slate-600">{post.author}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{post.status}</span></td><td className="px-5 py-4 text-slate-600">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN') : '—'}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
