import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Truck, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Rasvat',
};

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '₹1,24,500', icon: DollarSign, trend: '+12%', trendUp: true, accent: 'var(--color-primary)', accentBg: 'rgb(212 160 23 / 0.1)' },
    { title: 'Orders', value: '142', icon: ShoppingCart, trend: '+5%', trendUp: true, accent: 'var(--color-secondary)', accentBg: 'rgb(13 211 187 / 0.1)' },
    { title: 'Bulk Enquiries', value: '12', icon: Truck, trend: '+2', trendUp: true, accent: '#A78BFA', accentBg: 'rgb(124 58 237 / 0.1)' },
    { title: 'Customers', value: '85', icon: Users, trend: '+18%', trendUp: true, accent: '#93C5FD', accentBg: 'rgb(59 130 246 / 0.1)' },
  ];

  const quickActions = [
    { href: '/admin/products/new', label: 'Add Product', icon: Package, accent: 'var(--color-primary)', accentBg: 'rgb(212 160 23 / 0.1)' },
    { href: '/admin/blog/new', label: 'Write Blog Post', icon: TrendingUp, accent: '#A78BFA', accentBg: 'rgb(124 58 237 / 0.1)' },
    { href: '/admin/bulk-enquiries', label: 'View Enquiries', icon: Truck, accent: 'var(--color-secondary)', accentBg: 'rgb(13 211 187 / 0.1)' },
  ];

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1
          className="text-3xl font-black tracking-tight mb-1"
          style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-text)' }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--color-border-bright)';
                el.style.boxShadow = 'var(--shadow-elevated)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--color-border)';
                el.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.title}
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: stat.accentBg }}
                >
                  <Icon size={17} style={{ color: stat.accent }} />
                </div>
              </div>
              <div
                className="text-2xl font-black mb-1"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-text)' }}
              >
                {stat.value}
              </div>
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: stat.accent }}>
                <ArrowUpRight size={12} />
                {stat.trend} from last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-outfit)' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = action.accent;
                el.style.boxShadow = 'var(--shadow-elevated)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--color-border)';
                el.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ background: action.accentBg }}
              >
                <action.icon size={20} style={{ color: action.accent }} />
              </div>
              <div
                className="font-semibold text-sm"
                style={{ color: 'var(--color-text)' }}
              >
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}