'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Shop', href: '/shop' },
  { label: 'Bulk Orders', href: '/bulk-orders' },
  { label: 'About', href: '/about' },
];

const SHOP_DROPDOWN_LINKS = [
  { label: 'All Sev', href: '/shop' },
  { label: 'Indori Sev', href: '/shop?category=indori-sev' },
  { label: 'Ratlami Sev', href: '/shop?category=ratlami-sev' },
  { label: 'Nylon Sev', href: '/shop?category=nylon-sev' },
  { label: 'Premium Sev', href: '/shop?category=premium-sev' },
];

export function Header() {
  const pathname = usePathname();
  const { getItemCount, openCart } = useCartStore();
  const { user } = useAuthStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const shopTriggerRef = useRef<HTMLAnchorElement>(null);
  const shopItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync cart count
  useEffect(() => {
    setCartCount(getItemCount());
  }, [getItemCount]);

  // Scroll detection: shadow only, height must NOT change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, [pathname]);

  // Mobile drawer body scroll lock & Esc key listener
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileOpen]);

  // Accessible focus trap inside mobile drawer
  const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusableEls = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length === 0) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }, []);

  // Keyboard navigation for Shop dropdown
  const handleShopTriggerKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShopOpen(true);
      setTimeout(() => {
        shopItemRefs.current[0]?.focus();
      }, 50);
    } else if (e.key === 'Escape') {
      setShopOpen(false);
    }
  };

  const handleDropdownItemKeyDown = (index: number, e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % SHOP_DROPDOWN_LINKS.length;
      shopItemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        shopTriggerRef.current?.focus();
      } else {
        shopItemRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShopOpen(false);
      shopTriggerRef.current?.focus();
    }
    // Tab and Shift+Tab intentionally allowed to proceed without trapping
  };

  const isLinkActive = (link: NavLink) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  return (
    <>
      <style>{`
        :root {
          --header-height: 64px;
        }
        @media (min-width: 1024px) {
          :root {
            --header-height: 80px;
          }
        }
        #site-header {
          height: var(--header-height);
        }
      `}</style>

      {/* Inline resilient initialization for mobile drawer interactions */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.addEventListener('click', function(e) {
                var openBtn = e.target.closest && e.target.closest('#mobile-menu-open-btn, button[aria-label="Open menu"]');
                var closeBtn = e.target.closest && e.target.closest('#mobile-menu-close-btn, button[aria-label="Close menu"], #mobile-drawer-backdrop');
                var shopBtn = e.target.closest && e.target.closest('#mobile-shop-accordion-btn');
                var drawer = document.getElementById('mobile-drawer');

                if (openBtn && drawer) {
                  drawer.classList.remove('hidden');
                  drawer.classList.add('flex');
                  drawer.style.setProperty('display', 'flex', 'important');
                  document.body.style.overflow = 'hidden';
                }

                if (closeBtn && drawer) {
                  drawer.classList.remove('flex');
                  drawer.classList.add('hidden');
                  drawer.style.setProperty('display', 'none', 'important');
                  document.body.style.overflow = '';
                }

                if (shopBtn) {
                  var menu = document.getElementById('mobile-shop-accordion-menu');
                  if (menu) {
                    var isClosed = menu.style.display === 'none' || menu.classList.contains('hidden');
                    if (isClosed) {
                      menu.classList.remove('hidden');
                      menu.style.setProperty('display', 'block', 'important');
                    } else {
                      menu.classList.add('hidden');
                      menu.style.setProperty('display', 'none', 'important');
                    }
                  }
                }
              }, true);

              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  var drawer = document.getElementById('mobile-drawer');
                  if (drawer && (drawer.style.display === 'flex' || drawer.classList.contains('flex'))) {
                    drawer.classList.remove('flex');
                    drawer.classList.add('hidden');
                    drawer.style.setProperty('display', 'none', 'important');
                    document.body.style.overflow = '';
                  }
                }
              }, true);
            })();
          `,
        }}
      />

      <header
        id="site-header"
        className={cn(
          'sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0] transition-shadow duration-200'
        )}
        style={{
          boxShadow: scrolled ? '0 4px 16px rgba(0, 0, 0, 0.08)' : 'none',
        }}
      >
        <div className="container-site h-full">
          {/* ========================================================
              Desktop Header (>= 1024px): 1fr auto 1fr CSS Grid
              ======================================================== */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-full">
            {/* Left Column (1fr): Logo */}
            <div className="flex items-center justify-start">
              <Link
                href="/"
                className="inline-flex items-center h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md"
                aria-label="Rasvat Home"
              >
                <span
                  className="text-[32px] font-extrabold leading-none select-none tracking-tight text-[#111827]"
                  style={{ fontFamily: 'var(--font-outfit)' }}
                >
                  Rasvat<span style={{ color: 'var(--color-primary)' }}>.</span>
                </span>
              </Link>
            </div>

            {/* Center Column (auto): Navigation Tabs */}
            <nav className="flex items-center gap-[40px]" aria-label="Main Navigation">
              {NAV_LINKS.map((link) => {
                const isActive = isLinkActive(link);

                if (link.label === 'Shop') {
                  return (
                    <div
                      key={link.label}
                      ref={shopDropdownRef}
                      className="relative group"
                      onMouseEnter={() => setShopOpen(true)}
                      onMouseLeave={() => setShopOpen(false)}
                      onBlur={(e) => {
                        if (!shopDropdownRef.current?.contains(e.relatedTarget as Node)) {
                          setShopOpen(false);
                        }
                      }}
                    >
                      <Link
                        ref={shopTriggerRef}
                        href={link.href}
                        onFocus={() => setShopOpen(true)}
                        onKeyDown={handleShopTriggerKeyDown}
                        className={cn(
                          'relative inline-flex items-center gap-1 text-[16px] font-semibold transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-md',
                          isActive
                            ? 'text-[var(--color-primary)]'
                            : 'text-[#111827] hover:text-[var(--color-primary)]'
                        )}
                        aria-expanded={shopOpen}
                        aria-haspopup="true"
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
                          className={cn(
                            'transition-transform duration-200',
                            shopOpen ? 'rotate-180 text-[var(--color-primary)]' : 'group-hover:rotate-180'
                          )}
                          aria-hidden="true"
                        />
                        {/* 2px red underline 8px below label */}
                        {isActive && (
                          <span
                            className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[var(--color-primary)] pointer-events-none"
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      {/* Shop Dropdown Menu */}
                      <div
                        className={cn(
                          'absolute top-full left-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-2 z-50',
                          shopOpen ? 'block' : 'hidden group-hover:block group-focus-within:block'
                        )}
                        role="menu"
                        aria-orientation="vertical"
                        aria-label="Shop categories"
                      >
                          {SHOP_DROPDOWN_LINKS.map((item, idx) => (
                            <Link
                              key={item.label}
                              ref={(el) => {
                                shopItemRefs.current[idx] = el;
                              }}
                              href={item.href}
                              role="menuitem"
                              tabIndex={0}
                              onClick={() => setShopOpen(false)}
                              onKeyDown={(e) => handleDropdownItemKeyDown(idx, e)}
                              className="block px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#FFEBEE] hover:text-[var(--color-primary)] focus:bg-[#FFEBEE] focus:text-[var(--color-primary)] focus-visible:outline-none transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'relative inline-flex items-center text-[16px] font-semibold transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-md',
                      isActive
                        ? 'text-[var(--color-primary)]'
                        : 'text-[#111827] hover:text-[var(--color-primary)]'
                    )}
                  >
                    {link.label}
                    {/* 2px red underline 8px below label */}
                    {isActive && (
                      <span
                        className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[var(--color-primary)] pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Column (1fr): Search, Account, Cart */}
            <div className="flex items-center justify-end gap-1">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Search"
              >
                <Search size={24} strokeWidth={1.75} />
              </button>

              {/* Account Link */}
              <Link
                href={user ? '/account' : '/login'}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Account"
              >
                <User size={24} strokeWidth={1.75} />
              </Link>

              {/* Cart Button */}
              <button
                type="button"
                onClick={openCart}
                className="relative w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Cart"
              >
                <ShoppingBag size={24} strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center pointer-events-none leading-none shadow-sm"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================
              Mobile Header (< 1024px): Logo Left, Search/Cart/Hamburger Right
              ======================================================== */}
          <div className="flex lg:hidden items-center justify-between h-full">
            {/* Logo Left */}
            <Link
              href="/"
              className="inline-flex items-center h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md"
              aria-label="Rasvat Home"
            >
              <span
                className="text-[26px] font-extrabold leading-none select-none tracking-tight text-[#111827]"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Rasvat<span style={{ color: 'var(--color-primary)' }}>.</span>
              </span>
            </Link>

            {/* Right: Search, Cart, Hamburger */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Search"
              >
                <Search size={24} strokeWidth={1.75} />
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Cart"
              >
                <ShoppingBag size={24} strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center pointer-events-none leading-none"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                id="mobile-menu-open-btn"
                type="button"
                onClick={() => setMobileOpen(true)}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-[#111827] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-drawer"
              >
                <Menu size={24} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Search Dropdown Overlay */}
          {searchOpen && (
            <div className="absolute top-full left-0 w-full bg-white border-b border-[#E2E8F0] shadow-lg py-5 px-4 z-40 animate-in fade-in slide-in-from-top-2">
              <div className="max-w-2xl mx-auto">
                <SearchBar onClose={() => setSearchOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          Accessible Mobile Drawer (< 1024px)
          Focus trap, Esc key listener, body scroll lock
          ======================================================== */}
      <div
        id="mobile-drawer"
        className={cn(
          'fixed inset-0 z-[100] lg:hidden',
          mobileOpen ? 'flex' : 'hidden'
        )}
        style={{ display: mobileOpen ? 'flex' : 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation Menu"
        onKeyDown={handleDrawerKeyDown}
      >
        {/* Backdrop */}
        <div
          id="mobile-drawer-backdrop"
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <span
              className="text-2xl font-extrabold text-[#111827]"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Rasvat<span style={{ color: 'var(--color-primary)' }}>.</span>
            </span>
            <button
              id="mobile-menu-close-btn"
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.75} />
            </button>
          </div>

          {/* Drawer Navigation Items */}
          <nav className="flex-1 px-6 py-6 space-y-4">
            {/* Home */}
            <div>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-lg font-semibold py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded',
                  pathname === '/'
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[#111827] hover:text-[var(--color-primary)]'
                )}
              >
                Home
              </Link>
            </div>

            {/* Shop Accordion */}
            <div className="border-b border-gray-100 pb-3">
              <button
                id="mobile-shop-accordion-btn"
                type="button"
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="w-full flex items-center justify-between text-lg font-semibold py-2 text-[#111827] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
                aria-expanded={mobileShopOpen}
              >
                <span>Shop</span>
                <ChevronDown
                  size={20}
                  className={cn(
                    'transition-transform duration-200 text-gray-500',
                    mobileShopOpen ? 'rotate-180 text-[var(--color-primary)]' : ''
                  )}
                />
              </button>
              <div
                id="mobile-shop-accordion-menu"
                className="pl-4 mt-2 space-y-2 border-l-2 border-[#FFEBEE]"
                style={{ display: mobileShopOpen ? 'block' : 'none' }}
              >
                {SHOP_DROPDOWN_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bulk Orders */}
            <div>
              <Link
                href="/bulk-orders"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-lg font-semibold py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded',
                  pathname.startsWith('/bulk-orders')
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[#111827] hover:text-[var(--color-primary)]'
                )}
              >
                Bulk Orders
              </Link>
            </div>

            {/* About */}
            <div>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-lg font-semibold py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded',
                  pathname.startsWith('/about')
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[#111827] hover:text-[var(--color-primary)]'
                )}
              >
                About
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E2E8F0] my-4" />

            {/* Account (moved into drawer for mobile) */}
            <div>
              <Link
                href={user ? '/account' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-base font-semibold text-[#111827] hover:text-[var(--color-primary)] py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
              >
                <User size={20} strokeWidth={1.75} />
                <span>{user ? 'My Account' : 'Account (Login / Register)'}</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string; title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <div className="relative flex items-center border-b-2 border-[#111827] pb-2">
        <Search size={22} className="text-[#111827] mr-3" strokeWidth={1.75} />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for premium Sev..."
          className="w-full bg-transparent text-lg focus:outline-none placeholder:text-gray-400 text-[#111827]"
        />
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#111827] transition-colors ml-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Close search"
        >
          <X size={22} strokeWidth={1.75} />
        </button>
      </div>

      {(results.length > 0 || (loading && query.length >= 2)) && (
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 py-3 text-sm">Searching our kitchen...</p>
          ) : results.length === 0 ? (
            <p className="text-gray-500 py-3 text-sm">We couldn't find anything for "{query}"</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <li key={i}>
                  <Link
                    href={r.url}
                    onClick={onClose}
                    className="group flex items-center gap-3 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FFEBEE] text-[var(--color-primary-dark)] px-2 py-0.5 rounded">
                      {r.type}
                    </span>
                    <span className="text-base font-medium text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}