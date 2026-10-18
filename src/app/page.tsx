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
    '@type': 'WebSite',
    name: 'Aron Bites',
    url: absoluteUrl('/'),
    inLanguage: 'en-IN',
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
