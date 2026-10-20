'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/pricing';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpentPaise: number;
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

  useEffect(() => {
    void loadCustomers();
  }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Sales &amp; CRM</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
            <Users size={23} /> Customers &amp; Buyers
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Synced from customer orders and registered accounts ({customers.length} total profiles).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCustomers()}
          disabled={loading}
          className="btn btn-outline"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-500">Customers load ho rahe hain…</p>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-bold text-slate-900">Abhi koi customer data nahi hai</h2>
            <p className="mt-1 text-sm text-slate-600">Order place hone par customers yahan dikhne lagenge.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Orders &amp; Spend</th>
                  <th className="px-5 py-3.5">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-800">{customer.email || '—'}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {customer.city || customer.state ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ShoppingBag size={14} className="text-amber-600" />
                        <span>{customer.totalOrders} order{customer.totalOrders === 1 ? '' : 's'}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">
                        {formatINR(customer.totalSpentPaise)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
