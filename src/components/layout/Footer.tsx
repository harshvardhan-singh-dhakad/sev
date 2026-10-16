'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const FOOTER_LINKS = {
  shop: [
    { label: 'All Sev', href: '/shop' },
    { label: 'Indori Sev', href: '/shop?category=indori-sev' },
    { label: 'Ratlami Sev', href: '/shop?category=ratlami-sev' },
    { label: 'Nylon Sev', href: '/shop?category=nylon-sev' },
    { label: 'Premium Sev', href: '/shop?category=premium-sev' },
  ],
  support: [
    { label: 'Track Order', href: '/track-order' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Contact Us', href: '/contact' },
  ],
  company: [
    { label: 'About Rasvat', href: '/about' },
    { label: 'Bulk Orders', href: '/bulk-orders' },
    { label: 'Request Sample', href: '/samples' },
  ],
};

export function Footer() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className="text-black pt-16 pb-12 w-full"
      style={{ backgroundColor: 'var(--color-secondary, #FFCE1B)' }}
    >
      <div className="container-site">
        {/* Desktop 12-col grid: Left 1-5, Col 6 gap, Right 7-12 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start mb-16">
          {/* Left: Brand, Tagline, Newsletter, Social (cols 1-5) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-md w-fit"
              aria-label="Rasvat Home"
            >
              <span
                className="text-4xl font-extrabold tracking-tight leading-none text-[#111827]"
                style={{ fontFamily: 'var(--font-outfit)', letterSpacing: '-0.02em' }}
              >
                Rasvat<span style={{ color: 'var(--color-primary-dark, #B71C1C)' }}>.</span>
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-black text-sm leading-relaxed mt-4 mb-6 max-w-sm">
              The authentic taste of India, delivered fresh to your doorstep. Premium quality, unmatched crunch.
            </p>

            {/* Newsletter is hidden until a real consent and delivery provider is configured. */}
            <div className="w-full max-w-sm">
              <p className="text-sm font-semibold">Need help with an order?</p>
              <Link href="/contact" className="mt-2 inline-block underline text-sm">Contact Rasvat support</Link>
            </div>

            {/* Social links will be added after real Rasvat profiles are provided. */}
          </div>

          {/* Spacer Column 6 for clean spacing on desktop */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Right: Three Equal Link Columns (cols 7-12) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 items-start">
            {/* Shop Column */}
            <div>
              <h3
                className="font-bold text-lg mb-5 text-[#B71C1C] font-[var(--font-outfit)] leading-tight"
                style={{ color: 'var(--color-primary-dark, #B71C1C)' }}
              >
                Shop
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-black hover:text-black/70 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h3
                className="font-bold text-lg mb-5 text-[#B71C1C] font-[var(--font-outfit)] leading-tight"
                style={{ color: 'var(--color-primary-dark, #B71C1C)' }}
              >
                Support
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-black hover:text-black/70 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3
                className="font-bold text-lg mb-5 text-[#B71C1C] font-[var(--font-outfit)] leading-tight"
                style={{ color: 'var(--color-primary-dark, #B71C1C)' }}
              >
                Company
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-black hover:text-black/70 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: 1px divider, 24px top padding, copyright left, legal right */}
        <div className="pt-6 border-t border-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-black">
          <p>
            &copy; {year} Rasvat. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-black hover:text-black/70 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-black hover:text-black/70 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
