'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '@/lib/types';
import { cn } from '@/lib/utils';

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn('rounded-xl overflow-hidden transition-all duration-200 border')}
      style={{
        borderColor: open ? 'var(--color-primary)' : 'var(--color-border)',
        background: open ? 'var(--color-primary-faint)' : 'var(--color-bg-white)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-expanded={open}
        id={`faq-${faq.id}`}
      >
        <span
          className="font-semibold text-base"
          style={{
            color: open ? 'var(--color-primary-dark)' : 'var(--color-ink)',
            fontFamily: 'var(--font-outfit)',
          }}
        >
          {faq.question}
        </span>
        <span
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
          style={{
            background: open ? 'var(--color-primary-faint)' : 'var(--color-bg)',
            color: open ? 'var(--color-primary)' : 'var(--color-ink-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown size={16} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <section
      className="section"
      style={{ background: 'var(--color-bg)' }}
      aria-labelledby="faq-heading"
    >
      <div className="container-site">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-secondary text-ink"
            >
              FAQs
            </span>
            <h2
              id="faq-heading"
              className="section-heading"
              style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-ink)' }}
            >
              Frequently Asked Questions
            </h2>
            <p className="section-subheading" style={{ color: 'var(--color-ink-muted)' }}>
              Everything you need to know about Rasvat and ordering
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>
              Still have questions?
            </p>
            <Link
              href="/contact"
              className="btn btn-outline"
              style={{ color: 'var(--color-ink)' }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
