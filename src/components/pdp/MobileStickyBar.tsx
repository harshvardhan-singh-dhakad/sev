'use client';

import { ShoppingBag } from 'lucide-react';
import { Variant, Product } from '@/lib/catalog';
import { formatINR } from '@/lib/pricing';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface MobileStickyBarProps {
  product: Product;
  selectedVariant: Variant;
}

export function MobileStickyBar({ product, selectedVariant }: MobileStickyBarProps) {
  const { addItem } = useCartStore();

  const isOos = selectedVariant.stock_qty !== null && selectedVariant.stock_qty <= 0;
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

  const handleQuickAdd = () => {
    if (isOos) {
      toast.error('This variant is out of stock');
      return;
    }

    addItem({
      productId: product.slug,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.label,
      weight: selectedVariant.label,
      quantity: 1,
      price: selectedVariant.price / 100,
      compareAtPrice: selectedVariant.mrp ? selectedVariant.mrp / 100 : undefined,
      thumbnail: primaryImage?.src || '/images/placeholder-sev.svg',
      slug: product.slug,
    });

    toast.success(`Added ${product.name} (${selectedVariant.label}) to cart!`);
  };

  return (
    <div
      id="mobile-sticky-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div>
          <div className="text-xs font-semibold text-gray-500">
            Selected: <strong className="text-ink">{selectedVariant.label}</strong>
          </div>
          <div
            className="text-lg font-black text-ink leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {formatINR(selectedVariant.price)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOos}
          className="h-11 px-6 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundColor: 'var(--color-primary)',
          }}
        >
          <ShoppingBag size={16} />
          <span>{isOos ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
