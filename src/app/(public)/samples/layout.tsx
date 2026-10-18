import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Request a Sev Sample | Aron Bites',
  description: 'Request information about sampling Aron Bites sev and namkeen products for your business.',
  alternates: { canonical: absoluteUrl('/samples') },
};

export default function SamplesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
