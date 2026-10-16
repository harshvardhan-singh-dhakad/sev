import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'Rasvat — Premium Authentic Sev',
    template: '%s | Rasvat',
  },
  description:
    'Rasvat offers premium quality authentic Sev — freshly packed and delivered to your doorstep. Shop retail packs, place bulk orders, or request a free sample.',
  keywords: ['Sev', 'Indori Sev', 'Ratlami Sev', 'Nylon Sev', 'bulk sev', 'sev wholesale', 'Indian snacks'],
  authors: [{ name: 'Rasvat' }],
  creator: 'Rasvat',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Rasvat',
    title: 'Rasvat — Premium Authentic Sev',
    description:
      'Premium quality Sev, freshly packed and delivered to your doorstep — from everyday packs to bulk quantities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rasvat — Premium Authentic Sev',
    description: 'Premium quality authentic Indian Sev. Retail, bulk & samples available.',
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
