import { Suspense } from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { ShopClient } from './ShopClient';

export const metadata: Metadata = {
  title: 'Shop Premium Sev | Rasvat',
  description: 'Browse our collection of authentic, premium quality Sev. Available in retail packs and bulk quantities.',
};

export default function ShopPage() {
  return (
    <PublicLayout>
      {/* Page header */}
      <div
        className="relative overflow-hidden pt-12 pb-10"
        style={{
          background: `
            radial-gradient(ellipse at 80% 0%, rgb(212 160 23 / 0.1) 0%, transparent 50%),
            var(--color-bg-surface)
          `,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-site relative z-10">
          <div className="section-label mb-3">Our Collection</div>
          <h1
            className="text-3xl md:text-4xl font-black mb-2"
            style={{ fontFamily: 'var(--font-outfit)', letterSpacing: '-0.02em', color: 'var(--color-text)' }}
          >
            Shop Premium Sev
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            Discover our wide range of authentic, freshly packed Sev varieties.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg)' }} className="min-h-screen pt-8 pb-20">
        <div className="container-site">
          <Suspense
            fallback={
              <div
                className="h-96 flex items-center justify-center rounded-2xl"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <p style={{ color: 'var(--color-text-muted)' }}>Loading products...</p>
              </div>
            }
          >
            <ShopClient />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}