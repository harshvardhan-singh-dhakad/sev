import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { SAMPLES_FAQS } from './samples-faq-data';

export const metadata: Metadata = {
  title: 'Request a Free Sev Sample Box | Authentic Indore Namkeen — Aron Bites',
  description:
    'Request a complimentary tasting box of authentic Indori Sev, Ratlami Sev, and Nylon Sev (50g packs). Perfect for B2B sweet shops, restaurants, caterers, and food lovers. Dispatched within 24 hours from Indore.',
  keywords: [
    'free sev sample box',
    'namkeen tasting kit',
    'Indori sev sample',
    'B2B food samples India',
    'Ratlami sev sample pack',
    'free business samples Indore namkeen',
    'restaurant food testing kit',
  ],
  alternates: { canonical: absoluteUrl('/samples') },
  openGraph: {
    title: 'Request a Free Sev Sample Box | Authentic Indore Namkeen — Aron Bites',
    description:
      'Evaluate our authentic taste before placing bulk orders. Up to 4 varieties (50g each) freshly packed and dispatched within 24 hours across India.',
    url: absoluteUrl('/samples'),
    type: 'website',
  },
};

export default function SamplesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/samples#faq'),
    mainEntity: SAMPLES_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      {children}
    </>
  );
}
