'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageBanner } from '@/lib/homepage-banners';

export function HomepageBannerCarousel({ banners }: { banners: HomepageBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = banners[activeIndex];

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners]);

  if (!activeBanner) return null;

  const poster = (
    <img
      src={activeBanner.imageUrl}
      alt={activeBanner.imageAlt}
      className="block h-full w-full object-cover"
    />
  );

  return (
    <section aria-label="Offers and announcements" className="container-site py-5 sm:py-7">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm aspect-[16/9]">
        {activeBanner.linkUrl ? (
          /^https:\/\//i.test(activeBanner.linkUrl) ? (
            <a href={activeBanner.linkUrl} target="_blank" rel="noreferrer" aria-label={activeBanner.title} className="block h-full w-full">
              {poster}
            </a>
          ) : (
            <Link href={activeBanner.linkUrl} aria-label={activeBanner.title} className="block h-full w-full">
              {poster}
            </Link>
          )
        ) : poster}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => setActiveIndex((activeIndex - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/75"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => setActiveIndex((activeIndex + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/75"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-label={`Banner ${activeIndex + 1} of ${banners.length}`}>
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Show banner ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/65'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
