'use client';

import Link from 'next/link';
import { ArrowRight, TruckIcon, Sparkles, Check, Package, Gift } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hero-visible');
        }
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative hero-section bg-bg-white"
      style={{ minHeight: '85vh' }}
      aria-label="Hero"
    >
      <div className="container-site relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="hero-text">
            {/* Top Badge */}
            <div
              className="inline-flex items-center rounded-full font-bold uppercase"
              style={{
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                letterSpacing: '0.08em',
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-ink)',
                marginBottom: '20px',
              }}
            >
              <Sparkles size={14} className="text-ink shrink-0" aria-hidden="true" />
              <span>Premium Authentic Indian Snack</span>
            </div>

            {/* H1 */}
            <h1
              className="font-bold leading-[1.1]"
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '20px',
              }}
            >
              Real Taste of India,{' '}
              <br />
              <span style={{ color: 'var(--color-primary)' }}>Delivered Fresh.</span>
            </h1>

            {/* Paragraph */}
            <p
              style={{
                color: 'var(--color-ink-muted)',
                maxWidth: '540px',
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Premium quality authentic Sev, freshly packed and delivered to your doorstep. We supply both retail packs for homes and bulk quantities for businesses.
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2" style={{ marginBottom: '32px' }}>
              {['Freshly Packed', 'Hygienic Processing', 'Bulk Friendly', 'Pan India Delivery'].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center rounded-full font-medium"
                  style={{
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-ink)',
                  }}
                >
                  <Check size={14} className="text-primary shrink-0" aria-hidden="true" />
                  {f}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: '40px' }}>
              <Link
                href="/shop"
                className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
                id="hero-shop-cta"
              >
                Shop Retail
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/bulk-orders"
                className="btn transition-all"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-bg-white)',
                  color: 'var(--color-ink)',
                  border: '1.5px solid var(--color-ink)',
                }}
                id="hero-bulk-cta"
              >
                <TruckIcon size={18} className="text-primary" aria-hidden="true" />
                Wholesale / B2B
              </Link>
            </div>

            {/* Divider and Stats */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '24px',
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { number: 'Sev', label: 'Explore varieties' },
                  { number: 'Retail', label: 'Shop online' },
                  { number: 'Bulk', label: 'Business enquiries' },
                  { number: 'Track', label: 'Follow your order' },
                ].map(({ number, label }) => (
                  <div key={label}>
                    <p
                      className="font-bold font-display"
                      style={{
                        fontFamily: 'var(--font-outfit)',
                        fontSize: 'clamp(28px, 3vw, 32px)',
                        lineHeight: 1.2,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {number}
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-ink-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual side */}
          <div className="flex items-center justify-center mt-8 lg:mt-0 relative px-4">
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-full">
              {/* Main product image container */}
              <div
                className="relative w-full h-full rounded-full overflow-hidden shadow-2xl z-10"
                style={{
                  border: '8px solid white',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img
                  src="/hero-sev.jpg"
                  alt="Premium Bowl of Sev"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Background decorative blob */}
              <div
                className="absolute inset-0 rounded-full z-0 transform translate-x-4 translate-y-4"
                style={{ background: 'var(--color-primary-faint)' }}
              />

              {/* Floating badge (red) - top-right info card */}
              <div
                className="absolute z-20 whitespace-nowrap rounded-[14px] shadow-md flex items-center gap-2 max-sm:top-3 max-sm:right-3 max-sm:scale-90 max-sm:origin-top-right sm:top-[6%] sm:-right-[6%] lg:top-[8%] lg:-right-[8%]"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  width: 'fit-content',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Package size={20} className="shrink-0 text-white" aria-hidden="true" />
                <div className="flex flex-col text-left leading-[1.25]">
                  <span className="text-[14px] font-bold text-white">Bulk Available</span>
                  <span className="text-[12px] text-white/90">From 10 KG+</span>
                </div>
              </div>

              {/* Floating badge (yellow) - bottom-left info card */}
              <div
                className="absolute z-20 whitespace-nowrap rounded-[14px] shadow-md flex items-center gap-2 max-sm:bottom-3 max-sm:left-3 max-sm:scale-90 max-sm:origin-bottom-left sm:bottom-[8%] sm:-left-[6%] lg:bottom-[10%] lg:-left-[8%]"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-ink)',
                  padding: '10px 16px',
                  width: 'fit-content',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Gift size={20} className="shrink-0 text-ink" aria-hidden="true" />
                <div className="flex flex-col text-left leading-[1.25]">
                  <span className="text-[14px] font-bold text-ink">Free Samples</span>
                  <span className="text-[12px] text-ink/80">For B2B buyers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
