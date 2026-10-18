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
  keywords: ['Aron Bites', 'Sev', 'Indori Sev', 'Ratlami Sev', 'Nylon Sev', 'bulk snacks', 'namkeen wholesale', 'Indian snacks'],
  authors: [{ name: 'Aron Bites' }],
  creator: 'Aron Bites',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Aron Bites',
    title: 'Aron Bites — Authentic Indian Namkeen & Snacks',
    description:
      'Premium quality Sev & snacks, freshly packed and delivered to your doorstep — from everyday packs to bulk quantities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aron Bites — Authentic Indian Namkeen & Snacks',
    description: 'Premium quality authentic Indian Sev & snacks. Retail, bulk & samples available.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
