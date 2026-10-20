'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  ShoppingBag,
  Settings,
  History,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  ordersCount: number;
  totalRevenuePaise: number;
  minCartValuePaise: number;
  bulkMinKg: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalPaise: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    ordersCount: 0,
    totalRevenuePaise: 0,
    minCartValuePaise: 24900,
    bulkMinKg: 5,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard-stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentOrders) setRecentOrders(data.recentOrders);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="p-6 sm:p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          background: `
            radial-gradient(ellipse at 85% 20%, rgba(255, 206, 27, 0.12) 0%, transparent 50%),
            var(--color-bg-white)
          `,
        }}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Live D1 Catalog &amp; Storefront Synced</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Aron Bites Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Real-time management for snack catalog, active pack sizes, order fulfillment, and compliance settings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-border hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-border hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Settings size={15} />
            <span>Configure Store</span>
          </Link>
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <span>Live Store</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Metrics Cards (100% Live from D1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-amber-400 transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Products</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {loading ? '…' : stats.productsCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>Active varieties</span>
            <span className="text-primary font-bold">Manage &rarr;</span>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-amber-400 transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {loading ? '…' : stats.categoriesCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>Storefront categories</span>
            <span className="text-amber-700 font-bold">View &rarr;</span>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-amber-400 transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {loading ? '…' : stats.ordersCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>Orders logged</span>
            <span className="text-purple-700 font-bold">Orders &rarr;</span>
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Min Cart Threshold</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {loading ? '…' : formatINR(stats.minCartValuePaise)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Configured minimum order</div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      {recentOrders.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all {stats.ordersCount} orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      <Link href="/admin/orders" className="hover:text-primary hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {formatINR(ord.totalPaise)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Action Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/settings"
          className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-ink mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Settings size={20} />
            </div>
            <h3 className="font-bold text-base text-ink mb-1">Store Parameters &amp; Compliance</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Set FSSAI, GSTIN, minimum cart value, free shipping threshold, and bulk order rules.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
            <span>Configure Settings</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          href="/admin/audit-log"
          className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-ink mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <History size={20} />
            </div>
            <h3 className="font-bold text-base text-ink mb-1">Security Audit Trail</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Inspect immutable logs of administrative logins, configuration modifications, and changes.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
            <span>View Audit Logs</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          href="/admin/media"
          className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-ink mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-base text-ink mb-1">Media Assets</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload and manage product photography, packaging banners, and WebP assets with usage tracking.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
            <span>Manage Media</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
}