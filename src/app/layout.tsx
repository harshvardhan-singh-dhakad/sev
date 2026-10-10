import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rasvat.com'),
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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}