import { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import { listProducts } from '@/lib/catalog';
import { CustomBoxBuilder } from '@/components/festive/CustomBoxBuilder';
import { Sparkles, Gift, Truck, Heart, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Build Your Own Custom Gift Box | Aron Bites',
  description:
    'Handpick your favorite authentic Ratlami Sev, Ujjaini Hing Sev, and Indori mixtures into a personalized festive hamper. Direct doorstep delivery with personalized greeting card.',
};

export default function CustomBoxPage() {
  const { products } = listProducts({ status: 'active' }, 'popular', 1, 24);

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="container-site relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 text-amber-200 border border-white/20 mb-4">
            <Sparkles size={14} className="text-amber-300" />
            100% Customized Gifting Hampers
          </div>
          <h1
            className="text-3xl sm:text-5xl font-black mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Build Your Own Gift Box
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 max-w-xl mx-auto leading-relaxed">
            Select your preferred box size, handpick your favorite authentic Malwa namkeens from our kitchen, and add your personal message. We will pack and ship it directly in premium festive packaging!
          </p>
        </div>
      </section>

      {/* Interactive Builder */}
      <CustomBoxBuilder
        products={products}
        festivalName="Aron Bites"
        festivalSlug="custom-box"
      />
    </PublicLayout>
  );
}
