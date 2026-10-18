import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { getOrderByToken } from '@/lib/orders';
import OrderDetailsClient from './OrderDetailsClient';

interface OrderPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { token } = await params;
  const order = await getOrderByToken(token);

  return {
    title: order ? `Order ${order.order_number} | Aron Bites` : 'Order Details | Aron Bites',
    description: 'Track and review your Aron Bites authentic Sev order status.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { token } = await params;
  const order = await getOrderByToken(token);

  return (
    <PublicLayout>
      <OrderDetailsClient token={token} initialOrder={order} />
    </PublicLayout>
  );
}
