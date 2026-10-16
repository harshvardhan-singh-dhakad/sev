import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'How to request help with a damaged, incorrect, missing, or cancelled Rasvat order.',
  alternates: { canonical: absoluteUrl('/refund-policy') },
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 max-w-4xl">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Order Support</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">Refund & Cancellation Policy</h1>
          <p className="text-sm text-gray-500 mt-3">Updated: 16 October 2026</p>
          <div className="prose max-w-none mt-8">
            <h2>Damaged, incorrect, or missing items</h2>
            <p>If an order arrives damaged, contains an incorrect item, or is missing an item, contact us as soon as reasonably possible at <a href="mailto:support@rasvat.in">support@rasvat.in</a>. Include the order number, a short description, and clear photos of the parcel and product where available. We will review the issue and explain the next steps.</p>
            <h2>Cancellation requests</h2>
            <p>Contact support promptly if you need to cancel. We will try to stop an order that has not been handed to the courier. A cancellation may no longer be possible after dispatch; contact us so we can check the order status.</p>
            <h2>Refunds</h2>
            <p>Where a refund is approved, it will be initiated to the original payment method through the payment provider. The time for the credit to appear depends on the payment method and financial institution. We will share available refund reference details after initiation.</p>
            <h2>Consumer rights</h2>
            <p>This policy does not limit any rights you have under applicable consumer-protection law.</p>
            <h2>Contact</h2>
            <p>For a return, refund, or cancellation request, email <a href="mailto:support@rasvat.in">support@rasvat.in</a> with your order number.</p>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}
