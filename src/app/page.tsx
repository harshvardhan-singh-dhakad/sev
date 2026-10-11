import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { HeroSection } from '@/app/(public)/_sections/HeroSection';
import { CategorySection } from '@/app/(public)/_sections/CategorySection';
import { BestSellersSection } from '@/app/(public)/_sections/BestSellersSection';
import { WhyChooseUsSection } from '@/app/(public)/_sections/WhyChooseUsSection';
import { BulkOrderCTA } from '@/app/(public)/_sections/BulkOrderCTA';
import { SampleCTA } from '@/app/(public)/_sections/SampleCTA';
import { ReviewsSection } from '@/app/(public)/_sections/ReviewsSection';
import { FAQSection } from '@/app/(public)/_sections/FAQSection';
import { BlogPreviewSection } from '@/app/(public)/_sections/BlogPreviewSection';

export const metadata: Metadata = {
  title: 'Premium Authentic Sev | Retail & Bulk Orders',
  description:
    'Shop premium quality Sev online. Indori Sev, Ratlami Sev, Nylon Sev and more. Bulk orders from 10 KG+. Request free samples. Freshly packed & delivered pan India.',
};

export default async function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <CategorySection />
      <BestSellersSection />
      <WhyChooseUsSection />
      <BulkOrderCTA />
      <SampleCTA />
      <ReviewsSection />
      <FAQSection />
      <BlogPreviewSection />
    </PublicLayout>
  );
}