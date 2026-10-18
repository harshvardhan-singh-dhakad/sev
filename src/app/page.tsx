import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { HeroSection } from '@/app/(public)/_sections/HeroSection';
import { CategorySection } from '@/app/(public)/_sections/CategorySection';
import { BestSellersSection } from '@/app/(public)/_sections/BestSellersSection';
import { WhyChooseUsSection } from '@/app/(public)/_sections/WhyChooseUsSection';
import { BulkOrderCTA } from '@/app/(public)/_sections/BulkOrderCTA';
import { SampleCTA } from '@/app/(public)/_sections/SampleCTA';
import { FAQSection } from '@/app/(public)/_sections/FAQSection';
import { BlogPreviewSection } from '@/app/(public)/_sections/BlogPreviewSection';
import { absoluteUrl } from '@/lib/site-url';
import { HomepageBannerCarousel } from '@/components/layout/HomepageBannerCarousel';
import { getPublishedHomepageBanners, type BannerPlacement } from '@/lib/homepage-banners';

export const metadata: Metadata = {
  title: 'Premium Authentic Sev | Retail & Bulk Orders',
  description:
    'Shop premium quality Sev online. Indori Sev, Ratlami Sev, Nylon Sev and more. Bulk orders from 10 KG+. Request free samples. Freshly packed & delivered pan India.',
  alternates: { canonical: absoluteUrl('/') },
};

export default async function HomePage() {
  const banners = await getPublishedHomepageBanners();
  const bannerSlot = (placement: BannerPlacement) => (
    <HomepageBannerCarousel
      banners={banners
        .filter((banner) => banner.placement === placement)
        .sort((a, b) => a.displayOrder - b.displayOrder)}
    />
  );
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: 'Aron Bites',
        url: absoluteUrl('/'),
        inLanguage: 'en-IN',
        description: 'Authentic Indian Sev, Namkeen & Heritage Snacks delivered fresh across India.',
        publisher: { '@id': absoluteUrl('/#organization') },
      },
      {
        '@type': ['Organization', 'OnlineStore', 'FoodEstablishment'],
        '@id': absoluteUrl('/#organization'),
        name: 'Aron Bites',
        alternateName: ['AronBites', 'Aron Bites Authentic Sev'],
        url: absoluteUrl('/'),
        logo: absoluteUrl('/images/aronbites-logo.svg'),
        image: absoluteUrl('/images/Aron-bites-512x512.png'),
        description:
          'Premier Indian manufacturer of authentic Indori Sev, Ratlami Sev, and Malwa namkeen snacks. Retail delivery and bulk supply.',
        email: 'support@aronbites.com',
        telephone: '+91 62678 47718',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Indore',
          addressLocality: 'Indore',
          addressRegion: 'Madhya Pradesh',
          postalCode: '452001',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 22.7196,
          longitude: 75.8577,
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        priceRange: '₹₹',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91 62678 47718',
          contactType: 'customer service',
          email: 'support@aronbites.com',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }} />
      {bannerSlot('before_hero')}
      <HeroSection />
      {bannerSlot('after_hero')}
      <CategorySection />
      {bannerSlot('after_categories')}
      <BestSellersSection />
      {bannerSlot('after_best_sellers')}
      <WhyChooseUsSection />
      <BulkOrderCTA />
      {bannerSlot('after_bulk_cta')}
      <SampleCTA />
      <FAQSection />
      <BlogPreviewSection />
    </PublicLayout>
  );
}
