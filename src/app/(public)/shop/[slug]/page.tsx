import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import {
  getProductBySlug,
  getRelatedProducts,
  getStoreSettings,
} from '@/lib/catalog';
import { ProductDetailClient } from '@/components/pdp/ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    pack?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug, true);

  if (!product) {
    return {
      title: 'Product Not Found | Rasvat',
      description: 'The requested product could not be found.',
    };
  }

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const isDraft = product.status !== 'active';

  return {
    title: `${product.name} | Rasvat Premium Sev & Namkeen`,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | Rasvat Authentic Sev`,
      description: product.short_description,
      images: [
        {
          url: primaryImage?.src || '/hero-sev.jpg',
          alt: primaryImage?.alt || product.name,
        },
      ],
    },
    robots: isDraft
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const product = getProductBySlug(slug, true);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.slug, product.category, 4);
  const settings = getStoreSettings();

  // Primary image
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

  // Product JSON-LD structured data with offers per active variant
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description,
    image: primaryImage ? [primaryImage.src] : [],
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Rasvat',
    },
    offers: product.variants
      .filter((v) => v.is_active)
      .map((v) => ({
        '@type': 'Offer',
        price: (v.price / 100).toFixed(2),
        priceCurrency: 'INR',
        availability:
          v.stock_qty === null || v.stock_qty > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        sku: v.sku,
        name: `${product.name} - ${v.label}`,
      })),
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rasvat.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://rasvat.in/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `https://rasvat.in/shop?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://rasvat.in/shop/${product.slug}`,
      },
    ],
  };

  return (
    <PublicLayout>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="py-8 sm:py-12 bg-bg min-h-screen">
        <div className="container-site">
          <ProductDetailClient
            product={product}
            relatedProducts={relatedProducts}
            settings={settings}
            initialPack={resolvedSearchParams.pack}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
