import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import { absoluteUrl } from '@/lib/site-url';
import { AboutFaqAccordion } from './AboutFaqAccordion';
import { ABOUT_FAQS } from './faq-data';
import {
  Award,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  CheckCircle2,
  HeartHandshake,
  Store,
  Layers,
  ArrowRight,
  MapPin,
  UtensilsCrossed,
  PackageCheck,
  Clock,
  Wheat,
  Droplets,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Aron Bites — Authentic Indori & Ratlami Sev Handcrafted in Indore',
  description:
    'Discover the story of Aron Bites. Handcrafted in Indore, Madhya Pradesh — the snack capital of India. Made from 100% pure Chana Dal besan, cold-pressed oils, zero palm oil, and authentic Malwa spices. Fresh kadhai-to-doorstep delivery across India.',
  keywords: [
    'About Aron Bites',
    'Aron Bites story',
    'authentic Indori Sev',
    'Ratlami Sev manufacturer',
    'Malwa namkeen online',
    'pure besan sev',
    'chemical free namkeen',
    'best sev in Indore',
    'wholesale namkeen supplier India',
    'buy Indori sev online',
  ],
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    title: 'About Aron Bites — Authentic Indori & Ratlami Sev Handcrafted in Indore',
    description:
      'From the sizzling kadhais of Indore to your dining table: 100% pure besan, zero palm oil, authentic Malwa spices, and fresh doorstep delivery across India.',
    url: absoluteUrl('/about'),
    type: 'website',
    images: [
      {
        url: absoluteUrl('/hero-sev.jpg'),
        width: 1200,
        height: 630,
        alt: 'Aron Bites Authentic Indori Sev and Malwa Namkeen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Aron Bites — Authentic Indori & Ratlami Sev Handcrafted in Indore',
    description:
      'Discover how Aron Bites preserves Indore’s culinary legacy with pure besan, zero palm oil, and authentic kadhai crunch.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': absoluteUrl('/about#webpage'),
        url: absoluteUrl('/about'),
        name: 'About Aron Bites — Authentic Indori & Ratlami Sev Handcrafted in Indore',
        description:
          'Comprehensive brand story, quality standards, authentic recipes, and manufacturing philosophy of Aron Bites, premier namkeen brand from Indore, Madhya Pradesh.',
        inLanguage: 'en-IN',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: absoluteUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'About Us',
              item: absoluteUrl('/about'),
            },
          ],
        },
        mainEntity: {
          '@type': 'Organization',
          '@id': absoluteUrl('/#organization'),
          name: 'Aron Bites',
          alternateName: ['AronBites', 'Aron Bites Authentic Sev'],
          url: absoluteUrl('/'),
          logo: absoluteUrl('/images/aronbites-logo.svg'),
          foundingLocation: {
            '@type': 'Place',
            name: 'Indore, Madhya Pradesh, India',
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Indore',
            addressLocality: 'Indore',
            addressRegion: 'Madhya Pradesh',
            postalCode: '452001',
            addressCountry: 'IN',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91 62678 47718',
            contactType: 'customer service',
            email: 'support@aronbites.com',
            areaServed: 'IN',
            availableLanguage: ['en', 'hi'],
          },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': absoluteUrl('/about#faq'),
        mainEntity: ABOUT_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <PublicLayout>
      {/* Schema.org JSON-LD for AI Search Engines & Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article className="w-full bg-[#F8FAFC] pb-24">
        {/* =========================================================================
            HERO SECTION: High-impact brand statement & story hook
           ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-[#F8FAFC] pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-gray-200/70">
          <div className="container-site max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              {/* Origin Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 shadow-xs border border-primary/20">
                <MapPin size={15} className="text-primary animate-pulse" />
                Handcrafted in Indore, MP • The Snack Capital of India
              </div>

              {/* Main Headline */}
              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                We Didn’t Just Make Sev.{' '}
                <span className="text-primary block mt-1 sm:mt-2">
                  We Preserved the Soul of Indore’s Golden Kadhai.
                </span>
              </h1>

              {/* Lead Copy */}
              <p className="text-base sm:text-xl text-gray-700 mt-6 leading-relaxed max-w-2xl mx-auto font-normal">
                From the buzzing night aromas of Sarafa Bazaar and Chhappan Dukan straight to your
                doorstep. Handcrafted with 100% pure Chana Dal besan, cold-pressed oils, and generational
                Malwa spices. <strong>Zero palm oil. Zero chemical preservatives. Pure, unapologetic crunch.</strong>
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8 sm:mt-10">
                <Link
                  href="/shop"
                  className="rounded-xl bg-primary px-7 py-3.5 text-white font-bold text-sm sm:text-base shadow-md hover:bg-primary-dark transition-all transform hover:-translate-y-0.5"
                >
                  Taste Our Signature Sev
                </Link>
                <Link
                  href="/bulk-orders"
                  className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-gray-800 font-bold text-sm sm:text-base shadow-xs hover:bg-gray-50 transition-all"
                >
                  Wholesale & Bulk Supply
                </Link>
                <Link
                  href="/samples"
                  className="rounded-xl border border-primary/30 bg-primary/5 px-6 py-3.5 text-primary font-bold text-sm sm:text-base hover:bg-primary/10 transition-all"
                >
                  Request Sample Box
                </Link>
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14 pt-10 border-t border-gray-200/80 max-w-4xl mx-auto text-center">
              <div className="p-4 rounded-2xl bg-white/80 border border-gray-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-primary">100% Pure</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
                  Chana Dal Besan (Zero Maida)
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-gray-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-primary">0% Palm Oil</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
                  No Recycled or Burnt Oils
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-gray-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-primary">19,000+</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
                  Pan-India Pincodes Covered
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-gray-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-primary">4–6 Months</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
                  Moisture-Lock Crispness
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 1: The Indore Story — Why Sev is an Emotion, Not Just a Snack
           ========================================================================= */}
        <section className="py-16 sm:py-20 border-b border-gray-200/70 bg-white">
          <div className="container-site max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                  The Malwa Heritage
                </span>
                <h2
                  className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
                  style={{ fontFamily: 'var(--font-outfit)' }}
                >
                  In Indore, Mornings Don’t Begin With Coffee.{' '}
                  <span className="text-primary block mt-1">
                    They Begin With Steaming Poha Crowned in Golden Sev.
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  To understand <strong>Aron Bites</strong>, you first have to understand Indore. In our city,
                  namkeen isn’t a casual snack tucked away in an office drawer; it is a sacred culinary heritage.
                  Ask any Indori who travels anywhere across India—their bag always contains packets of Sev to
                  sprinkle over breakfast, lunch, and dinner.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  For centuries, the fertile black soil of the Malwa plateau, the dry central Indian climate,
                  and generational spice blending under the royal patronage of the Holkar dynasty cultivated
                  the most refined namkeen tradition in South Asia. From the midnight feast at the historic
                  <strong> Sarafa Bazaar</strong> to the legendary morning counters of <strong>Chhappan Dukan</strong>,
                  Sev is woven into our identity.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-sm text-amber-900 leading-relaxed font-medium">
                  💡 <em>“In Indore, we say food is incomplete without three things: Swad (taste), Prem (love),
                  and Sev ki Chhan-Chhan (the unmistakable crisp sound of fresh sev).”</em>
                </div>
              </div>

              {/* Visual Card / Highlights */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 p-6 sm:p-8 border border-amber-200/70 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                      <UtensilsCrossed size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">The Indori Taste Terroir</h3>
                      <p className="text-xs text-gray-500">Unmatched central Indian craftsmanship</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Stone-Ground Chana Dal:</strong> Freshly milled besan produces light, porous dough that fries feather-light.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Aromatic Hathras Hing:</strong> Authentic compound asafoetida with an unmistakable digestive fragrance.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Malwi Whole Cloves (Laung):</strong> Ground coarse to give Ratlami Sev its legendary warm kick.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Hand-Pressed Iron Kadhais:</strong> Cast-iron deep fryers managed by master Karigars with decades of instinct.</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark uppercase tracking-wider"
                    >
                      Browse Authentic Indore Varieties <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 2: The Aron Bites Rebellion — Why We Started
           ========================================================================= */}
        <section className="py-16 sm:py-20 border-b border-gray-200/70 bg-[#F8FAFC]">
          <div className="container-site max-w-5xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                The Aron Bites Mission
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Why Settle for Stale Factory Packets When You Can Taste Pure Kadhai Freshness?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed">
                Walk into any modern supermarket or convenience store in India, and you’ll find aisles stacked
                with mass-produced namkeen. But look closely at the ingredient labels, and you will uncover an
                uncomfortable truth.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Ordinary Factory Namkeen */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 border border-red-200/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  The Mass-Market Shortcut
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-red-500">✕</span> Ordinary Commercial Namkeen
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span><strong>Cheap Palm Oil:</strong> High in saturated fats, leaves a heavy greasy film in your throat and dulls natural spice aromas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span><strong>Maida & Starch Dilution:</strong> Dilutes expensive besan with wheat flour or potato starch, turning sev brittle or chewy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span><strong>Cold Warehouse Stagnation:</strong> Sits on distributor shelves for months before reaching your pantry, smelling of oxidized oil.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span><strong>Synthetic Flavors & Colors:</strong> Artificial capsicum extract and yellow food dyes substituted for authentic stone-ground spices.</span>
                  </li>
                </ul>
              </div>

              {/* The Aron Bites Standard */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50/70 to-white p-6 sm:p-8 border-2 border-emerald-500/30 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  The Aron Bites Standard
                </div>
                <h3 className="text-lg font-bold text-emerald-950 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Authentic Aron Bites Craft
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>100% Pure Chana Dal Besan:</strong> Milled from high-protein chickpeas for genuine nutty flavor and airy crunch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>Pure Edible Oils Only:</strong> Zero palm oil. Strictly fresh, high-smoke-point oils never reheated or burnt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>Fresh Batch Dispatch:</strong> Fried in small artisanal batches in Indore and dispatched within 24–48 hours across India.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>Whole Natural Spices:</strong> Handpicked whole cloves, Hathras hing, and Malwi ajwain for true medicinal aromatics.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 3: The 5 Non-Negotiable Pillars of Purity
           ========================================================================= */}
        <section className="py-16 sm:py-20 border-b border-gray-200/70 bg-white">
          <div className="container-site max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Our Food Manifesto
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                The 5 Uncompromising Pillars of Aron Bites
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
                Every single packet of Aron Bites that leaves our Indore production center is governed by five
                sacred culinary rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {/* Pillar 1 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200/80 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base mb-4">
                    <Wheat size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">1. 100% Chana Dal Besan</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    No maida. No potato starch. No low-grade pulse blends. We mill grade-A chickpeas to exact
                    micrometric granularity.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-primary mt-4 pt-3 border-t border-gray-200">
                  Zero Adulteration
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200/80 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-base mb-4">
                    <Droplets size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">2. Zero Palm Oil</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    We fry solely in fresh, high-smoke-point edible oils. We never reuse burnt frying oil,
                    eliminating harmful trans-fats.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-primary mt-4 pt-3 border-t border-gray-200">
                  Clean Healthy Fats
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200/80 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-base mb-4">
                    <Flame size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">3. Whole Ground Spices</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Crushed southern cloves (laung), pungent Hathras asafoetida (hing), and Malwi ajwain deliver
                    fragrant, natural warmth.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-primary mt-4 pt-3 border-t border-gray-200">
                  Generational Aromatics
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200/80 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base mb-4">
                    <Award size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">4. Karigar Craftsmanship</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Hand-pressed through traditional brass and iron jharis. Real human skill that senses dough
                    elasticity and kadhai heat.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-primary mt-4 pt-3 border-t border-gray-200">
                  Artisanal Heritage
                </div>
              </div>

              {/* Pillar 5 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200/80 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">5. Nitrogen-Flushed Lock</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Packed inside multi-layer metalized barrier pouches with nitrogen flush to preserve maximum
                    crunch for 4–6 months.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-primary mt-4 pt-3 border-t border-gray-200">
                  Zero Preservatives
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 4: The Signature Sev Portfolio (Topical Authority)
           ========================================================================= */}
        <section className="py-16 sm:py-20 border-b border-gray-200/70 bg-[#F8FAFC]">
          <div className="container-site max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                The Aron Bites Collection
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                A Sev Variety for Every Mood, Dish, & Celebration
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
                Explore our signature varieties, each masterfully balanced with distinct cuts, spice ratios,
                and crispness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Indori Ujjaini Sev */}
              <div className="rounded-3xl bg-white p-6 border border-gray-200/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
                    The Poha Soulmate
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Indori Ujjaini Sev</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Mild-to-medium spiced, fragrant with pure Hathras hing and ajwain. Light, airy, and designed
                    specifically to melt softly on hot Indori Poha, Sev Usal, and daily tea.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 mt-2"
                >
                  Order Indori Sev <ArrowRight size={13} />
                </Link>
              </div>

              {/* Ratlami Laung Sev */}
              <div className="rounded-3xl bg-white p-6 border border-gray-200/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60 inline-block mb-3">
                    The Royal Legend
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ratlami Laung Sev</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Thick-cut, assertive, and boldly infused with coarse ground whole cloves (laung) and black pepper.
                    The undisputed king of Malwa namkeen that makes world-famous Sev Tamatar sabzi.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 mt-2"
                >
                  Order Ratlami Sev <ArrowRight size={13} />
                </Link>
              </div>

              {/* Superfine Nylon Sev */}
              <div className="rounded-3xl bg-white p-6 border border-gray-200/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                    The Chaat Essential
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Superfine Nylon Sev</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Feather-light, delicate golden threads with neutral seasonings. An essential topper for Sev
                    Puri, Bhel Puri, Dahi Vada, Papdi Chaat, and party appetizers.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 mt-2"
                >
                  Order Nylon Sev <ArrowRight size={13} />
                </Link>
              </div>

              {/* Garlic (Lehsun) Sev */}
              <div className="rounded-3xl bg-white p-6 border border-gray-200/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 inline-block mb-3">
                    The Savory Punch
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Roasted Garlic Sev</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    Slow-roasted garlic paste combined with stone-ground red chili and pure besan. Rich, savory,
                    addictive crunch for evening snacks and party platters.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 mt-2"
                >
                  Order Garlic Sev <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 5: Nationwide Mission & B2B Wholesale Power
           ========================================================================= */}
        <section className="py-16 sm:py-20 border-b border-gray-200/70 bg-white">
          <div className="container-site max-w-5xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-950 to-red-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full inline-block">
                    Pan-India B2C & B2B Fulfillment
                  </span>
                  <h2
                    className="text-2xl sm:text-4xl font-black text-white leading-tight"
                    style={{ fontFamily: 'var(--font-outfit)' }}
                  >
                    Supplying Authentic Malwa Taste to Homes, Halwais, & HORECA Across India
                  </h2>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Whether you are a family in Kerala wanting 500g of crisp Ratlami Sev, a corporate firm in
                    Gurugram seeking 1,000 Diwali gift hampers, or a cloud kitchen chain in Bengaluru ordering
                    100 KG monthly bulk supply—Aron Bites has the logistical muscle and culinary consistency to deliver.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/bulk-orders"
                      className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary-dark transition"
                    >
                      Explore Wholesale Tiers (10 KG–500 KG+)
                    </Link>
                    <Link
                      href="/samples"
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition"
                    >
                      Request B2B Sample Box
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                  <Truck size={36} className="text-amber-400 mx-auto" />
                  <h3 className="font-bold text-base text-white">Express Pan-India Logistics</h3>
                  <p className="text-xs text-gray-300">
                    Dispatched from our Indore dispatch hub within 24–48 hours. Live tracking via SMS & WhatsApp.
                  </p>
                  <div className="text-xs font-semibold text-amber-300 bg-amber-400/10 py-1.5 px-3 rounded-lg border border-amber-400/20">
                    Free Pan-India Delivery on ₹499+
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 6: AI & Search Engine Optimized FAQs (16 Questions)
           ========================================================================= */}
        <section
          id="frequently-asked-questions"
          className="py-16 sm:py-24 bg-[#F8FAFC]"
          aria-labelledby="faq-section-heading"
        >
          <div className="container-site max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Everything You Need to Know
              </span>
              <h2
                id="faq-section-heading"
                className="text-2xl sm:text-4xl font-black text-gray-900 mt-3 leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
                Comprehensive answers about authentic Indore Sev, pure ingredients, shelf life, bulk wholesale,
                custom gifting, and pan-India shipping.
              </p>
            </div>

            {/* Interactive Client-Side FAQ Accordion with Category Pills & Instant Search */}
            <AboutFaqAccordion />
          </div>
        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION: Bring authentic Indore taste home
           ========================================================================= */}
        <section className="container-site max-w-5xl mx-auto px-4 sm:px-6 pt-10">
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-red-950 text-white p-8 sm:p-14 text-center shadow-lg relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} /> Ready for Authentic Malwa Crunch?
            </div>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Taste the True Kadhais of Indore at Your Table.
            </h2>
            <p className="text-sm sm:text-lg text-white/90 mt-4 max-w-xl mx-auto leading-relaxed">
              Join thousands of namkeen lovers across India who refuse to compromise on purity. Order your
              freshly fried pack today!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              <Link
                href="/shop"
                className="rounded-xl bg-white px-8 py-4 text-primary font-bold text-sm sm:text-base shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-0.5"
              >
                Shop All Sev Varieties
              </Link>
              <Link
                href="/bulk-orders"
                className="rounded-xl bg-transparent border-2 border-white px-7 py-3.5 text-white font-bold text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                Bulk & Wholesale Quote
              </Link>
            </div>
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
