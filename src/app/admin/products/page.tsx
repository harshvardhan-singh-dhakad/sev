'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackagePlus, RefreshCw } from 'lucide-react';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  categoryName?: string;
  status: string;
  variants: { price: number; stock: number | null }[];
  thumbnail?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/products?status=${status}&limit=100&sort=newest`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Products could not be loaded.');
      setProducts(data.products ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Products could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProducts(); }, [status]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Store catalog</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">Products shown here are read from the same D1 catalog used by the storefront.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Product status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="form-select bg-white font-medium text-sm"
          >
            <option value="active">Active (Live)</option>
            <option value="all">All Products</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className="btn btn-outline"
            aria-label="Refresh products"
          >
            <RefreshCw size={16} />
          </button>
          <Link href="/admin/products/new" className="btn btn-primary">
            <PackagePlus size={16} /> Add product
          </Link>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-500">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-bold text-slate-900">
              No {status === 'all' ? '' : status} products found
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Products created in the catalog will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const prices = product.variants
                    .map((variant) => variant.price)
                    .filter((price) => price > 0);
                  const min = prices.length ? Math.min(...prices) / 100 : null;
                  const max = prices.length ? Math.max(...prices) / 100 : null;
                  const isLive = product.status === 'active' || product.status === 'published';
                  const isDraft = product.status === 'draft';

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-amber-50/50 border border-amber-200 flex items-center justify-center text-amber-700 text-[10px] font-bold shrink-0">
                              No pic
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                              className="font-bold text-slate-900 hover:text-primary hover:underline block truncate"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {product.categoryName || 'Uncategorized'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-semibold">
                        {min === null
                          ? 'No active pack'
                          : min === max
                          ? `₹${min.toFixed(2)}`
                          : `₹${min.toFixed(2)} – ₹${max?.toFixed(2)}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize border inline-flex items-center gap-1 ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isDraft
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLive ? 'bg-emerald-500' : isDraft ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                          {isLive ? 'Active' : product.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
