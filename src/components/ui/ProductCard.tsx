'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Heart, Eye, Star, Package } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || null as unknown as ProductVariant
  );
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCartStore();
  const { hasItem, toggleItem } = useWishlistStore();

  const isWishlisted = hasItem(product.id);
  const discount = selectedVariant?.compareAtPrice
    ? getDiscountPercent(selectedVariant.price, selectedVariant.compareAtPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant) return;
    if (selectedVariant.stock <= 0) {
      toast.error('This variant is out of stock');
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      weight: selectedVariant.weight,
      quantity: 1,
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice,
      thumbnail: product.thumbnail,
      slug: product.slug,
    });
    toast.success(`${product.name} (${selectedVariant.weight}) added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <div
      className={cn('product-card group', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="product-card-image">
        <Link href={`/shop/${product.slug}`} aria-label={product.name}>
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              unoptimized={true}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Package size={48} className="text-gray-300" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestSeller && (
            <span className="badge badge-orange" style={{ fontSize: '0.625rem' }}>
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="badge badge-blue" style={{ fontSize: '0.625rem' }}>
              New
            </span>
          )}
          {product.featured && (
            <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="badge badge-red" style={{ fontSize: '0.625rem' }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div
          className={cn(
            'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200',
            hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}
        >
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={15}
              fill={isWishlisted ? '#ef4444' : 'none'}
              stroke={isWishlisted ? '#ef4444' : '#64748B'}
            />
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors"
            aria-label="Quick view"
          >
            <Eye size={15} className="text-gray-500" />
          </Link>
        </div>

        {/* OOS overlay */}
        {selectedVariant?.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge badge-gray text-sm font-bold px-4 py-2">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.categoryName && (
          <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#2563EB' }}>
            {product.categoryName}
          </p>
        )}

        {/* Name */}
        <Link href={`/shop/${product.slug}`}>
          <h3
            className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors"
            style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.9375rem' }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.avgRating && product.avgRating > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <StarRating rating={product.avgRating} size={13} />
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Variant selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.slice(0, 5).map((variant) => (
              <button
                key={variant.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariant(variant);
                }}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-lg border transition-all',
                  selectedVariant?.id === variant.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {variant.weight}
              </button>
            ))}
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="font-bold text-lg" style={{ color: '#FFF700', fontFamily: 'var(--font-outfit)' }}>
              {selectedVariant ? formatPrice(selectedVariant.price) : 'N/A'}
            </span>
            {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                {formatPrice(selectedVariant.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock <= 0}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            aria-label="Add to cart"
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating ? hoverRating : rating;

  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          style={{ background: 'none', border: 'none', padding: 0, lineHeight: 0 }}
          aria-label={interactive ? `Rate ${star} out of 5` : undefined}
        >
          <Star
            size={size}
            fill={star <= displayRating ? '#F59E0B' : 'none'}
            stroke={star <= displayRating ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-12 rounded-lg" />
          <div className="skeleton h-6 w-12 rounded-lg" />
          <div className="skeleton h-6 w-12 rounded-lg" />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}