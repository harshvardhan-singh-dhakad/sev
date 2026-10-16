import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'About Rasvat',
  description: 'Learn about Rasvat and explore our sev and namkeen collection, retail orders, and bulk enquiries.',
  alternates: { canonical: absoluteUrl('/about') },
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <main className="container-site py-16 sm:py-24 max-w-4xl min-h-[55vh]">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">About Rasvat</p>
        <h1 className="text-4xl sm:text-5xl font-black mt-2">Sev and namkeen, made for sharing</h1>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl leading-relaxed">
          Rasvat is an online store for sev and namkeen. Browse the current product range, review pack details on each product listing, and choose retail checkout or send a bulk enquiry.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/shop" className="rounded-xl bg-primary px-5 py-3 text-white font-semibold">Explore the shop</Link>
          <Link href="/bulk-orders" className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold">Ask about bulk orders</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
