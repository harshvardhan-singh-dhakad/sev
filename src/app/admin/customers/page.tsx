'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';

interface Customer {
  id: string;
  email: string | null;
  role: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCustomers() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/customers', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Customers load nahi hue.');
      setCustomers(data.customers || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Customers load nahi hue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCustomers(); }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Sales & CRM</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><Users size={23} /> Customers</h1>
          <p className="mt-1 text-sm text-slate-600">Registered customer accounts. Only the signed-in admin can view this list.</p>
        </div>
        <button type="button" onClick={() => void loadCustomers()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-8 text-sm text-slate-500">Customers load ho rahe hain…</p> : customers.length === 0 ? (
          <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Abhi customer account nahi hai</h2><p className="mt-1 text-sm text-slate-600">Signup karne wale customers yahan dikhne lagenge.</p></div>
        ) : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Email</th><th className="px-5 py-3">Account type</th><th className="px-5 py-3">Registered</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{customers.map((customer) => <tr key={customer.id}>
            <td className="px-5 py-4 font-medium text-slate-900">{customer.email || 'Email not available'}</td>
            <td className="px-5 py-4 capitalize text-slate-600">{customer.role}</td>
            <td className="px-5 py-4 text-slate-600">{new Date(customer.createdAt).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </section>
  );
}
