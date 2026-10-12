'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Product, Variant, Settings } from '@/lib/catalog';
import {
  formatINR,
  perKgPrice,
  savingPercent,
  getHighestPerKgPrice,
  clampQuantity,
} from '@/lib/pricing';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductBuyBoxProps {
  product: Product;
  settings: Settings;
  onVariantChange?: (variant: Variant) => void;
}

export function ProductBuyBox({
  product,
  settings,
  onVariantChange,
}: ProductBuyBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addItem, openCart } = useCartStore();

  // Active variants sorted by weight
  const activeVariants = useMemo(() => {
    return [...product.variants]
      .filter((v) => v.is_active)
      .sort((a, b) => a.weight_grams - b.weight_grams);
  }, [product.variants]);

  // Highest per-kg price across active variants
  const highestPerKg = useMemo(() => {
    return getHighestPerKgPrice(activeVariants);
  }, [activeVariants]);

  // Read pack parameter from URL if present
  const packParam = searchParams.get('pack');

  // Identify initially selected variant
  const initialVariant = useMemo(() => {
    if (packParam) {
      const match = activeVariants.find(
        (v) =>
          v.label.toLowerCase().replace(/\s+/g, '') ===
          packParam.toLowerCase().replace(/\s+/g, '')
      );
      if (match) return match;
    }
    const defaultMatch = activeVariants.find((v) => v.id === product.default_variant_id);
    return defaultMatch || activeVariants[0] || product.variants[0];
  }, [packParam, activeVariants, product.default_variant_id, product.variants]);

  const [selectedVariant, setSelectedVariant] = useState<Variant>(initialVariant);
  const [quantity, setQuantity] = useState<number>(selectedVariant.min_qty || 1);

  // Sync state if URL pack parameter changes externally
  useEffect(() => {
    if (packParam) {
      const match = activeVariants.find(
        (v) =>
          v.label.toLowerCase().replace(/\s+/g, '') ===
          packParam.toLowerCase().replace(/\s+/g, '')
      );
      if (match && match.id !== selectedVariant.id) {
        setSelectedVariant(match);
        setQuantity(match.min_qty || 1);
        onVariantChange?.(match);
      }
    }
  }, [packParam, activeVariants, selectedVariant.id, onVariantChange]);

  const handleSelectVariant = useCallback(
    (variant: Variant) => {
      if (variant.stock_qty !== null && variant.stock_qty <= 0) return; // Disabled if out of stock

      setSelectedVariant(variant);
      setQuantity(variant.min_qty || 1);
      onVariantChange?.(variant);

      // Update URL query ?pack=250g without scroll or page reload
      const params = new URLSearchParams(searchParams.toString());
      const packSlug = variant.label.toLowerCase().replace(/\s+/g, '');
      params.set('pack', packSlug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, onVariantChange]
  );

  // Arrow key navigation between variant chips
  const handleVariantKeyDown = (
    e: React.KeyboardEvent,
    currentIndex: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % activeVariants.length;
      handleSelectVariant(activeVariants[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex =
        (currentIndex - 1 + activeVariants.length) % activeVariants.length;
      handleSelectVariant(activeVariants[prevIndex]);
    }
  };

  const isOutOfStock = selectedVariant.stock_qty !== null && selectedVariant.stock_qty <= 0;
  const isTrialPack = selectedVariant.weight_grams <= 25;

  const currentPricePaise = selectedVariant.price;
  const currentPerKgPaise = perKgPrice(currentPricePaise, selectedVariant.weight_grams);
  const discountPercent = savingPercent(
    currentPricePaise,
    selectedVariant.weight_grams,
    highestPerKg
  );

  const handleQuantityMinus = () => {
    setQuantity((prev) =>
      clampQuantity(prev - (selectedVariant.step || 1), selectedVariant.min_qty || 1, selectedVariant.max_qty, selectedVariant.step || 1)
    );
  };

  const handleQuantityPlus = () => {
    setQuantity((prev) =>
      clampQuantity(prev + (selectedVariant.step || 1), selectedVariant.min_qty || 1, selectedVariant.max_qty, selectedVariant.step || 1)
    );
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This variant is out of stock');
      return;
    }

    const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

    addItem({
      productId: product.slug,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.label,
      weight: selectedVariant.label,
      quantity,
      price: currentPricePaise / 100, // store format compatibility
      compareAtPrice: selectedVariant.mrp ? selectedVariant.mrp / 100 : undefined,
      thumbnail: primaryImage?.src || '/images/placeholder-sev.svg',
      slug: product.slug,
    });

    toast.success(`Added ${quantity} × ${product.name} (${selectedVariant.label}) to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('This variant is out of stock');
      return;
    }
    handleAddToCart();
    openCart();
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Category & Spice Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={`/shop?category=${product.category}`}
          className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
        >
          {product.category.replace(/-/g, ' ')}
        </Link>

        {/* Spice Level Indicator */}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
          style={{
            backgroundColor:
              product.spice_level === 'hot'
                ? 'rgba(220, 38, 38, 0.08)'
                : product.spice_level === 'medium'
                ? 'rgba(217, 119, 6, 0.08)'
                : 'rgba(22, 163, 74, 0.08)',
            color:
              product.spice_level === 'hot'
                ? 'var(--color-danger)'
                : product.spice_level === 'medium'
                ? 'var(--color-warning)'
                : 'var(--color-success)',
            border: '1px solid currentColor',
          }}
        >
          <Flame size={13} />
          <span className="capitalize">{product.spice_level} Spice</span>
        </span>
      </div>

      {/* Product H1 & Badge */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </h1>
          {product.badge && (
            <span
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-ink shadow-sm"
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="mt-2.5 text-sm sm:text-base text-gray-600 leading-relaxed">
          {product.short_description}
        </p>
      </div>

      {/* Dynamic Price Block */}
      <div
        className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-sm space-y-2"
        aria-live="polite"
      >
        <div className="flex items-baseline gap-3 flex-wrap">
          {/* Active Price */}
          <span
            className="text-3xl sm:text-4xl font-black text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {formatINR(currentPricePaise)}
          </span>

          {/* MRP Strike if present */}
          {selectedVariant.mrp && selectedVariant.mrp > currentPricePaise && (
            <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
              {formatINR(selectedVariant.mrp)}
            </span>
          )}

          {/* Saving % Badge */}
          {discountPercent > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
              Save {discountPercent}% vs trial pack
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span>Net Rate: <strong className="text-ink">{formatINR(currentPerKgPaise)}/kg</strong></span>
          <span>•</span>
          <span>MRP inclusive of all taxes</span>
        </div>
      </div>

      {/* Pack Selector (Radio Group of Chips) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Select Pack Size: <span className="text-primary font-black ml-1">{selectedVariant.label}</span>
          </label>
        </div>

        <div
          role="radiogroup"
          aria-label="Available pack sizes"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {activeVariants.map((variant, idx) => {
            const isSelected = selectedVariant.id === variant.id;
            const isOos = variant.stock_qty !== null && variant.stock_qty <= 0;

            return (
              <button
                key={variant.id}
                role="radio"
                type="button"
                aria-checked={isSelected}
                disabled={isOos}
                onClick={() => handleSelectVariant(variant)}
                onKeyDown={(e) => handleVariantKeyDown(e, idx)}
                className={`relative p-3 rounded-xl text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isOos
                    ? 'opacity-40 cursor-not-allowed line-through bg-gray-100 border-gray-200'
                    : isSelected
                    ? 'shadow-sm'
                    : 'bg-white hover:border-gray-400'
                }`}
                style={{
                  border: isSelected
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
                  backgroundColor: isSelected
                    ? 'var(--color-accent-tint)'
                    : 'var(--color-bg-white)',
                }}
              >
                {/* Variant Tag/Badge */}
                {variant.badge && (
                  <span
                    className={`absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-800 text-white'
                    }`}
                  >
                    {variant.badge}
                  </span>
                )}

                <div className="text-xs font-bold text-ink mb-0.5">{variant.label}</div>
                <div className="text-xs font-semibold text-gray-700">
                  {formatINR(variant.price)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Trial Pack Hint (Dynamically pulling min_cart_value from settings) */}
        {isTrialPack && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Trial pack.</strong> Minimum order{' '}
              <strong>{formatINR(settings.min_cart_value)}</strong> applies; add other packs to reach it.
            </p>
          </div>
        )}
      </div>

      {/* Quantity Stepper & Add to Cart / Buy Now CTAs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Stepper */}
          <div className="flex items-center rounded-xl bg-white border border-border h-[52px] px-2 shadow-sm">
            <button
              type="button"
              onClick={handleQuantityMinus}
              disabled={quantity <= (selectedVariant.min_qty || 1) || isOutOfStock}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span
              className="w-12 text-center font-bold text-sm text-ink"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleQuantityPlus}
              disabled={
                Boolean(selectedVariant.max_qty && quantity >= selectedVariant.max_qty) ||
                isOutOfStock
              }
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Primary Add to Cart (52px height) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 h-[52px] rounded-xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>

        {/* Buy Now (Ink Outline, 52px height) */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="w-full h-[52px] rounded-xl font-bold text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ink"
          style={{
            border: '2px solid var(--color-ink)',
            color: 'var(--color-ink)',
            backgroundColor: 'transparent',
          }}
        >
          <Zap size={18} />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Trust Row */}
      <div
        className="pt-4 pb-2 border-t border-border grid grid-cols-3 gap-2 text-center"
      >
        <div className="flex flex-col items-center gap-1">
          <Sparkles size={18} className="text-primary" />
          <span className="text-[11px] font-bold text-gray-700">Freshly Packed</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={18} className="text-primary" />
          <span className="text-[11px] font-bold text-gray-700">Hygienic Processing</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Truck size={18} className="text-primary" />
          <span className="text-[11px] font-bold text-gray-700">Pan India Delivery</span>
        </div>
      </div>

      {/* Bulk Order Banner */}
      <div className="p-4 rounded-xl bg-gray-50 border border-border flex items-center justify-between gap-3">
        <div className="text-xs text-gray-700">
          <span className="font-bold text-ink">Need bulk quantity?</span> Save with special partner rates for events & businesses.
        </div>
        <Link
          href="/bulk-orders"
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>Request Quote</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
