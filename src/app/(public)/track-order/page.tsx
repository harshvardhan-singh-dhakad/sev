import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import TrackOrderClient from '@/components/track-order/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order | Rasvat Authentic Snacks',
  description: 'Track the real-time preparation, dispatch, and delivery status of your Rasvat order.',
  robots: {
    index: true,
    follow: true,
  },
};

interface TrackOrderPageProps {
  searchParams: Promise<{
    order?: string;
    phone?: string;
  }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { order, phone } = await searchParams;

  return (
    <PublicLayout>
      <TrackOrderClient initialOrderNumber={order || ''} initialPhone={phone || ''} />
    </PublicLayout>
  );
}
