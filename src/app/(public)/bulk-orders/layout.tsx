import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { BULK_FAQS } from './bulk-faq-data';

export const metadata: Metadata = {
  title: 'Bulk & Wholesale Namkeen Orders | Indori & Ratlami Sev Supplier — Aron Bites',
  description:
    'Order authentic Indori Sev, Ratlami Sev, and Malwa namkeen in bulk directly from Indore factory. Wholesale pricing tiers from 10 KG to 500 KG+ (Quintals). Commercial supply for caterers, restaurants, sweet shops & corporate gifting. Pan-India freight dispatch.',
  keywords: [
    'bulk sev orders',
    'wholesale namkeen Indore',
    'Indori sev bulk supplier',
    'Ratlami sev wholesale price',
    'commercial namkeen catering',
    'sev quintal rate',
    'namkeen factory Indore',
    'B2B food products India',
  ],
  alternates: { canonical: absoluteUrl('/bulk-orders') },
  openGraph: {
    title: 'Bulk & Wholesale Namkeen Orders | Indori & Ratlami Sev Supplier — Aron Bites',
    description:
      'Order authentic Indori Sev and Ratlami Sev in wholesale bulk from Indore factory. Tiered discounts from 10 KG to 500 KG+. Pan-India freight dispatch.',
    url: absoluteUrl('/bulk-orders'),
    type: 'website',
  },
};

export default function BulkOrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/bulk-orders#faq'),
    mainEntity: BULK_FAQS.map((faq) => ({
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
