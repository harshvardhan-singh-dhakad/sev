'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  shop: [
    { label: 'All Sev', href: '/shop' },
    { label: 'Indori Sev', href: '/shop?category=indori-sev' },
    { label: 'Ratlami Sev', href: '/shop?category=ratlami-sev' },
    { label: 'Nylon Sev', href: '/shop?category=nylon-sev' },
    { label: 'Premium Sev', href: '/shop?category=premium-sev' },
  ],
  support: [
    { label: 'Track Order', href: '/account' },
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
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    // Existing submit behavior preserved without adding extra backend
    setStatus('success');
    setEmail('');
  };

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

            {/* Newsletter Form */}
            <div className="w-full max-w-sm">
              <label
                htmlFor="footer-newsletter-email"
                className="block text-sm font-semibold mb-2 text-black"
              >
                Sign up for our newsletter
              </label>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex items-center h-[44px] border-b-2 border-black/40 focus-within:border-black transition-colors"
              >
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="Enter your email"
                  required
                  className="bg-transparent border-none outline-none text-black placeholder:text-black/60 flex-1 text-sm h-full px-1"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-[44px] h-[44px] flex items-center justify-center text-black hover:text-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded flex-shrink-0"
                >
                  <ArrowRight size={20} />
                </button>
              </form>
              {status === 'success' && (
                <p className="text-xs font-semibold text-green-900 mt-2">
                  Thank you for subscribing!
                </p>
              )}
              {status === 'error' && (
                <p className="text-xs font-semibold text-red-900 mt-2">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Social Icons: 24px below newsletter, 16px gap, 40px hit area */}
            <div className="flex items-center gap-4 mt-6">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-black hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-black hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-black hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label="X"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-black hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
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