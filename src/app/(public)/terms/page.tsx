import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | Rasvat Authentic Snacks',
  description: 'Terms and conditions governing orders, deliveries, and use of Rasvat online store.',
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
                <p>
                  All our snacks are prepared using traditional recipes from Malwa, Madhya Pradesh. All prices displayed on our website are inclusive of applicable GST (Goods and Services Tax) in Indian Rupees (INR). We reserve the right to modify prices or adjust pack sizes without prior notice. Minimum order values and shipping rules are applied at checkout.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">3. Payments & Security</h2>
                <p>
                  All online payments are securely processed through RBI-authorized payment gateways including Razorpay. We support UPI, Debit/Credit Cards, NetBanking, and authorized wallets. We never store your full payment card details or CVVs on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">4. Delivery & Logistics</h2>
                <p>
                  Orders are dispatched via trusted courier partners across India. Dispatch typically takes 24 to 48 hours from the time of order confirmation. Delivery timelines range from 2 to 5 business days for major metropolitan hubs and 4 to 7 business days for regional destinations.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">5. Contact & Support</h2>
                <p>
                  For any questions regarding orders, billing, or these terms, please reach out to our customer care team at <span className="font-semibold text-[var(--color-primary)]">support@rasvat.in</span> or call us at <span className="font-semibold text-[var(--color-primary)]">+91 98260 00000</span>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
