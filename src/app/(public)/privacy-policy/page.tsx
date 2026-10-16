import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Rasvat uses and protects account, order, and payment-related information.',
  alternates: { canonical: absoluteUrl('/privacy-policy') },
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <main className="container-site py-12 sm:py-16 max-w-4xl">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Privacy & Data</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-3">Updated: 16 October 2026</p>
          <div className="prose max-w-none mt-8">
            <p>This policy describes information handled when you browse Rasvat, create or use an account, place an order, or contact us.</p>
            <h2>Information we use</h2>
            <p>Depending on how you use the site, this can include account identifiers from email or Google sign-in; your name, email address, phone number, delivery address and order details; and payment status and transaction identifiers returned by Razorpay. Do not send us your UPI PIN, card CVV, or password by email or chat.</p>
            <h2>Why we use it</h2>
            <p>We use information to sign you in, take and fulfil orders, coordinate delivery, provide order support, prevent payment fraud, and meet applicable record-keeping obligations. We do not use a newsletter signup on this site at this time.</p>
            <h2>Service providers</h2>
            <p>The site uses Firebase Authentication for sign-in, Razorpay to process payments, and Cloudflare services (including Workers, D1, and R2) to run the website and store operational data such as order records and uploaded media. These providers process information to provide their services.</p>
            <h2>Retention and requests</h2>
            <p>We retain information for as long as needed to provide the service, resolve issues, and meet applicable legal or accounting obligations. To ask about access, correction, deletion, or another privacy concern, email <a href="mailto:support@rasvat.in">support@rasvat.in</a> and include enough detail for us to identify your request. Some records may need to be retained where law requires it.</p>
            <h2>Security</h2>
            <p>We use access controls and service-provider security features to protect information. No internet service can promise that transmission or storage is completely risk-free.</p>
            <h2>Policy changes</h2>
            <p>We will update this page when our data practices materially change and show the date of the latest update above.</p>
          </div>
        </article>
      </main>
    </PublicLayout>
  );
}
