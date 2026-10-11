'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Image as ProductImage } from '@/lib/catalog';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedVariantId?: string;
  onActiveIndexChange?: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  selectedVariantId,
  onActiveIndexChange,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Fallback to placeholder if images array is empty
  const displayImages = images.length > 0 ? images : [
    { src: '/images/placeholder-sev.svg', alt: productName, sort: 1, is_primary: true, variant_ids: [] },
  ];

  // Re-sync active image when variant selection changes
  useEffect(() => {
    if (!selectedVariantId) return;

    // Find first image matching this variant
    const matchIdx = displayImages.findIndex((img) =>
      img.variant_ids && img.variant_ids.includes(selectedVariantId)
    );

    if (matchIdx !== -1) {
      setActiveIndex(matchIdx);
      onActiveIndexChange?.(matchIdx);
    } else {
      // Fallback to primary image
      const primaryIdx = displayImages.findIndex((img) => img.is_primary);
      const targetIdx = primaryIdx !== -1 ? primaryIdx : 0;
      setActiveIndex(targetIdx);
      onActiveIndexChange?.(targetIdx);
    }
  }, [selectedVariantId, displayImages, onActiveIndexChange]);

  const activeImage = displayImages[activeIndex] || displayImages[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  }, [displayImages.length]);

  // Keyboard navigation for active image
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  // Lightbox keyboard and scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleGlobalKey);
    };
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div
      ref={galleryRef}
      className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-5"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Product image gallery. Use arrow keys to navigate images."
    >
      {/* Thumbnails Reel (Vertical on >=1024px, Horizontal swipe on <1024px) */}
      {displayImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Image thumbnails"
          className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto max-h-[500px] scrollbar-none pb-2 lg:pb-0"
        >
          {displayImages.map((img, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={`${img.src}-${idx}`}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`View image ${idx + 1} of ${displayImages.length}`}
                onClick={() => {
                  setActiveIndex(idx);
                  onActiveIndexChange?.(idx);
                }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isCurrent ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Viewport (1:1 Large Image with 20px radius and off-white surface) */}
      <div className="relative flex-1">
        <div
          className="relative aspect-square w-full rounded-[20px] overflow-hidden cursor-zoom-in group border border-border"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
          }}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Click to enlarge image in lightbox"
        >
          <Image
            src={activeImage.src}
            alt={activeImage.alt || productName}
            fill
            priority={true}
            sizes="(max-width: 1024px) 100vw, 550px"
            className="object-cover transition-opacity duration-150"
          />

          {/* Zoom hint badge */}
          <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-md text-gray-700 opacity-90 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={18} />
          </div>

          {/* Quick prev/next overlay buttons on hover */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal with Zoom */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Full size product image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
          onClick={() => {
            setLightboxOpen(false);
            setIsZoomed(false);
          }}
        >
          {/* Controls Bar */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((prev) => !prev);
              }}
              className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              <ZoomIn size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setLightboxOpen(false);
                setIsZoomed(false);
              }}
              className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Arrows inside Lightbox */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Large Image Container */}
          <div
            className={`relative max-w-4xl max-h-[85vh] w-full aspect-square transition-transform duration-200 cursor-pointer ${
              isZoomed ? 'scale-125' : 'scale-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((prev) => !prev);
            }}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt || productName}
              fill
              className="object-contain"
              priority={true}
            />
          </div>

          {/* Image counter indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            {activeIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
