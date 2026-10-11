import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Rasvat Snacks',
  description: 'Our 100% taste and freshness guarantee and refund guidelines.',
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <div className="bg-[var(--color-bg)] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[var(--color-border)] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Quality & Trust
            </span>
            <h1
              className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] mt-2 mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] mb-8">
              Last updated: October 2026
            </p>

            <div className="space-y-6 text-sm text-[var(--color-ink)] leading-relaxed">
              <section>
                <h2 className="text-lg font-bold mb-2">1. Freshness & Quality Promise</h2>
                <p>
                  At Rasvat, every batch of Sev and Namkeen is freshly fried and packaged in food-grade, nitrogen-flushed barrier pouches to preserve authentic crunch and clove aromas. If you receive a compromised, damaged, or unsealed package, we will make it right with an immediate replacement or full refund.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">2. Order Cancellations</h2>
                <p>
                  You can request an order cancellation before your parcel is handed over to our courier partner (typically within 2 to 4 hours of placing the order). Once an order is marked as Packed or Shipped, it cannot be cancelled as fresh food products are customized and dispatched swiftly.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">3. Eligibility for Refund or Replacement</h2>
                <p>Refunds and replacements are applicable in the following situations:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Damaged or torn packaging during transit.</li>
                  <li>Incorrect variant or missing items in the parcel.</li>
                  <li>Quality concerns reported within 48 hours of delivery with photos of the batch code.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">4. Refund Processing Time</h2>
                <p>
                  Approved refunds are processed back to the original payment method (UPI, Bank Account, or Card) within 5 to 7 business days via our payment partner Razorpay. You will receive an email and SMS confirmation containing your refund reference ID.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">5. How to Initiate a Return / Claim</h2>
                <p>
                  WhatsApp or email our team at <span className="font-semibold text-[var(--color-primary)]">support@rasvat.in</span> with your Order Number (e.g. RSV-2610-00001) and photos of the package.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
