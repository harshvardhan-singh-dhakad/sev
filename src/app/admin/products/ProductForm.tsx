'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string }
interface Pack { id?: string; label: string; weightGrams: string; price: string; sku: string; stock: string; isActive: boolean }
interface ProductData { name: string; slug: string; categoryId: string | null; categorySlug: string; shortDescription: string; description: string; status: string; variants: Array<{ id: string; label: string; weightGrams: number; pricePaise: number; sku: string; stock: number | null; isActive: boolean }> }

const emptyPack = (): Pack => ({ label: '', weightGrams: '', price: '', sku: '', stock: '', isActive: true });

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [packs, setPacks] = useState<Pack[]>([emptyPack()]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch('/api/categories?status=active&limit=100', { cache: 'no-store' }),
          productId ? fetch(`/api/products/${encodeURIComponent(productId)}`, { cache: 'no-store' }) : Promise.resolve(null),
        ]);
        const categoryData = await categoryResponse.json();
        if (!categoryResponse.ok) throw new Error(categoryData.error || 'Categories could not be loaded.');
        if (cancelled) return;
        setCategories(categoryData.categories ?? []);

        if (productResponse) {
          const productData = await productResponse.json();
          if (!productResponse.ok) throw new Error(productData.error || 'Product could not be loaded.');
          const product = productData.product as ProductData;
          if (cancelled) return;
          setName(product.name);
          setSlug(product.slug);
          setCategoryId(product.categoryId || categoryData.categories?.find((category: Category) => category.slug === product.categorySlug)?.id || '');
          setShortDescription(product.shortDescription || '');
          setDescription(product.description || '');
          setStatus(product.status === 'published' ? 'active' : product.status);
          setPacks(product.variants.map((variant) => ({
            id: variant.id,
            label: variant.label,
            weightGrams: String(variant.weightGrams),
            price: (variant.pricePaise / 100).toFixed(2),
            sku: variant.sku,
            stock: variant.stock == null ? '' : String(variant.stock),
            isActive: variant.isActive,
          })));
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Product data could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [productId]);

  const updatePack = (index: number, key: keyof Pack, value: string | boolean) => {
    setPacks((current) => current.map((pack, i) => i === index ? { ...pack, [key]: value } : pack));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = categories.find((item) => item.id === categoryId);
    if (!category) { toast.error('Pehle active category add karein.'); return; }
    setSaving(true);
    try {
      const response = await fetch(productId ? `/api/products/${encodeURIComponent(productId)}` : '/api/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug, categoryId, categorySlug: category.slug,
          shortDescription, longDescription: description, status,
          spiceLevel: 'mild', storage: 'Store in a cool, dry place',
          variants: packs.map((pack) => ({
            id: pack.id,
            label: pack.label,
            weightGrams: Number(pack.weightGrams),
            pricePaise: Math.round(Number(pack.price) * 100),
            sku: pack.sku,
            stock: pack.stock === '' ? null : Number(pack.stock),
            isActive: pack.isActive,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Product could not be saved.');
      toast.success(productId ? 'Product updated.' : status === 'active' ? 'Product published to the shop.' : 'Product saved as a draft.');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Product could not be saved.');
    } finally { setSaving(false); }
  }

  if (loading) return <p className="p-8 text-sm text-slate-500">Product details load ho rahe hain…</p>;

  return <div className="mx-auto max-w-3xl space-y-6">
    <header className="flex items-center gap-3"><Link href="/admin/products" className="rounded-lg border border-slate-200 bg-white p-2" aria-label="Back to products"><ArrowLeft size={18} /></Link><div><h1 className="text-2xl font-black text-slate-900">{productId ? 'Edit product' : 'Add product'}</h1><p className="text-sm text-slate-600">Product details and pack prices are saved to the shop catalog.</p></div></header>
    {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
    {categories.length === 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No active categories found. <Link className="font-bold underline" href="/admin/categories">Add a category first.</Link></p>}
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-label">Product name *<input required value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!slug) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="form-input mt-2" /></label>
        <label className="form-label">URL slug *<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} className="form-input mt-2" /></label>
        <label className="form-label">Category *<select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="form-select mt-2"><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="form-label">Publishing status<select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select mt-2"><option value="draft">Draft</option><option value="active">Publish to shop</option><option value="archived">Archived</option></select></label>
      </div>
      <label className="form-label block">Short description<input value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className="form-input mt-2" /></label>
      <label className="form-label block">Product description *<textarea required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="form-input mt-2" /></label>
      <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Packs and pricing *</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => setPacks((current) => [...current, emptyPack()])} disabled={packs.length >= 10}><Plus size={14} /> Add pack</button></div>
        {packs.map((pack, index) => <div key={pack.id || `new-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="form-label">Pack label *<input required value={pack.label} onChange={(event) => updatePack(index, 'label', event.target.value)} placeholder="250 g" className="form-input mt-1" /></label>
          <label className="form-label">Weight (g) *<input required type="number" min="1" value={pack.weightGrams} onChange={(event) => updatePack(index, 'weightGrams', event.target.value)} className="form-input mt-1" /></label>
          <label className="form-label">Price (₹) *<input required type="number" min="0.01" step="0.01" value={pack.price} onChange={(event) => updatePack(index, 'price', event.target.value)} className="form-input mt-1" /></label>
          <label className="form-label">SKU *<input required value={pack.sku} onChange={(event) => updatePack(index, 'sku', event.target.value)} className="form-input mt-1" /></label>
          <div className="flex items-end gap-2"><label className="form-label flex-1">Stock<input type="number" min="0" value={pack.stock} onChange={(event) => updatePack(index, 'stock', event.target.value)} placeholder="Untracked" className="form-input mt-1" /></label>{productId && <label className="mb-2 inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={pack.isActive} onChange={(event) => updatePack(index, 'isActive', event.target.checked)} /> Active</label>}{packs.length > 1 && <button type="button" onClick={() => setPacks((current) => current.filter((_, i) => i !== index))} className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Remove pack"><Trash2 size={16} /></button>}</div>
        </div>)}
      </section>
      {loadError ? null : <div className="flex justify-end border-t border-slate-100 pt-4"><button type="submit" disabled={saving || categories.length === 0} className="btn btn-primary"><Save size={16} />{saving ? 'Saving…' : productId ? 'Update product' : 'Save product'}</button></div>}
    </form>
  </div>;
}
