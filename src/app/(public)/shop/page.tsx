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
import { FaqAccordionSection } from '@/components/ui/FaqAccordionSection';
import { SHOP_FAQS } from './shop-faq-data';

export const metadata: Metadata = {
  title: 'Buy Authentic Indori & Ratlami Sev Online | Aron Bites Shop',
  description:
    'Shop authentic Indori Sev, Ratlami Laung Sev, Nylon Chaat Sev, and Malwa namkeen online. Handcrafted in pure cold-pressed oil with 100% stone-ground besan. Free delivery on orders ₹499+. Freshly packed & delivered across India.',
  keywords: [
    'buy Indori sev online',
    'Ratlami sev buy online',
    'authentic Indore namkeen store',
    'nylon sev for chaat',
    'pure besan sev online',
    'Indore snacks online delivery',
    'Aron Bites shop',
    'Indian namkeen snacks order',
  ],
  alternates: { canonical: absoluteUrl('/shop') },
  openGraph: {
    title: 'Buy Authentic Indori & Ratlami Sev Online | Aron Bites Shop',
    description:
      'Handcrafted in pure cold-pressed oil with 100% stone-ground besan. Free delivery on orders ₹499+. Freshly packed & delivered across India.',
    url: absoluteUrl('/shop'),
    type: 'website',
  },
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/shop#faq'),
    mainEntity: SHOP_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <PublicLayout>
      {/* Schema.org FAQPage JSON-LD for AI Search & Google Featured Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

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
                Explore the authentic taste of Indore. 100% pure Chana Dal besan, cold-pressed oils, and zero preservatives.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-bg px-3.5 py-2 rounded-lg border border-border w-fit">
              <span>Showing:</span>
              <strong className="text-ink">
                {products.length} of {total} {total === 1 ? 'variety' : 'varieties'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section: Sidebar + Product Grid */}
      <section className="py-8 sm:py-12 bg-bg min-h-[600px]">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Filter Sidebar */}
            <aside className="w-full lg:w-64 lg:shrink-0">
              <Suspense
                fallback={
                  <div className="h-64 rounded-xl border border-border bg-white animate-pulse" />
                }
              >
                <ShopFilters
                  categories={categories}
                  currentCategory={currentCategory}
                  currentSort={currentSort}
                  currentSpice={currentSpice}
                  searchQuery={searchQuery}
                />
              </Suspense>
            </aside>

            {/* Right Product Grid */}
            <main className="flex-1 w-full" aria-label="Product listings">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary-faint text-primary flex items-center justify-center mb-4">
                    <PackageOpen size={32} />
                  </div>
                  <h2 className="text-lg font-bold text-ink mb-1">No products found</h2>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">
                    We couldn’t find any sev varieties matching your selected filters or search query.
                  </p>
                  <Link
                    href="/shop"
                    className="btn btn-outline text-xs px-5 py-2.5 h-auto rounded-lg"
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

      {/* 15 Consumer & Retail FAQs for SEO/GEO/AEO */}
      <FaqAccordionSection
        id="shop-faqs"
        badge="Shopping & Product FAQs"
        title="Frequently Asked Questions About Ordering Sev Online"
        subtitle="Common questions about our authentic Indore recipes, shelf life, zero palm oil promise, doorstep transit protection, and pan-India shipping."
        faqs={SHOP_FAQS}
        searchPlaceholder="Search questions (e.g. palm oil, poha, free delivery, shelf life, tracking)..."
        ctaTitle="Have a Question About Your Favorite Sev Variety?"
        ctaDescription="Our customer care team is available on WhatsApp and phone to assist you with recommendations and order support."
        ctaPrimaryLink={{ text: 'Contact Customer Support', href: '/contact' }}
        ctaSecondaryLink={{ text: 'Bulk Orders (10 KG+)', href: '/bulk-orders' }}
        className="bg-white border-t border-border"
      />
    </PublicLayout>
  );
}
