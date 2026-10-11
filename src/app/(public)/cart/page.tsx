import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import CartPageContent from '@/components/cart/CartPageContent';

export const metadata: Metadata = {
  title: 'Shopping Cart | Rasvat Authentic Snacks',
  description: 'Review your selected authentic Ratlami and Indori Sev items before checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <PublicLayout>
      <CartPageContent />
    </PublicLayout>
  );
}
