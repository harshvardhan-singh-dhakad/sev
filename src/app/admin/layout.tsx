'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  TableProperties,
  ShoppingCart,
  Users,
  Briefcase,
  Gift,
  FileText,
  Image as ImageIcon,
  GalleryVerticalEnd,
  Settings as SettingsIcon,
  Shield,
  History,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Role } from '@/lib/auth/permissions';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roleRequired?: Role[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    group: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Layers },
      { label: 'Bulk Price Grid', href: '/admin/price-grid', icon: TableProperties },
    ],
  },
  {
    group: 'Sales & CRM',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
  {
    group: 'Enquiries',
    items: [
      { label: 'Bulk Enquiries', href: '/admin/bulk-enquiries', icon: Briefcase },
      { label: 'Sample Requests', href: '/admin/samples', icon: Gift },
    ],
  },
  {
    group: 'Content & Media',
    items: [
      { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
      { label: 'Homepage Banners', href: '/admin/banners', icon: GalleryVerticalEnd },
      { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { label: 'Store Settings', href: '/admin/settings', icon: SettingsIcon },
      { label: 'Staff & Roles', href: '/admin/staff', icon: Shield, roleRequired: ['owner'] },
      { label: 'Audit Log', href: '/admin/audit-log', icon: History, roleRequired: ['owner', 'manager'] },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Skip admin shell for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  const roleBadgeStyle =
    user?.role === 'owner'
      ? 'bg-red-100 text-red-800 border-red-200'
      : user?.role === 'manager'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : user?.role === 'editor'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      {/* Top Header Bar */}
      <header
        className="sticky top-0 z-30 h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>

          {/* Brand stamp on desktop */}
          <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-border">
            <Image
              src="/images/aronbites-logo.webp"
              alt="Aron Bites"
              width={149}
              height={88}
              className="h-8 w-auto object-contain"
            />
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-ink uppercase tracking-wider">
              PORTAL
            </span>
          </div>

          {/* Breadcrumb representation */}
          <nav aria-label="Admin breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight size={13} className="text-gray-400" />
                <span className="text-ink capitalize">
                  {pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right Topbar Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-border transition-colors"
          >
            <span>Storefront</span>
            <ExternalLink size={13} />
          </Link>

          {/* User Profile & Role */}
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-ink leading-tight">{user?.name}</div>
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadgeStyle}`}
              >
                {user?.role}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              title="Sign Out"
              aria-label="Sign out of admin"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar + Main Viewport */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar (>=1024px) */}
        <aside
          className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-border p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          <nav className="space-y-6">
            {NAV_GROUPS.map((group) => {
              const visibleItems = group.items.filter(
                (item) => !item.roleRequired || (user && item.roleRequired.includes(user.role))
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group}>
                  <h2 className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                    {group.group}
                  </h2>
                  <ul className="space-y-1">
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-ink'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Off-Canvas Drawer (<1024px) */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Menu"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />

            {/* Off-canvas Sheet */}
            <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 p-5 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/aronbites-logo.webp"
                    alt="Aron Bites"
                    width={149}
                    height={88}
                    className="h-7 w-auto object-contain"
                  />
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary text-ink">
                    PORTAL
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User badge on mobile */}
              <div className="p-3 rounded-xl bg-gray-50 border border-border mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">{user?.name}</div>
                  <div className="text-[11px] text-gray-500">{user?.email}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${roleBadgeStyle}`}>
                  {user?.role}
                </span>
              </div>

              <nav className="space-y-6 flex-1">
                {NAV_GROUPS.map((group) => {
                  const visibleItems = group.items.filter(
                    (item) => !item.roleRequired || (user && item.roleRequired.includes(user.role))
                  );
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={group.group}>
                      <h2 className="px-2 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                        {group.group}
                      </h2>
                      <ul className="space-y-1">
                        {visibleItems.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                  isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon size={16} />
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
