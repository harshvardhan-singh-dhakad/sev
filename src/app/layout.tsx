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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
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
        {/* Favicons & App Icons for Google SERP & All Browsers */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#B61E01" />
        <meta name="msapplication-TileColor" content="#B61E01" />
        <meta name="msapplication-TileImage" content="/android-chrome-192x192.png" />

        {/* AI & Knowledge Base Links */}
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
