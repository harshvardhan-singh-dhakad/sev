import Link from 'next/link';
import {
  ArrowRight,
  Wheat,
  Flame,
  Sparkles,
  Leaf,
  Zap,
  Sprout,
  Star,
  Gift,
  Package,
} from 'lucide-react';
import { ProductCategory } from '@/lib/types';
import { getStorefrontCategories } from '@/lib/storefront-catalog';
import { connection } from 'next/server';

async function getCategories(): Promise<ProductCategory[]> {
  try {
    const categories = await getStorefrontCategories();
    return categories.map((category) => ({
      id: category.slug,
      name: category.name,
      slug: category.slug,
      description: category.description,
      displayOrder: category.display_order,
      status: category.status,
      image: category.image,
      createdAt: '',
      updatedAt: '',
    }));
  } catch {
    return [];
  }
}

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  'indori-sev': Wheat,
  'ratlami-sev': Flame,
  'nylon-sev': Sparkles,
  'plain-sev': Leaf,
  'tikha-sev': Zap,
  'garlic-sev': Sprout,
  'premium-sev': Star,
  'special-sev': Gift,
};

export async function CategorySection() {
  await connection();
  const categories = await getCategories();

  return (
    <section
      id="explore-our-sev-section"
      className="categories-section"
      aria-labelledby="categories-heading"
    >
      <style>{`
        .categories-section {
          padding: 56px 0;
          background-color: var(--color-bg-white);
        }
        @media (min-width: 1024px) {
          .categories-section {
            padding: 80px 0;
          }
        }
        .category-card {
          background-color: var(--color-bg-white);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 20px;
          min-height: 120px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }
        .category-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
        }
        .category-card:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--color-bg-white), 0 0 0 4px var(--color-primary);
        }
        @media (prefers-reduced-motion: reduce) {
          .category-card {
            transition: none;
          }
          .category-card:hover {
            transform: none;
          }
        }
        .categories-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 48px;
          padding: 0 24px;
          border: 1.5px solid var(--color-ink);
          color: var(--color-ink);
          border-radius: 10px;
          background-color: var(--color-bg-white);
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
        }
        .categories-cta:hover {
          background-color: var(--color-primary);
          color: #FFFFFF;
          border-color: var(--color-primary);
        }
        .categories-cta:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--color-bg-white), 0 0 0 4px var(--color-primary);
        }
        @media (prefers-reduced-motion: reduce) {
          .categories-cta {
            transition: none;
          }
        }
      `}</style>

      <div className="container-site">
        {/* Heading Block */}
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <span
            className="inline-block font-bold uppercase rounded-full"
            style={{
              fontSize: '12px',
              letterSpacing: '0.08em',
              padding: '6px 14px',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-ink)',
              marginBottom: '12px',
            }}
          >
            CATEGORIES
          </span>

          <h2
            id="categories-heading"
            className="font-bold"
            style={{
              fontFamily: 'var(--font-outfit)',
              color: 'var(--color-ink)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            Explore Our Sev
          </h2>

          <p
            style={{
              color: 'var(--color-ink-muted)',
              fontSize: '18px',
              lineHeight: 1.5,
              maxWidth: '560px',
              margin: '0 auto',
              textWrap: 'balance',
            }}
          >
            Browse the available product categories.
          </p>
        </div>

        {/* Categories Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          style={{ gridAutoRows: '1fr' }}
        >
          {categories.slice(0, 8).map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Package;
            const countText = 'Explore products';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                id={`category-card-${cat.slug}`}
                className="category-card group"
              >
                {/* 56px round icon circle */}
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    minWidth: '56px',
                    minHeight: '56px',
                    backgroundColor: 'var(--color-accent-tint)',
                  }}
                  aria-hidden="true"
                >
                  <Icon
                    size={24}
                    strokeWidth={2}
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Text stack */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3
                    className="font-semibold leading-snug"
                    style={{
                      fontFamily: 'var(--font-outfit)',
                      fontSize: '18px',
                      color: 'var(--color-ink)',
                    }}
                  >
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p
                      className="line-clamp-2 leading-relaxed"
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-ink-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {cat.description}
                    </p>
                  )}

                  <p
                    className="font-semibold"
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-primary)',
                      marginTop: '8px',
                    }}
                  >
                    {countText}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-sm text-gray-600">
            Categories will appear here when they are added to the store catalog.
          </p>
        )}

        {/* Centered CTA */}
        <div className="flex justify-center" style={{ marginTop: '40px' }}>
          <Link href="/shop" className="categories-cta" id="categories-view-all-btn">
            View All Sev
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
