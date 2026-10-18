import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'Aron Bites — Authentic Indian Namkeen & Snacks',
    template: '%s | Aron Bites',
  },
  description:
    'Aron Bites offers premium quality authentic snacks & Sev — freshly packed and delivered to your doorstep. Shop retail packs, place bulk orders, or request a free sample.',
  keywords: [
    'Aron Bites',
    'Aron Bites Sev',
    'Indori Sev',
    'Ratlami Sev',
    'Nylon Sev',
    'Garlic Sev',
    'bulk snacks',
    'namkeen wholesale',
    'Indian snacks',
    'Indore namkeen',
  ],
  authors: [{ name: 'Aron Bites', url: 'https://aronbites.com' }],
  creator: 'Aron Bites',
  publisher: 'Aron Bites',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Aron Bites',
    title: 'Aron Bites — Authentic Indian Namkeen & Snacks',
    description:
      'Premium quality Sev & snacks, freshly packed and delivered to your doorstep — from everyday packs to bulk quantities.',
    url: SITE_URL.href,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aron Bites — Authentic Indian Namkeen & Snacks',
    description: 'Premium quality authentic Indian Sev & snacks. Retail, bulk & samples available.',
  },
  alternates: {
    canonical: SITE_URL.href,
    types: {
      'text/markdown': [
        { url: '/llms.txt', title: 'Aron Bites AI Context (llms.txt)' },
        { url: '/llms-full.txt', title: 'Aron Bites Full AI Knowledge Base (llms-full.txt)' },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'IN-MP',
    'geo.placename': 'Indore',
    'geo.position': '22.7196;75.8577',
    'ICBM': '22.7196, 75.8577',
    'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'googlebot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'bingbot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'ai-content-declarations': 'index, follow, summarize, quote, train',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="icon" href="/images/aronbites-logo.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="Aron Bites AI Context" />
        <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="Aron Bites Full AI Knowledge Base" />
        <link rel="help" href="/llms.txt" title="AI Documentation" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
