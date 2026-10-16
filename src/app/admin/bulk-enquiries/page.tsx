'use client';

import { useEffect, useState } from 'react';
import { BriefcaseBusiness, RefreshCw } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  city: string | null;
  state: string | null;
  requirements: string;
  estimatedQuantity: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function AdminBulkEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadEnquiries() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bulk-enquiries', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Enquiries load nahi hui.');
      setEnquiries(data.enquiries || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enquiries load nahi hui.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadEnquiries(); }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Sales & CRM</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><BriefcaseBusiness size={23} /> Bulk Enquiries</h1>
          <p className="mt-1 text-sm text-slate-600">Wholesale aur bulk order requests ka private admin inbox.</p>
        </div>
        <button type="button" onClick={() => void loadEnquiries()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-8 text-sm text-slate-500">Enquiries load ho rahi hain…</p> : enquiries.length === 0 ? (
          <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Abhi koi bulk enquiry nahi hai</h2><p className="mt-1 text-sm text-slate-600">Website par submit hui requests yahan aayengi.</p></div>
        ) : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Business / Location</th><th className="px-5 py-3">Requirement</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Received</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{enquiries.map((item) => <tr key={item.id}>
            <td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.name}</p><a className="text-xs text-primary" href={`tel:${item.phone}`}>{item.phone}</a>{item.email && <p className="text-xs text-slate-500">{item.email}</p>}</td>
            <td className="px-5 py-4 text-slate-700">{item.company || '—'}<p className="text-xs text-slate-500">{[item.city, item.state].filter(Boolean).join(', ') || '—'}</p></td>
            <td className="max-w-sm whitespace-pre-wrap px-5 py-4 text-slate-700">{item.requirements}{item.message && <p className="mt-1 text-xs text-slate-500">{item.message}</p>}</td>
            <td className="px-5 py-4 text-slate-700">{item.estimatedQuantity}</td>
            <td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800">{item.status}</span></td>
            <td className="px-5 py-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </section>
  );
}
