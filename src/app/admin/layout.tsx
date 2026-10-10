'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Box,
  MessageSquare,
  FileText,
  HelpCircle,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const ADMIN_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Box },
  { label: 'Bulk Enquiries', href: '/admin/bulk-enquiries', icon: Truck },
  { label: 'Samples', href: '/admin/samples', icon: Package },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const { getFirebaseAuth } = await import('@/lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(getFirebaseAuth());
      useAuthStore.getState().logout();
      router.push('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const currentPageLabel = ADMIN_LINKS.find(l =>
    l.href === '/admin'
      ? pathname === '/admin'
      : (l.href !== '/admin' && pathname.startsWith(l.href))
  )?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col flex-shrink-0 fixed h-full z-20"
        style={{
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/admin" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: '#0A0E1A',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              R
            </div>
            <div>
              <p
                className="font-bold text-base leading-tight"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-text)' }}
              >
                Rasvat
              </p>
              <p className="text-[0.65rem] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {ADMIN_LINKS.map((link) => {
            const isActive = link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'text-[#0A0E1A]'
                    : 'hover:bg-[var(--color-bg-hover)]'
                )}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        color: '#0A0E1A',
                      }
                    : { color: 'var(--color-text-secondary)' }
                }
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            target="_blank"
          >
            <ExternalLink size={16} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#FCA5A5';
              (e.currentTarget as HTMLElement).style.background = 'rgb(239 68 68 / 0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header
          className="h-16 flex items-center justify-between px-8 sticky top-0 z-10"
          style={{
            background: 'rgba(9, 14, 27, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="font-bold text-base"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-text)' }}
          >
            {currentPageLabel}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {user.displayName}
            </span>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Admin"
                className="w-8 h-8 rounded-full"
                style={{ border: '2px solid var(--color-border-bright)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: '#0A0E1A',
                }}
              >
                {user.displayName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}