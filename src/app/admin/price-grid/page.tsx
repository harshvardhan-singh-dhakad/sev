'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, TableProperties } from 'lucide-react';

interface PriceRow {
  productId: string;
  productName: string;
  slug: string;
  productStatus: string;
  variantId: string | null;
  pack: string | null;
  weightGrams: number | null;
  pricePaise: number | null;
  compareAtPricePaise: number | null;
  sku: string | null;
  stock: number | null;
  variantStatus: string | null;
}

export default function AdminPriceGridPage() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadGrid() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/price-grid', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Price grid load nahi hui.');
      setRows(data.rows || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Price grid load nahi hui.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadGrid(); }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Catalog</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><TableProperties size={23} /> Bulk Price Grid</h1>
          <p className="mt-1 text-sm text-slate-600">Product pack prices, SKU, stock aur listing status ek jagah dekhein.</p>
        </div>
        <button type="button" onClick={() => void loadGrid()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-8 text-sm text-slate-500">Price grid load ho rahi hai…</p> : rows.length === 0 ? (
          <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Abhi koi product nahi hai</h2><p className="mt-1 text-sm text-slate-600">Product add karne par uske pack prices yahan dikhenge.</p></div>
        ) : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Pack</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">MRP</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={row.variantId || `${row.productId}-${index}`}>
            <td className="px-5 py-4"><p className="font-semibold text-slate-900">{row.productName}</p><p className="text-xs text-slate-500">/{row.slug}</p></td>
            <td className="px-5 py-4 text-slate-700">{row.pack || (row.weightGrams ? `${row.weightGrams} g` : '—')}</td>
            <td className="px-5 py-4 font-semibold text-slate-900">{row.pricePaise == null ? '—' : `₹${(row.pricePaise / 100).toFixed(2)}`}</td>
            <td className="px-5 py-4 text-slate-600">{row.compareAtPricePaise == null ? '—' : `₹${(row.compareAtPricePaise / 100).toFixed(2)}`}</td>
            <td className="px-5 py-4 text-slate-600">{row.sku || '—'}</td>
            <td className="px-5 py-4 text-slate-600">{row.stock ?? 'Not tracked'}</td>
            <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{row.variantId ? row.variantStatus : row.productStatus}</span></td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </section>
  );
}
