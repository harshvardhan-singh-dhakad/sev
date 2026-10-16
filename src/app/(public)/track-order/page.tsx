import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import TrackOrderClient from './TrackOrderClient';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Track Your Order | Rasvat Authentic Snacks',
  description: 'Track the real-time preparation, dispatch, and delivery status of your Rasvat order.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: { canonical: absoluteUrl('/track-order') },
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
