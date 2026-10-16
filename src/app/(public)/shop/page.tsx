import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles, PackageOpen } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import type { SpiceLevel } from '@/lib/catalog';
import { getStorefrontCategories, listStorefrontProducts, type StorefrontSort } from '@/lib/storefront-catalog';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Shop Premium Sev & Namkeen | Rasvat Authentic Snacks',
  description:
    'Explore our signature collection of authentic Indori Sev, Ratlami Sev, Nylon Sev, and royal namkeen. Handcrafted in cold-pressed oil with pure stone-ground besan.',
  alternates: { canonical: absoluteUrl('/shop') },
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    spice?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  const currentCategory = resolvedParams.category || 'all';
  const currentSort = (resolvedParams.sort as StorefrontSort) || 'popular';
  const currentSpice = (resolvedParams.spice as SpiceLevel) || null;
  const searchQuery = resolvedParams.q || null;
  const currentPage = parseInt(resolvedParams.page || '1', 10) || 1;

  const [categories, catalog] = await Promise.all([
    getStorefrontCategories(),
    listStorefrontProducts(
      {
        category: currentCategory === 'all' ? null : currentCategory,
        spice_level: currentSpice,
        search: searchQuery,
      },
      currentSort,
      currentPage,
      12,
    ),
  ]);
  const { products, total, totalPages, page } = catalog;

  return (
    <PublicLayout>
      {/* Header & Breadcrumb Hero Banner */}
      <section
        className="relative pt-8 pb-10 border-b border-border"
        style={{
          background: `
            radial-gradient(ellipse at 85% 10%, rgba(255, 206, 27, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 15% 90%, rgba(211, 47, 47, 0.05) 0%, transparent 45%),
            var(--color-bg-white)
          `,
        }}
      >
        <div className="container-site">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li aria-current="page" className="text-ink font-bold">
                Shop
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 bg-primary-faint text-primary-dark">
                <Sparkles size={13} />
                Freshly Packed Snacks
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Shop Premium Sev
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                Explore the products currently available in our catalog.
              </p>
            </div>

            {/* Results Pill */}
            <div className="text-xs font-semibold text-gray-500 self-start md:self-end">
              Showing <span className="font-bold text-ink">{products.length}</span> of{' '}
              <span className="font-bold text-ink">{total}</span> authentic varieties
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Viewport */}
      <section className="py-5 sm:py-8 lg:py-10 bg-bg min-h-[60vh]">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Mobile controls stack above results; the desktop sidebar occupies column one. */}
            <Suspense fallback={null}>
              <ShopFilters categories={categories} totalCount={total} />
            </Suspense>

            {/* Product Grid Area */}
            <main className="min-w-0 w-full" id="main-content">
              {products.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-white border border-border shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-primary-faint flex items-center justify-center text-primary mb-4">
                    <PackageOpen size={32} />
                  </div>
                  <h3
                    className="text-lg font-bold text-ink mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    No Sev varieties match your selection
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6">
                    Try clearing or adjusting your category, spice level, or search filters to explore our full range.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
                  >
                    Reset All Filters
                  </Link>
                </div>
              ) : (
                <>
                  {/* Grid 4 / 3 / 2 columns (Desktop >=1280px: 4 cols, Tablet >=768px: 3 cols, Mobile: 2 cols) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                    {products.map((product) => (
                      <ShopProductCard key={product.slug} product={product} />
                    ))}
                  </div>

                  {/* Pagination / Page Controls if needed */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const isCurrent = pageNum === page;
                        const pageParams = new URLSearchParams(
                          Object.entries(resolvedParams).reduce<Record<string, string>>((acc, [k, v]) => {
                            if (typeof v === 'string') acc[k] = v;
                            return acc;
                          }, {})
                        );
                        pageParams.set('page', pageNum.toString());

                        return (
                          <Link
                            key={pageNum}
                            href={`/shop?${pageParams.toString()}`}
                            className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-gray-700 border border-border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
