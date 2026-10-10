import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';

const BULK_OPTIONS = [
  { label: '10 KG', sub: 'Bulk Tier 1' },
  { label: '25 KG', sub: 'Bulk Tier 2' },
  { label: '50 KG', sub: 'Bulk Tier 3' },
  { label: '1 Quintal', sub: 'Wholesale' },
  { label: '5 Quintal+', sub: 'Custom Quote' },
];

export function BulkOrderCTA() {
  return (
    <section
      className="section"
      style={{ background: 'var(--color-secondary)' }}
      aria-labelledby="bulk-cta-heading"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full bg-ink text-secondary"
            >
              B2B & Wholesale
            </span>
            <h2
              id="bulk-cta-heading"
              className="text-ink mb-4"
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
              }}
            >
              Need Sev in Bulk?
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: 'var(--color-ink)' }}
            >
              From 10 KG to multiple quintals, get customized pricing and reliable bulk
              supply. We work with retailers, caterers, restaurants and distributors
              across India.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {BULK_OPTIONS.map((opt) => (
                <div
                  key={opt.label}
                  className="rounded-xl px-4 py-2 text-center border border-ink/20 bg-bg-white shadow-xs"
                >
                  <p className="font-bold text-sm text-ink">{opt.label}</p>
                  <p className="text-xs text-ink-muted">{opt.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/bulk-orders"
                className="btn btn-primary btn-lg shadow-md hover:shadow-lg transition-shadow"
                id="bulk-order-cta-btn"
              >
                Request Bulk Quote
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="btn btn-lg bg-bg-white text-ink border border-border shadow-xs hover:bg-bg transition-colors font-semibold"
              >
                <Phone size={18} className="text-primary" />
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Table / visual */}
          <div>
            <div
              className="rounded-2xl p-6 sm:p-8 bg-bg-white border border-border shadow-[var(--shadow-card)]"
            >
              <h3
                className="font-bold text-ink text-xl mb-6 text-center"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
              >
                Bulk Pricing Tiers
              </h3>

              <div className="space-y-3">
                {[
                  { range: '1–5 KG', price: 'Retail Price', highlight: false },
                  { range: '10 KG', price: 'Bulk Tier 1', highlight: false },
                  { range: '25 KG', price: 'Bulk Tier 2', highlight: false },
                  { range: '50 KG', price: 'Bulk Tier 3', highlight: false },
                  { range: '100 KG+', price: 'Wholesale Rate', highlight: true },
                  { range: '500 KG+', price: 'Custom Quote', highlight: true },
                ].map((tier) => (
                  <div
                    key={tier.range}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border"
                    style={{
                      background: tier.highlight ? 'var(--color-accent-tint)' : 'transparent',
                      borderColor: tier.highlight ? 'var(--color-secondary)' : 'var(--color-border)',
                    }}
                  >
                    <span className="text-sm font-semibold text-ink">{tier.range}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: tier.highlight ? 'var(--color-primary-dark)' : 'var(--color-ink)' }}
                    >
                      {tier.price}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center mt-5" style={{ color: 'var(--color-ink-muted)' }}>
                All prices set by admin — actual pricing shown in quote
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}