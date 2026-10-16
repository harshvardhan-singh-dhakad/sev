'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string }
interface Pack { label: string; weightGrams: string; price: string; sku: string; stock: string }

const emptyPack = (): Pack => ({ label: '', weightGrams: '', price: '', sku: '', stock: '' });

export default function NewAdminProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [packs, setPacks] = useState<Pack[]>([emptyPack()]);

  useEffect(() => {
    fetch('/api/categories?status=active&limit=100', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load categories.');
        setCategories(data.categories ?? []);
      })
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : 'Could not load categories.'));
  }, []);

  const updatePack = (index: number, key: keyof Pack, value: string) => {
    setPacks((current) => current.map((pack, i) => i === index ? { ...pack, [key]: value } : pack));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = categories.find((item) => item.id === categoryId);
    if (!category) { toast.error('Pehle category add karein.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug, categoryId, categorySlug: category.slug,
          shortDescription: description, longDescription: description, status,
          spiceLevel: 'mild', storage: 'Store in a cool, dry place',
          variants: packs.map((pack) => ({
            label: pack.label,
            weightGrams: Number(pack.weightGrams),
            pricePaise: Math.round(Number(pack.price) * 100),
            sku: pack.sku,
            stock: pack.stock === '' ? null : Number(pack.stock),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Product could not be saved.');
      toast.success(status === 'active' ? 'Product published to the shop.' : 'Product saved as a draft.');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Product could not be saved.');
    } finally { setLoading(false); }
  }

  return <div className="mx-auto max-w-3xl space-y-6">
    <header className="flex items-center gap-3"><Link href="/admin/products" className="rounded-lg border border-slate-200 bg-white p-2" aria-label="Back to products"><ArrowLeft size={18} /></Link><div><h1 className="text-2xl font-black text-slate-900">Add product</h1><p className="text-sm text-slate-600">Saved to the catalog used by the public shop.</p></div></header>
    {categories.length === 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No active categories found. Add a category before creating a product.</p>}
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-label">Product name *<input required value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!slug) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="form-input mt-2" /></label>
        <label className="form-label">URL slug *<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} className="form-input mt-2" /></label>
        <label className="form-label">Category *<select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="form-select mt-2"><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="form-label">Publishing status<select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select mt-2"><option value="draft">Draft</option><option value="active">Publish to shop</option></select></label>
      </div>
      <label className="form-label block">Product description *<textarea required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="form-input mt-2" /></label>
      <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Packs and pricing *</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => setPacks((current) => [...current, emptyPack()])} disabled={packs.length >= 10}><Plus size={14} /> Add pack</button></div>
        {packs.map((pack, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="form-label">Pack label *<input required value={pack.label} onChange={(event) => updatePack(index, 'label', event.target.value)} placeholder="250 g" className="form-input mt-1" /></label>
          <label className="form-label">Weight (g) *<input required type="number" min="1" value={pack.weightGrams} onChange={(event) => updatePack(index, 'weightGrams', event.target.value)} className="form-input mt-1" /></label>
          <label className="form-label">Price (₹) *<input required type="number" min="0.01" step="0.01" value={pack.price} onChange={(event) => updatePack(index, 'price', event.target.value)} className="form-input mt-1" /></label>
          <label className="form-label">SKU *<input required value={pack.sku} onChange={(event) => updatePack(index, 'sku', event.target.value)} className="form-input mt-1" /></label>
          <div className="flex items-end gap-2"><label className="form-label flex-1">Stock<input type="number" min="0" value={pack.stock} onChange={(event) => updatePack(index, 'stock', event.target.value)} placeholder="Untracked" className="form-input mt-1" /></label>{packs.length > 1 && <button type="button" onClick={() => setPacks((current) => current.filter((_, i) => i !== index))} className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Remove pack"><Trash2 size={16} /></button>}</div>
        </div>)}
      </section>
      <div className="flex justify-end border-t border-slate-100 pt-4"><button type="submit" disabled={loading || categories.length === 0} className="btn btn-primary"><Save size={16} />{loading ? 'Saving…' : 'Save product'}</button></div>
    </form>
  </div>;
}
