import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Terms of Service | Rasvat Authentic Snacks',
  description: 'Terms and conditions governing orders, deliveries, and use of Rasvat online store.',
  alternates: { canonical: absoluteUrl('/terms') },
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-[var(--color-bg)] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[var(--color-border)] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Legal & Terms
            </span>
            <h1
              className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] mt-2 mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Terms of Service
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] mb-8">
              Last updated: October 2026
            </p>

            <div className="space-y-6 text-sm text-[var(--color-ink)] leading-relaxed">
              <section>
                <h2 className="text-lg font-bold mb-2">1. Overview & Agreement</h2>
                <p>
                  Welcome to Rasvat. By accessing our website, browsing our namkeen & sev catalog, or placing an order, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">2. Pricing, Products & Orders</h2>
                <p>Product details, prices, order minimums, and shipping charges are shown on the website and at checkout. The checkout screen shows the total before payment. We may update a listing or price; an order is placed only after payment is completed successfully.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">3. Payments & Security</h2>
                <p>
                  Online payments are processed through Razorpay. Payment options depend on the payment methods enabled for your transaction. Rasvat does not ask for your UPI PIN or card CVV outside the payment flow.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">4. Delivery & Logistics</h2>
                <p>
                  Current order minimums, shipping charges, and dispatch estimates are described in our <a className="underline" href="/shipping-policy">Shipping & Delivery Policy</a>. Delivery estimates can vary by destination and courier service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">5. Contact & Support</h2>
                <p>
                  For questions about an order or these terms, contact <a className="font-semibold text-[var(--color-primary)] underline" href="mailto:support@rasvat.in">support@rasvat.in</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
