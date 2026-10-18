import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Sparkles,
  Gift,
  Truck,
  ShieldCheck,
  Heart,
  ArrowRight,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { getFestivalBySlug, listActiveFestivals, listGiftBoxes } from '@/lib/festivals';
import { listProducts } from '@/lib/catalog';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { GiftBoxCard } from '@/components/festive/GiftBoxCard';
import { CustomBoxBuilder } from '@/components/festive/CustomBoxBuilder';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);

  if (!festival) {
    return {
      title: 'Festive Gifting Hampers | Aron Bites',
      description: 'Authentic Indori Sev & Namkeen gift boxes for Indian festivals.',
    };
  }

  return {
    title: `${festival.name} | Authentic Festive Gifting Hampers | Aron Bites`,
    description: festival.description || festival.tagline,
    openGraph: {
      title: `${festival.name} - Aron Bites Gifting`,
      description: festival.tagline,
    },
  };
}

export default async function FestivalLandingPage({ params }: Props) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);

  if (!festival) {
    notFound();
  }

  // Get active catalog products for gifting hampers and custom builder
  const { products } = listProducts({ status: 'active' }, 'popular', 1, 24);
  const giftBoxes = await listGiftBoxes(festival.id, true);
  const otherFestivals = (await listActiveFestivals()).filter((f) => f.slug !== festival.slug);

  const themeColor = festival.themeColor || '#b45309';

  return (
    <PublicLayout>
      {/* Festive Hero Banner */}
      <section
        className="relative overflow-hidden text-white py-16 sm:py-24"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%)`,
        }}
      >
        {/* Decorative sparkles & lighting overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="container-site relative z-10 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 backdrop-blur-md text-amber-200 border border-white/20 mb-6">
            <Sparkles size={14} className="text-amber-300" />
            Special Festive Collection · Direct Doorstep Gifting
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {festival.name}
          </h1>

          <p className="text-lg sm:text-xl text-amber-100 font-medium leading-relaxed mb-8 max-w-2xl mx-auto italic">
            &quot;{festival.tagline}&quot;
          </p>

          {festival.description && (
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              {festival.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#gift-collection"
              className="btn btn-lg h-[52px] px-8 text-sm font-bold bg-white text-slate-900 hover:bg-amber-100 shadow-xl inline-flex items-center gap-2"
            >
              <Gift size={18} className="text-amber-600" />
              Explore Hampers
            </a>
            <a
              href="#custom-box-builder"
              className="btn btn-lg h-[52px] px-7 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl inline-flex items-center gap-2"
            >
              <Sparkles size={18} className="text-slate-950" />
              Make Your Own Box
            </a>
            <Link
              href={`/checkout?gift=1&festival=${festival.slug}`}
              className="btn btn-outline btn-lg h-[52px] px-6 text-sm font-bold border-white/30 text-white hover:bg-white/10 backdrop-blur-xs"
            >
              Send as a Gift
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Direct-to-Recipient Feature Highlights ("Bhejo Apne Naam Se") */}
      <section className="bg-amber-50/70 border-b border-amber-200/80 py-8 sm:py-10">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-amber-200/60 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Direct Recipient Shipping</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Aapko parcel ghar mangakar dobara courier karne ki zarurat nahi. Hum direct aapke doston/parivar tak pahuchayenge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-amber-200/60 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <Heart size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Free Festive Greeting Card</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Aapka personal message aur aapka naam box ke andar festive greeting card par print hokar jayega.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-amber-200/60 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Prices Hidden on Packing Slip</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gift parcel me product price nahi dikhega. Pure surprise aur samman ke saath recipient ko deliver hoga.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Festive Gift Boxes Section */}
      {giftBoxes.length > 0 && (
        <section id="gift-collection" className="container-site py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
              🎁 Exclusive Festive Hampers
            </span>
            <h2
              className="text-2xl sm:text-4xl font-black text-slate-900 mt-2.5 mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Curated {festival.name} Gift Boxes
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Complete celebratory hampers with custom festive box packaging, assorted Malwa snacks, and your personalized greeting postcard enclosed inside.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftBoxes.map((box) => (
              <GiftBoxCard key={box.id} box={box} festivalSlug={festival.slug} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Build Your Own Box / Custom Hamper Builder */}
      <CustomBoxBuilder
        products={products}
        festivalName={festival.name}
        festivalSlug={festival.slug}
      />

      {/* Individual Snack Assortments Grid */}
      <section className="container-site py-12 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Individual Snacks & Savories
          </span>
          <h2
            className="text-xl sm:text-3xl font-black text-slate-900 mt-2 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create Your Custom Assortment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Freshly prepared with pure stone-ground besan, aromatic cloves, and zero artificial preservatives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ShopProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Greeting Wishes Showcase */}
      {festival.greetingTemplates && festival.greetingTemplates.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200 py-16">
          <div className="container-site max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Personalized Wishes Inside the Box
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Aapka Sandesh, Hamara Asli Indore Swaad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {festival.greetingTemplates.map((wish, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    &quot;{wish}&quot;
                  </p>
                  <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Printable Card Template {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Upcoming Festive Collections */}
      {otherFestivals.length > 0 && (
        <section className="container-site py-16 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Other Occasions</span>
              <h3 className="text-xl font-black text-slate-900">Explore More Festive Gifting Collections</h3>
            </div>
            <Link href="/shop" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All Snacks <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {otherFestivals.map((fest) => (
              <Link
                key={fest.id}
                href={`/festive/${fest.slug}`}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {fest.religionCategory}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2 group-hover:text-primary transition">
                    {fest.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">{fest.tagline}</p>
                </div>
                <span className="mt-3 text-xs font-bold text-primary inline-flex items-center gap-1">
                  View Hampers <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
