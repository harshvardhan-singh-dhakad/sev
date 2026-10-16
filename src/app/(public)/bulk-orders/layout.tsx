import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Bulk & Wholesale Sev Orders',
  description: 'Enquire about bulk and wholesale orders for Indori sev, Ratlami sev, and other Rasvat snacks.',
  alternates: { canonical: absoluteUrl('/bulk-orders') },
};

export default function BulkOrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
