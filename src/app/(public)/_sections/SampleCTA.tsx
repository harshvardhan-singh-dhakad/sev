import Link from 'next/link';
import { ArrowRight, Package, CheckCircle } from 'lucide-react';

export function SampleCTA() {
  return (
    <section
      className="py-14 lg:py-20"
      style={{ background: 'var(--color-bg)' }}
      aria-labelledby="sample-cta-heading"
    >
      <div className="container-site">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* 64px, 16px-radius Tile in normal flow */}
          <div
            className="w-16 h-16 rounded-[16px] flex items-center justify-center bg-accent-tint text-primary border border-secondary shrink-0"
            style={{ marginBottom: '20px' }}
            aria-hidden="true"
          >
            <Package size={30} aria-hidden="true" />
          </div>

          {/* Badge */}
          <span
            className="inline-block font-bold uppercase rounded-full"
            style={{
              fontSize: '12px',
              letterSpacing: '0.08em',
              padding: '6px 14px',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-ink)',
              marginBottom: '12px',
            }}
          >
            Try Before You Buy
          </span>

          {/* H2 */}
          <h2
            id="sample-cta-heading"
            className="font-bold text-center"
            style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              marginBottom: '16px',
              lineHeight: 1.25,
            }}
          >
            Want to Taste Before You Order?
          </h2>

          {/* Paragraph */}
          <p
            className="text-center"
            style={{
              color: 'var(--color-ink-muted)',
              maxWidth: '560px',
              margin: '0 auto 32px',
              fontSize: '18px',
              lineHeight: 1.6,
            }}
          >
            Request a sample and experience our Sev before placing your bulk order.
            Perfect for retailers, caterers and distributors.
          </p>

          {/* Checklist: 4 across >=1024px, 2x2 at 640-1023px, 1 col <640px */}
          <div
            className="w-full max-w-[880px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-6 justify-center"
            style={{ marginBottom: '32px' }}
          >
            {[
              'No commitment required',
              'Multiple variants available',
              'Delivered to your doorstep',
              'For bulk buyers only',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-center sm:justify-start lg:justify-center gap-2"
              >
                <CheckCircle size={16} className="text-primary shrink-0" aria-hidden="true" />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Button: 52px tall, 28px padding, full width below 640px */}
          <div className="w-full sm:w-auto flex justify-center">
            <Link
              href="/samples"
              className="btn btn-primary inline-flex items-center justify-center shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
              style={{
                height: '52px',
                padding: '0 28px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
              }}
              id="sample-cta-btn"
            >
              Get a Free Sample
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          {/* Footnote */}
          <p
            className="text-center"
            style={{
              fontSize: '13px',
              marginTop: '16px',
              color: 'var(--color-ink-muted)',
            }}
          >
            Sample requests are reviewed within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
}