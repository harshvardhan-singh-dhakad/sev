import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Flame,
  Award,
  Heart,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package,
  Layers,
  Leaf,
  Clock,
  MapPin,
  Smile,
  Wheat,
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Our Story & Heritage | Rasvat Authentic Sev & Namkeen',
  description:
    'Discover the heritage of Rasvat. Handcrafted in Madhya Pradesh with 100% pure stone-ground chana dal besan, premium cold-pressed oil, and secret royal spice blends from Indore and Ratlam.',
};

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section
        className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-border"
        style={{
          backgroundColor: 'var(--color-bg)',
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(211, 47, 47, 0.05) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(255, 206, 27, 0.08) 0%, transparent 45%)
          `,
        }}
      >
        <div className="container-site relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Breadcrumb & Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-secondary text-ink shadow-sm">
              <Sparkles size={14} className="text-ink" />
              <span>Born in Malwa • The Heartland of Sev</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.1]"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              The Royal Crunch of <span className="text-primary">Indore & Ratlam</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              In Malwa, sev is not merely a tea-time snack — it is a morning ritual on piping-hot poha,
              the crown on every festive thali, and the soulful heartbeat of our culinary culture.
              At <strong>Rasvat</strong>, we preserve this authentic legacy with zero compromise.
            </p>

            {/* Quick Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-gray-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border shadow-xs">
                <Wheat size={15} className="text-primary" /> 100% Pure Chana Dal Besan
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border shadow-xs">
                <Leaf size={15} className="text-green-600" /> Pure Cold-Pressed Oil
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border shadow-xs">
                <ShieldCheck size={15} className="text-primary" /> Zero Palm Oil & Chemicals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Origin Story */}
      <section className="py-16 lg:py-24 bg-white border-b border-border">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Story Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <MapPin size={14} />
                <span>Our Roots & Provenance</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl font-black text-ink tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Why We Started Rasvat: Bringing Genuine Heritage Back
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Walk through the evening lanes of Sarafa Bazaar in Indore or the historic quarters of Ratlam,
                and you will inhale the heady aroma of freshly crushed cloves, Hathras hing, and golden chickpea flour
                sizzling in simmering kadhais.
              </p>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Over the decades, industrial mass manufacturers replaced stone-milled besan with cheap maida and starch fillers,
                substituted healthy groundnut oil with reused palm oils, and relied on artificial flavor enhancers.
                The true, airy crunch and lingering royal spice of Malwa was being forgotten.
              </p>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-ink space-y-2">
                <p className="font-bold text-sm text-primary">The Meaning Behind Our Name:</p>
                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;Rasvat&rdquo; (रस + वत्) in Sanskrit means <em>“overflowing with genuine flavor, nourishment, and soul.”</em> Every batch we fry honors this promise.
                </p>
              </div>
            </div>

            {/* Story Highlight Feature Card */}
            <div className="relative">
              <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-primary-faint via-white to-amber-50 border border-border shadow-lg space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">The Rasvat Standard</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">Artisanal Small Batch</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Flame size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Hand-Pressed Over Brass Jharas</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Master karigars manually press seasoned besan dough over custom perforated brass frames into bubbling oil for that signature light crunch.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Freshly Ground Hathras Hing & Laung</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        We grind whole premium cloves and pungent asafoetida minutes before dough kneading to lock in pure volatile aromatic oils.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Sealed Within Hours of Frying</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Zero warehouse aging. Packed into multilayer moisture-barrier pouches with nitrogen flush for 180 days of bakery-fresh crunch.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-all shadow-md group"
                  >
                    <span>Taste The Difference</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Pillars of Uncompromising Quality */}
      <section className="py-16 lg:py-24 bg-bg border-b border-border">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Code of Craft</span>
            <h2
              className="text-3xl sm:text-4xl font-black text-ink tracking-tight"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              The Four Pillars of Rasvat Quality
            </h2>
            <p className="text-sm text-gray-600">
              Every packet of Rasvat sev adheres to four non-negotiable craftsmanship tenets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-2xl p-6 bg-white border border-border shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Wheat size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">1. Stone-Ground Besan</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We select whole Desi chana dal sourced directly from MP farmers, slow-milled to retain natural fiber, protein, and aroma. Zero maida, zero starch dilution.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl p-6 bg-white border border-border shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <Flame size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">2. Single-Batch Pure Oil</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Fried exclusively in fresh groundnut and mustard oil. We never reuse oil across shifts, ensuring zero harmful trans fats, no oily aftertaste, and clean digestion.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl p-6 bg-white border border-border shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-faint text-primary flex items-center justify-center">
                <Award size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">3. Whole Royal Spices</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Real clove buds (laung), aromatic hing, Malabar black pepper, and carom seeds (ajwain). No synthetic oleoresins or chemical flavor powders.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl p-6 bg-white border border-border shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">4. FSSAI & Food Safety</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Produced in a state-of-the-art hygienic facility adhering to rigorous FSSAI standards. Stainless steel processing, food-grade contact surfaces, and airlock sealing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparison Table: Rasvat vs. Commercial Mass-Market Sev */}
      <section className="py-16 lg:py-24 bg-white border-b border-border">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Uncompromising Honesty</span>
            <h2
              className="text-3xl sm:text-4xl font-black text-ink tracking-tight"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Rasvat vs. Commercial Mass-Market Sev
            </h2>
            <p className="text-sm text-gray-600">
              See what goes into your daily bowl and why authentic ingredients make all the difference.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-border text-gray-700 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Attribute</th>
                  <th className="py-4 px-4 sm:px-6 bg-red-50/60 text-primary border-x border-border">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={16} /> Rasvat Authentic Sev
                    </span>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-gray-500">Commercial Mass Brands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-4 px-4 sm:px-6 font-bold text-gray-800">Primary Flour</td>
                  <td className="py-4 px-4 sm:px-6 bg-red-50/30 border-x border-border font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 size={16} className="shrink-0" /> 100% Pure Chana Dal Besan
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircle size={16} className="shrink-0 text-red-400" /> Diluted with Maida & Starches
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-6 font-bold text-gray-800">Cooking Oil</td>
                  <td className="py-4 px-4 sm:px-6 bg-red-50/30 border-x border-border font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 size={16} className="shrink-0" /> Single-batch Groundnut / Mustard Oil
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircle size={16} className="shrink-0 text-red-400" /> Repeatedly heated Palm Oil
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-6 font-bold text-gray-800">Spices & Aromatics</td>
                  <td className="py-4 px-4 sm:px-6 bg-red-50/30 border-x border-border font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 size={16} className="shrink-0" /> Fresh Hathras Hing, Real Cloves & Ajwain
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircle size={16} className="shrink-0 text-red-400" /> Synthetic Oleoresins & MSG
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-6 font-bold text-gray-800">Production Scale</td>
                  <td className="py-4 px-4 sm:px-6 bg-red-50/30 border-x border-border font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 size={16} className="shrink-0" /> Small artisanal batches weekly
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircle size={16} className="shrink-0 text-red-400" /> Mega-factories stored for months
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-6 font-bold text-gray-800">Texture & Aftertaste</td>
                  <td className="py-4 px-4 sm:px-6 bg-red-50/30 border-x border-border font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 size={16} className="shrink-0" /> Light melt-in-mouth crunch, zero grease
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircle size={16} className="shrink-0 text-red-400" /> Dense, hard bite, oily film on palate
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Proven Impact & Numbers */}
      <section className="py-16 bg-bg border-b border-border">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">50K+</span>
              <p className="text-xs sm:text-sm font-bold text-gray-700">Packs Delivered</p>
              <p className="text-[11px] text-gray-500">Across 24 Indian states</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">8</span>
              <p className="text-xs sm:text-sm font-bold text-gray-700">Authentic Recipes</p>
              <p className="text-[11px] text-gray-500">From Indori to Ratlami</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">100%</span>
              <p className="text-xs sm:text-sm font-bold text-gray-700">Pure Chana Dal</p>
              <p className="text-[11px] text-gray-500">Zero maida guarantee</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight">4.9 ★</span>
              <p className="text-xs sm:text-sm font-bold text-gray-700">Customer Rating</p>
              <p className="text-[11px] text-gray-500">Over 3,000+ verified reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Signature Flavors Teaser */}
      <section className="py-16 lg:py-24 bg-white border-b border-border">
        <div className="container-site">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Signature Varieties</span>
              <h2
                className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Our Master Sev Portfolio
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-dark transition-colors self-start sm:self-auto"
            >
              <span>Explore All in Shop</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Indori Sev */}
            <div className="rounded-2xl p-6 bg-bg border border-border hover:border-primary/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary">Indore Specialty</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Mild Spice</span>
              </div>
              <h3 className="text-lg font-bold text-ink">Classic Indori Sev</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The golden crown of Indore street food. Mildly spiced with ajwain and subtle hing. Essential topping for poha and chaat.
              </p>
              <Link
                href="/shop?category=indori-sev"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>View Indori Sev</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 2: Ratlami Sev */}
            <div className="rounded-2xl p-6 bg-bg border border-border hover:border-primary/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary">Ratlam Heritage</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Medium-Hot</span>
              </div>
              <h3 className="text-lg font-bold text-ink">Spicy Ratlami Sev</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The legendary 200-year-old recipe infused with whole crushed black pepper, cloves, and pungent hing. A fiery burst of authentic Malwa heat.
              </p>
              <Link
                href="/shop?category=ratlami-sev"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>View Ratlami Sev</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 3: Nylon Sev */}
            <div className="rounded-2xl p-6 bg-bg border border-border hover:border-primary/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary">Extra Fine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Mild Spice</span>
              </div>
              <h3 className="text-lg font-bold text-ink">Crispy Nylon Sev</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Micro-thin, feather-light strands that melt on the tongue. Ideal for sev puri, dahi puri, bhel, and delicate garnishes.
              </p>
              <Link
                href="/shop?category=nylon-sev"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>View Nylon Sev</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-16 lg:py-24 bg-bg text-center">
        <div className="container-site max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary-faint text-primary-dark">
            <Heart size={14} className="text-primary" />
            <span>Taste The Pure Malwa Tradition</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Ready to Experience Genuine Sev?
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Order a fresh retail pack for your home, request a free tasting sample for your business,
            or partner with us for bulk commercial supply across India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-all shadow-md group"
            >
              <span>Explore Shop</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/bulk-orders"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-gray-50 text-gray-800 border border-border transition-colors shadow-xs"
            >
              <Package size={16} />
              <span>Bulk & Corporate Orders</span>
            </Link>

            <Link
              href="/samples"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary-dark text-ink transition-colors shadow-xs"
            >
              <Sparkles size={16} />
              <span>Request Free Sample</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
