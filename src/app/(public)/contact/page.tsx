import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Contact Rasvat Support',
  description: 'Get help with a Rasvat order, delivery, product question, bulk enquiry, or sample request.',
  alternates: { canonical: absoluteUrl('/contact') },
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 min-h-[55vh] max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">We can help</p>
        <h1 className="text-4xl font-black mt-2">Contact Rasvat</h1>
        <p className="text-gray-600 mt-4">For an existing order, include your order number in your message so the team can find it quickly.</p>
        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <a className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary" href="mailto:support@rasvat.in">
            <h2 className="font-bold text-lg">Email support</h2>
            <p className="mt-2 text-primary">support@rasvat.in</p>
            <p className="mt-2 text-sm text-gray-600">Order, delivery, product, and policy questions.</p>
          </a>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary" href="/track-order">
            <h2 className="font-bold text-lg">Track an order</h2>
            <p className="mt-2 text-sm text-gray-600">Check the latest order status using your order number and phone.</p>
          </Link>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary" href="/bulk-orders">
            <h2 className="font-bold text-lg">Bulk orders</h2>
            <p className="mt-2 text-sm text-gray-600">Send a retailer or wholesale enquiry.</p>
          </Link>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary" href="/samples">
            <h2 className="font-bold text-lg">Sample requests</h2>
            <p className="mt-2 text-sm text-gray-600">Ask about a product sample.</p>
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
