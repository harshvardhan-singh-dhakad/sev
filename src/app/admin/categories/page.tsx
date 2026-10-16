'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string; status: string; description?: string | null }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/categories?status=active&limit=100', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Categories could not be loaded.');
      setCategories(data.categories ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Categories could not be loaded.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void loadCategories(); }, []);

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, slug, description, status: 'active' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Category could not be created.');
      toast.success('Category added to the store catalog.');
      setName(''); setSlug(''); setDescription(''); setShowCreate(false);
      await loadCategories();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Category could not be created.'); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Store catalog</p><h1 className="mt-1 text-2xl font-black text-slate-900">Categories</h1><p className="mt-1 text-sm text-slate-600">Active categories displayed on the homepage and shop filters.</p></div><div className="flex gap-2"><button type="button" onClick={() => void loadCategories()} className="btn btn-outline" aria-label="Refresh categories"><RefreshCw size={16} /></button><button type="button" onClick={() => setShowCreate((current) => !current)} className="btn btn-primary"><Plus size={16} /> Add category</button></div></header>
    {showCreate && <form onSubmit={createCategory} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"><label className="form-label">Category name *<input required value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!slug) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="form-input mt-2" /></label><label className="form-label">URL slug *<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} className="form-input mt-2" /></label><label className="form-label sm:col-span-2">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="form-input mt-2" /></label><div className="flex justify-end sm:col-span-2"><button disabled={saving} className="btn btn-primary"><Save size={15} />{saving ? 'Saving…' : 'Save category'}</button></div></form>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-8 text-sm text-slate-500">Loading categories…</p> : categories.length === 0 ? <p className="p-10 text-center text-sm text-slate-600">No active categories yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{categories.map((category) => <tr key={category.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{category.name}</p>{category.description && <p className="mt-1 text-xs text-slate-500">{category.description}</p>}</td><td className="px-5 py-4 text-slate-600">{category.slug}</td><td className="px-5 py-4 capitalize text-slate-600">{category.status}</td></tr>)}</tbody></table></div>}</div>
  </div>;
}
