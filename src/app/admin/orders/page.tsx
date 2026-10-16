'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, ShoppingCart } from 'lucide-react';

interface Order { id: string; orderNumber: string; status: string; customerName: string; customerPhone: string; customerEmail: string; city: string; state: string; totalPaise: number; createdAt: string; }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function loadOrders() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Orders load nahi hue.');
      setOrders(data.orders || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Orders load nahi hue.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadOrders(); }, []);
  return <section className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Sales & CRM</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><ShoppingCart size={23} /> Orders</h1><p className="mt-1 text-sm text-slate-600">Recent orders and delivery contact details.</p></div><button type="button" onClick={() => void loadOrders()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-8 text-sm text-slate-500">Orders load ho rahe hain…</p> : orders.length === 0 ? <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Abhi koi order nahi hai</h2><p className="mt-1 text-sm text-slate-600">Orders yahan dikhne lagenge.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Delivery city</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-semibold text-slate-900">{order.orderNumber}</td><td className="px-5 py-4"><p className="font-medium text-slate-800">{order.customerName}</p><p className="text-xs text-slate-500">{order.customerPhone}{order.customerEmail ? ` · ${order.customerEmail}` : ''}</p></td><td className="px-5 py-4 text-slate-600">{[order.city, order.state].filter(Boolean).join(', ')}</td><td className="px-5 py-4 font-semibold text-slate-800">₹{(order.totalPaise / 100).toFixed(2)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{order.status.replace(/_/g, ' ')}</span></td><td className="px-5 py-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}
