import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Rasvat Snacks',
  description: 'How Rasvat safeguards your personal and payment data.',
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="bg-[var(--color-bg)] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[var(--color-border)] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Privacy & Data
            </span>
            <h1
              className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] mt-2 mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Privacy Policy
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] mb-8">
              Last updated: October 2026
            </p>

            <div className="space-y-6 text-sm text-[var(--color-ink)] leading-relaxed">
              <section>
                <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
                <p>
                  When you make a purchase on Rasvat, we collect essential details necessary to fulfill your order: your name, shipping address, 10-digit mobile number, and email address.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">2. How We Use Your Information</h2>
                <p>
                  Your information is strictly used for order confirmation, dispatch updates, delivery coordination via SMS/WhatsApp/email, and customer support. We do not sell, rent, or lease your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">3. Payment Security</h2>
                <p>
                  All payment transactions are encrypted using 256-bit SSL encryption and processed through PCI-DSS compliant payment gateways (Razorpay). Rasvat does not have access to or store your payment card numbers, CVVs, or UPI PINs.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">4. Questions & Privacy Requests</h2>
                <p>
                  If you wish to update or delete your personal details from our records, contact our privacy officer at <span className="font-semibold text-[var(--color-primary)]">privacy@rasvat.in</span>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
