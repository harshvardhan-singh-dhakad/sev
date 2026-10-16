'use client';

import { useEffect, useState } from 'react';
import { Gift, RefreshCw } from 'lucide-react';

interface Sample { id: string; name: string; email: string | null; phone: string; businessName: string | null; address: string; city: string; state: string; pincode: string; productInterests: string; status: string; createdAt: string; }

export default function AdminSamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function loadSamples() {
    setLoading(true); setError('');
    try { const response = await fetch('/api/samples', { cache: 'no-store' }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Sample requests load nahi hui.'); setSamples(data.samples || []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Sample requests load nahi hui.'); } finally { setLoading(false); }
  }
  useEffect(() => { void loadSamples(); }, []);
  return <section className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Enquiries</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><Gift size={23} /> Sample Requests</h1><p className="mt-1 text-sm text-slate-600">Sample kit requests and customer delivery details.</p></div><button type="button" onClick={() => void loadSamples()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-8 text-sm text-slate-500">Requests load ho rahi hain…</p> : samples.length === 0 ? <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Abhi koi sample request nahi hai</h2><p className="mt-1 text-sm text-slate-600">Website se bheji gayi requests yahan aayengi.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Products</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{samples.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.phone}{item.email ? ` · ${item.email}` : ''}</p><p className="text-xs text-slate-500">{item.businessName || ''}</p></td><td className="px-5 py-4 text-slate-700">{[item.address, item.city, item.state, item.pincode].filter(Boolean).join(', ')}</td><td className="px-5 py-4 text-slate-700">{item.productInterests}</td><td className="px-5 py-4 capitalize text-slate-700">{item.status}</td><td className="px-5 py-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}
