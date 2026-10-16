import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listStorefrontProducts } from '@/lib/storefront-catalog';
import { connection } from 'next/server';
import { ShopProductCard } from '@/components/shop/ShopProductCard';

export async function BestSellersSection() {
  await connection();
  const featured = await listStorefrontProducts({ featured: true }, 'popular', 1, 8);
  const products = featured.products.length
    ? featured.products
    : (await listStorefrontProducts({}, 'popular', 1, 8)).products;

  return (
    <section className="section" style={{ background: 'var(--color-bg)' }} aria-labelledby="bestsellers-heading">
      <div className="container-site">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-secondary text-ink">Our Collection</span>
            <h2 id="bestsellers-heading" className="section-heading" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)', marginBottom: '0.375rem' }}>
              Shop Sev & Namkeen
            </h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.0625rem' }}>
              Browse the varieties currently available in the Rasvat catalog.
            </p>
          </div>
          <Link href="/shop" className="btn btn-outline flex-shrink-0 hover:bg-primary hover:text-white transition-all font-semibold" style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border-dark)' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {products.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => <ShopProductCard key={product.slug} product={product} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-white p-6 text-gray-600">Products will appear here when they are available in the catalog.</p>
        )}
      </div>
    </section>
  );
}
