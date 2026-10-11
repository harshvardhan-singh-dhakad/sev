import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { getOrderByToken } from '@/lib/orders';
import OrderDetailsClient from '@/components/order/OrderDetailsClient';

interface OrderPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { token } = await params;
  const order = await getOrderByToken(token);

  return {
    title: order ? `Order ${order.order_number} | Rasvat` : 'Order Details | Rasvat',
    description: 'Track and review your Rasvat authentic Sev order status.',
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
