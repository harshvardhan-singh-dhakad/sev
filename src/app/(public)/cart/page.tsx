import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import CartPageContent from './CartPageContent';

export const metadata: Metadata = {
  title: 'Shopping Cart | Aron Bites',
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
