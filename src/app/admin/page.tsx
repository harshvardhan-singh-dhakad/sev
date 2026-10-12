'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Briefcase,
  Settings,
  History,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';

export default function AdminDashboardPage() {
  const [stats] = useState({
    productsCount: 8,
    categoriesCount: 8,
    minCartValuePaise: 19900,
    bulkMinKg: 5,
  });

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-faint text-primary-dark mb-2.5">
            <ShieldCheck size={14} />
            <span>Storefront Operations Active</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Rasvat Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Centralized hub for managing snack catalog, pack size pricing rules, customer enquiries, compliance, and staff access.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Catalog Sev</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {stats.productsCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Authentic sev varieties</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {stats.categoriesCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Active categories</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Min Cart Rule</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {formatINR(stats.minCartValuePaise)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Enforced threshold</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Bulk Min Threshold</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {stats.bulkMinKg} KG
          </div>
          <div className="text-xs text-gray-500 mt-1">Single global parameter</div>
        </div>
      </div>

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
            <h3 className="font-bold text-base text-ink mb-1">Store Parameters & Compliance</h3>
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