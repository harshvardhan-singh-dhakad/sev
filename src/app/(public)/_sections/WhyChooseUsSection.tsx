import {
  Shield,
  Package,
  Zap,
  Truck,
  Star,
  Lock,
} from 'lucide-react';

const DEFAULT_FEATURES = [
  {
    id: 'quality',
    icon: 'Shield',
    title: 'Premium Quality',
    description:
      'Only the finest gram flour and spices go into every batch of Aron Bites Sev. Uncompromising quality, every time.',
  },
  {
    id: 'fresh',
    icon: 'Zap',
    title: 'Freshly Packed',
    description:
      'Made fresh and sealed within hours. No artificial preservatives. Maximum shelf life through hygienic packaging.',
  },
  {
    id: 'hygiene',
    icon: 'Lock',
    title: 'Clear Product Information',
    description:
      'Review product and pack details on the product page before choosing what to order.',
  },
  {
    id: 'taste',
    icon: 'Star',
    title: 'Consistent Taste',
    description:
      'Our master recipe ensures every packet delivers the same authentic taste, batch after batch. No surprises.',
  },
  {
    id: 'bulk',
    icon: 'Truck',
    title: 'Reliable Bulk Supply',
    description:
      'From 10 KG to multiple quintals — we deliver on time, every time. Trusted by retailers and businesses across India.',
  },
  {
    id: 'packaging',
    icon: 'Package',
    title: 'Secure Packaging',
    description:
      'Airtight, moisture-proof packaging that preserves crunchiness and freshness from our facility to your doorstep.',
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  Shield,
  Package,
  Zap,
  Truck,
  Star,
  Lock,
};

async function getWhyChooseUsItems() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/cms/why-choose-us`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return DEFAULT_FEATURES;
    const data = await res.json();
    return data.items?.length ? data.items : DEFAULT_FEATURES;
  } catch {
    return DEFAULT_FEATURES;
  }
}

export async function WhyChooseUsSection() {
  const features = await getWhyChooseUsItems();

  return (
    <section
      className="section bg-bg-white"
      aria-labelledby="why-choose-us-heading"
    >
      <div className="container-site">
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-secondary text-ink"
          >
            Why Aron Bites
          </span>
          <h2
            id="why-choose-us-heading"
            className="section-heading"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
          >
            Why Choose Us
          </h2>
          <p className="section-subheading" style={{ color: 'var(--color-ink-muted)' }}>
            Quality, freshness and reliability — the three pillars of Aron Bites
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: typeof DEFAULT_FEATURES[0]) => {
            const Icon = ICON_MAP[feature.icon] || Shield;

            return (
              <div
                key={feature.id}
                className="group p-7 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-border bg-bg"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors bg-accent-tint text-primary"
                >
                  <Icon size={22} />
                </div>
                <h3
                  className="font-bold text-lg mb-2.5"
                  style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
