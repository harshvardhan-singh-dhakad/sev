'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Product, Variant, Settings, getDefaultVariant } from '@/lib/catalog';
import { ProductGallery } from './ProductGallery';
import { ProductBuyBox } from './ProductBuyBox';
import { MobileStickyBar } from './MobileStickyBar';
import { ProductDetailsAccordion } from './ProductDetailsAccordion';
import { ShopProductCard } from '@/components/shop/ShopProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  settings: Settings;
  initialPack?: string;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  settings,
  initialPack,
}: ProductDetailClientProps) {
  // Find initial variant
  const initialVariant = useMemo(() => {
    if (initialPack) {
      const match = product.variants.find(
        (v) =>
          v.label.toLowerCase().replace(/\s+/g, '') ===
          initialPack.toLowerCase().replace(/\s+/g, '')
      );
      if (match) return match;
    }
    return getDefaultVariant(product);
  }, [initialPack, product]);

  const [selectedVariant, setSelectedVariant] = useState<Variant>(initialVariant);

  const handleVariantChange = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
  }, []);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs font-semibold text-gray-500 flex-wrap">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight size={12} className="text-gray-400" />
          </li>
          <li>
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
          </li>
          <li>
            <ChevronRight size={12} className="text-gray-400" />
          </li>
          <li>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-primary transition-colors capitalize"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
          </li>
          <li>
            <ChevronRight size={12} className="text-gray-400" />
          </li>
          <li aria-current="page" className="text-ink font-bold truncate max-w-xs sm:max-w-md">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Two Column Layout on >=1024px, Stacked below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left Column: Gallery (Span 7) */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            productName={product.name}
            selectedVariantId={selectedVariant.id}
          />
        </div>

        {/* Right Column: Buy Box (Span 5) */}
        <div className="lg:col-span-5">
          <ProductBuyBox
            product={product}
            settings={settings}
            onVariantChange={handleVariantChange}
          />
        </div>
      </div>

      {/* Below the Fold Details */}
      <ProductDetailsAccordion
        product={product}
        selectedVariant={selectedVariant}
        settings={settings}
      />

      {/* "More Sev" Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-border" aria-labelledby="related-heading">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Explore More Flavours
              </span>
              <h2
                id="related-heading"
                className="text-2xl sm:text-3xl font-black text-ink mt-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                More Sev You Will Love
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-primary transition-colors"
            >
              <span>View All Flavors</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <ShopProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Bar (<1024px) */}
      <MobileStickyBar product={product} selectedVariant={selectedVariant} />
    </>
  );
}
