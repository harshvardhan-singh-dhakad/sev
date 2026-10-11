import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';

async function getBestSellers(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?bestSeller=true&status=active&limit=8`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEMO_PRODUCTS;
    const data = await res.json();
    return data.products?.length ? data.products : DEMO_PRODUCTS;
  } catch {
    return DEMO_PRODUCTS;
  }
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Premium Indori Sev', slug: 'premium-indori-sev', categoryId: '1',
    categoryName: 'Indori Sev', shortDescription: 'Classic Indore-style crispy golden sev with perfect crunch',
    longDescription: '', images: [], thumbnail: '',
    status: 'active', featured: true, bestSeller: true, isNew: false, recommended: true,
    avgRating: 4.8, reviewCount: 124,
    variants: [
      { id: 'v1', productId: 'p1', name: '250g', weight: '250g', weightGrams: 250, sku: 'IND-250', price: 75, compareAtPrice: 90, stock: 50, lowStockThreshold: 10, status: 'active' },
      { id: 'v2', productId: 'p1', name: '500g', weight: '500g', weightGrams: 500, sku: 'IND-500', price: 140, compareAtPrice: 170, stock: 40, lowStockThreshold: 8, status: 'active' },
      { id: 'v3', productId: 'p1', name: '1 KG', weight: '1 KG', weightGrams: 1000, sku: 'IND-1KG', price: 270, stock: 30, lowStockThreshold: 5, status: 'active' },
    ],
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'p2', name: 'Ratlami Special Sev', slug: 'ratlami-special-sev', categoryId: '2',
    categoryName: 'Ratlami Sev', shortDescription: 'Bold & spicy Ratlami sev with authentic masala blend',
    longDescription: '', images: [], thumbnail: '',
    status: 'active', featured: false, bestSeller: true, isNew: false, recommended: true,
    avgRating: 4.7, reviewCount: 89,
    variants: [
      { id: 'v4', productId: 'p2', name: '250g', weight: '250g', weightGrams: 250, sku: 'RAT-250', price: 80, compareAtPrice: 95, stock: 45, lowStockThreshold: 10, status: 'active' },
      { id: 'v5', productId: 'p2', name: '500g', weight: '500g', weightGrams: 500, sku: 'RAT-500', price: 150, stock: 35, lowStockThreshold: 8, status: 'active' },
    ],
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'p3', name: 'Thin Nylon Sev', slug: 'thin-nylon-sev', categoryId: '3',
    categoryName: 'Nylon Sev', shortDescription: 'Ultra-thin, delicate nylon sev — perfect for chaat & garnishing',
    longDescription: '', images: [], thumbnail: '',
    status: 'active', featured: true, bestSeller: true, isNew: true, recommended: false,
    avgRating: 4.9, reviewCount: 201,
    variants: [
      { id: 'v6', productId: 'p3', name: '200g', weight: '200g', weightGrams: 200, sku: 'NYL-200', price: 65, stock: 60, lowStockThreshold: 15, status: 'active' },
      { id: 'v7', productId: 'p3', name: '500g', weight: '500g', weightGrams: 500, sku: 'NYL-500', price: 150, compareAtPrice: 175, stock: 50, lowStockThreshold: 10, status: 'active' },
    ],
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'p4', name: 'Garlic Tikha Sev', slug: 'garlic-tikha-sev', categoryId: '5',
    categoryName: 'Tikha Sev', shortDescription: 'Fiery garlic sev for true spice lovers',
    longDescription: '', images: [], thumbnail: '',
    status: 'active', featured: false, bestSeller: true, isNew: false, recommended: true,
    avgRating: 4.6, reviewCount: 67,
    variants: [
      { id: 'v8', productId: 'p4', name: '250g', weight: '250g', weightGrams: 250, sku: 'GTK-250', price: 85, stock: 40, lowStockThreshold: 8, status: 'active' },
      { id: 'v9', productId: 'p4', name: '500g', weight: '500g', weightGrams: 500, sku: 'GTK-500', price: 160, compareAtPrice: 185, stock: 25, lowStockThreshold: 5, status: 'active' },
    ],
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
];

export async function BestSellersSection() {
  const products = await getBestSellers();

  return (
    <section
      className="section"
      style={{ background: 'var(--color-bg)' }}
      aria-labelledby="bestsellers-heading"
    >
      <div className="container-site">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-secondary text-ink">
              Top Rated
            </span>
            <h2
              id="bestsellers-heading"
              className="section-heading"
              style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)', marginBottom: '0.375rem' }}
            >
              Best Sellers
            </h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.0625rem' }}>
              Our most loved Sev — tried and trusted by thousands
            </p>
          </div>
          <Link
            href="/shop?sort=bestselling"
            className="btn btn-outline flex-shrink-0 hover:bg-primary hover:text-white transition-all font-semibold"
            style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border-dark)' }}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}