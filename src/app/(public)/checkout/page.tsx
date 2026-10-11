import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import CheckoutPageContent from '@/components/checkout/CheckoutPageContent';

export const metadata: Metadata = {
  title: 'Secure Checkout | Rasvat Authentic Snacks',
  description: 'Complete your authentic Indian snacks and Sev order with fast doorstep delivery.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <PublicLayout>
      <CheckoutPageContent />
    </PublicLayout>
  );
}
