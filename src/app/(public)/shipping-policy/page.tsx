import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Aron Bites',
  description: 'Aron Bites order minimums, shipping charges, dispatch, and delivery information.',
  alternates: { canonical: absoluteUrl('/shipping-policy') },
};

export default function ShippingPolicyPage() {
  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 max-w-4xl">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Orders & Delivery</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">Shipping & Delivery Policy</h1>
          <p className="text-sm text-gray-500 mt-3">Updated: 16 October 2026</p>
          <div className="prose max-w-none mt-8">
            <h2>Order minimum and shipping charge</h2>
            <p>The current minimum online order is ₹199. Standard shipping is ₹49 for orders below ₹499; orders of ₹499 or more qualify for free standard shipping. The final charge is displayed at checkout before you pay.</p>
            <h2>Dispatch and delivery</h2>
            <p>Orders are generally prepared for dispatch within 24–48 hours after payment confirmation. Transit time depends on your address and the courier partner. The delivery estimate shown at checkout or in courier tracking is the best current estimate; delays may occur due to service disruptions, weather, or other events outside our control.</p>
            <h2>Address and delivery issues</h2>
            <p>Please check your delivery address and phone number before placing an order. If tracking shows a delivery issue, contact support with your order number. You can also use the <Link href="/track-order">order tracking page</Link>.</p>
            <h2>Contact</h2>
            <p>For shipping questions, write to <a href="mailto:support@aronbites.com">support@aronbites.com</a>.</p>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}
