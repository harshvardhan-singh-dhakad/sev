'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageBanner } from '@/lib/homepage-banners';

export function HomepageBannerCarousel({ banners }: { banners: HomepageBanner[] }) {
  const total = banners?.length ?? 0;

  // For seamless infinite loop, clone the last slide at the start and the first slide at the end
  const extendedSlides = total > 1 ? [banners[total - 1], ...banners, banners[0]] : banners;

  const [currentIndex, setCurrentIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const hasDraggedRef = useRef<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (total < 2 || isTransitioning) return;
    setWithTransition(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [total, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (total < 2 || isTransitioning) return;
    setWithTransition(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [total, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (total < 2 || isTransitioning) return;
    setWithTransition(true);
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  }, [total, isTransitioning]);

  // Handle transition end for the infinite circular loop
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);

    if (total < 2) return;

    if (currentIndex === extendedSlides.length - 1) {
      // Reached cloned first slide at the end -> jump instantly to real first slide
      setWithTransition(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached cloned last slide at the start -> jump instantly to real last slide
      setWithTransition(false);
      setCurrentIndex(total);
    }
  }, [currentIndex, extendedSlides.length, total]);

  // Autoplay timer with pause on hover/interaction
  useEffect(() => {
    if (total < 2 || isPaused || isDragging) return;

    const interval = window.setInterval(() => {
      goToNext();
    }, 4500);

    return () => window.clearInterval(interval);
  }, [total, isPaused, isDragging, goToNext]);

  // Reset to first slide if banner list changes
  useEffect(() => {
    setCurrentIndex(1);
    setWithTransition(true);
    setIsTransitioning(false);
  }, [banners]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (total < 2) return;
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Touch event handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (total < 2) return;
    touchStartX.current = e.touches[0].clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
    setDragDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
    }
    setDragDelta(delta);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const delta = dragDelta;
    touchStartX.current = null;
    setIsDragging(false);
    setDragDelta(0);

    if (delta < -45) {
      goToNext();
    } else if (delta > 45) {
      goToPrev();
    }
  };

  // Mouse drag event handlers for desktop feel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (total < 2) return;
    mouseStartX.current = e.clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
    setDragDelta(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    if (Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
    }
    setDragDelta(delta);
  };

  const handleMouseUp = () => {
    if (mouseStartX.current === null) return;
    const delta = dragDelta;
    mouseStartX.current = null;
    setIsDragging(false);
    setDragDelta(0);

    if (delta < -45) {
      goToNext();
    } else if (delta > 45) {
      goToPrev();
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (isDragging) {
      handleMouseUp();
    }
  };

  if (!banners || total === 0) return null;

  // Single banner: render statically without carousel chrome
  if (total === 1) {
    const banner = banners[0];
    const poster = (
      <img
        src={banner.imageUrl}
        alt={banner.imageAlt || banner.title}
        loading="eager"
        className="block h-full w-full object-cover select-none"
      />
    );

    return (
      <section aria-label="Offers and announcements" className="container-site py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-100 shadow-sm aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/8] max-h-[460px]">
          {banner.linkUrl ? (
            /^https:\/\//i.test(banner.linkUrl) ? (
              <a
                href={banner.linkUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={banner.title}
                className="block h-full w-full"
              >
                {poster}
              </a>
            ) : (
              <Link href={banner.linkUrl} aria-label={banner.title} className="block h-full w-full">
                {poster}
              </Link>
            )
          ) : (
            poster
          )}
        </div>
      </section>
    );
  }

  // Active dot index calculation
  let activeDotIndex = (currentIndex - 1) % total;
  if (activeDotIndex < 0) activeDotIndex = total - 1;

  const trackTransform = isDragging
    ? `translateX(calc(-${currentIndex * 100}% + ${dragDelta}px))`
    : `translateX(-${currentIndex * 100}%)`;

  const trackTransition = isDragging || !withTransition
    ? 'none'
    : 'transform 650ms cubic-bezier(0.25, 1, 0.5, 1)';

  return (
    <section aria-label="Offers and announcements" className="container-site py-4 sm:py-6">
      <div
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotional Banners"
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-100 shadow-sm aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/8] max-h-[460px] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Horizontal Smooth Sliding Track */}
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex w-full h-full will-change-transform"
          style={{
            transform: trackTransform,
            transition: trackTransition,
          }}
        >
          {extendedSlides.map((banner, index) => {
            const isCloned = index === 0 || index === extendedSlides.length - 1;
            const slidePoster = (
              <img
                src={banner.imageUrl}
                alt={banner.imageAlt || banner.title}
                loading={index <= 2 ? 'eager' : 'lazy'}
                draggable={false}
                className="block h-full w-full object-cover select-none pointer-events-none"
              />
            );

            return (
              <div
                key={`${banner.id || index}-${index}`}
                role="group"
                aria-roledescription="slide"
                aria-hidden={isCloned}
                aria-label={!isCloned ? banner.title : undefined}
                className="relative h-full w-full flex-shrink-0 flex-grow-0"
              >
                {banner.linkUrl ? (
                  /^https:\/\//i.test(banner.linkUrl) ? (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={banner.title}
                      onClick={(e) => {
                        if (hasDraggedRef.current) e.preventDefault();
                      }}
                      className="block h-full w-full outline-none"
                    >
                      {slidePoster}
                    </a>
                  ) : (
                    <Link
                      href={banner.linkUrl}
                      aria-label={banner.title}
                      onClick={(e) => {
                        if (hasDraggedRef.current) e.preventDefault();
                      }}
                      className="block h-full w-full outline-none"
                    >
                      {slidePoster}
                    </Link>
                  )
                ) : (
                  slidePoster
                )}
              </div>
            );
          })}
        </div>

        {/* Previous Navigation Button */}
        <button
          type="button"
          aria-label="Previous banner"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2.5 sm:p-3 text-stone-800 bg-white/75 hover:bg-white backdrop-blur-md shadow-md border border-white/50 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 focus:opacity-100 focus:outline-none"
        >
          <ChevronLeft size={20} className="sm:w-5 sm:h-5 text-stone-900" />
        </button>

        {/* Next Navigation Button */}
        <button
          type="button"
          aria-label="Next banner"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2.5 sm:p-3 text-stone-800 bg-white/75 hover:bg-white backdrop-blur-md shadow-md border border-white/50 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 focus:opacity-100 focus:outline-none"
        >
          <ChevronRight size={20} className="sm:w-5 sm:h-5 text-stone-900" />
        </button>

        {/* Smooth Indicator Pills */}
        <div
          className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-sm"
          aria-label={`Banner ${activeDotIndex + 1} of ${total}`}
        >
          {banners.map((banner, index) => {
            const isActive = index === activeDotIndex;
            return (
              <button
                key={banner.id || index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  isActive
                    ? 'w-6 sm:w-7 bg-white shadow-sm'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
