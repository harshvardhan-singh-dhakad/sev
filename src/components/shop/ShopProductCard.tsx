'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Flame } from 'lucide-react';
import { Product, Variant, getDefaultVariant } from '@/lib/catalog';
import { formatINR, perKgPrice } from '@/lib/pricing';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ShopProductCardProps {
  product: Product;
  className?: string;
}

export function ShopProductCard({ product, className = '' }: ShopProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();

  const defaultVariant: Variant = getDefaultVariant(product);
  const primaryImg = product.images.find((img) => img.is_primary) || product.images[0];
  const secondaryImg = product.images.length > 1 ? product.images[1] : null;

  const activeImgSrc = isHovered && secondaryImg ? secondaryImg.src : primaryImg?.src || '/images/placeholder-sev.svg';
  const pricePaise = defaultVariant.price;
  const perKgPaise = perKgPrice(pricePaise, defaultVariant.weight_grams);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (defaultVariant.stock_qty !== null && defaultVariant.stock_qty <= 0) {
      toast.error('This pack is currently out of stock');
      return;
    }

    addItem({
      productId: product.slug,
      productName: product.name,
      variantId: defaultVariant.id,
      variantName: defaultVariant.label,
      weight: defaultVariant.label,
      quantity: 1,
      price: pricePaise / 100, // store format compatibility (Rs)
      compareAtPrice: defaultVariant.mrp ? defaultVariant.mrp / 100 : undefined,
      thumbnail: defaultVariant.image || primaryImg?.src || '/images/placeholder-sev.svg',
      slug: product.slug,
    });

    toast.success(`Added ${product.name} (${defaultVariant.label}) to cart!`);
  };

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-150 ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-white)',
        border: '1px solid var(--color-border)',
        boxShadow: isHovered ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1:1 Image Container */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <Link
          href={`/shop/${product.slug}`}
          className="block w-full h-full relative"
          aria-label={`View details of ${product.name}`}
        >
          <Image
            src={activeImgSrc}
            alt={primaryImg?.alt || product.name}
            fill
            unoptimized={true}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </Link>

        {/* Badges Overlay */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-ink)',
              }}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Spice Indicator at bottom-right of image */}
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none z-10">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color:
                product.spice_level === 'hot'
                  ? 'var(--color-danger)'
                  : product.spice_level === 'medium'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Flame size={12} />
            <span className="capitalize">{product.spice_level}</span>
          </span>
        </div>
      </div>

      {/* Content Block */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill */}
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-primary)' }}
            >
              {product.category.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Product Name */}
          <h2
            className="font-bold text-sm sm:text-lg mb-1 leading-snug transition-colors group-hover:text-primary"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-ink)',
            }}
          >
            <Link href={`/shop/${product.slug}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {product.name}
            </Link>
          </h2>

          {/* Short Description (2-line CSS clamp) */}
          <p
            className="text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            {product.short_description}
          </p>
        </div>

        {/* Pricing & Quick-Add Bar */}
        <div
          className="pt-3 flex items-center justify-between gap-1.5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold text-sm sm:text-lg"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-ink)',
                }}
              >
                {formatINR(pricePaise)}
              </span>
              <span className="text-[10px] sm:text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                / {defaultVariant.label}
              </span>
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {formatINR(perKgPaise)}/kg
            </div>
          </div>

          {/* Quick-Add Button (Default Variant) */}
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} ${defaultVariant.label} to cart`}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              backgroundColor: 'var(--color-primary-faint)',
              color: 'var(--color-primary-dark)',
              border: '1px solid rgba(211, 47, 47, 0.2)',
            }}
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
