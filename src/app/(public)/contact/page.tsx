import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Contact Aron Bites Support',
  description: 'Get help with an Aron Bites order, delivery, product question, bulk enquiry, or sample request.',
  alternates: { canonical: absoluteUrl('/contact') },
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 min-h-[55vh] max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">We can help</p>
        <h1 className="text-4xl font-black mt-2">Contact Aron Bites</h1>
        <p className="text-gray-600 mt-4">For an existing order, include your order number in your message so the team can find it quickly.</p>
        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <a className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary transition-colors" href="mailto:support@aronbites.com">
            <h2 className="font-bold text-lg text-slate-900">Email support</h2>
            <p className="mt-2 text-primary font-semibold">support@aronbites.com</p>
            <p className="mt-2 text-sm text-gray-600">Order, delivery, product, and policy questions.</p>
          </a>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-lg text-slate-900">Phone &amp; WhatsApp</h2>
            <div className="mt-2 space-y-1">
              <a href="tel:+916267847718" className="block text-primary font-semibold hover:underline">
                +91 62678 47718
              </a>
              <a href="tel:+919885123339" className="block text-primary font-semibold hover:underline">
                +91 98851 23339
              </a>
            </div>
            <p className="mt-2 text-sm text-gray-600">Mon – Sat, 9:00 AM – 7:00 PM IST</p>
          </div>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary transition-colors" href="/track-order">
            <h2 className="font-bold text-lg text-slate-900">Track an order</h2>
            <p className="mt-2 text-sm text-gray-600">Check the latest order status using your order number and phone.</p>
          </Link>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary transition-colors" href="/bulk-orders">
            <h2 className="font-bold text-lg text-slate-900">Bulk orders</h2>
            <p className="mt-2 text-sm text-gray-600">Send a retailer or wholesale enquiry.</p>
          </Link>
          <Link className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary transition-colors sm:col-span-2" href="/samples">
            <h2 className="font-bold text-lg text-slate-900">Sample requests</h2>
            <p className="mt-2 text-sm text-gray-600">Verified businesses can ask for free product samples before wholesale purchase.</p>
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
