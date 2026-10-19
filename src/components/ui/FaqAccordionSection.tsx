'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Sparkles, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItem {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answer: string;
  highlightTag?: string;
}

export interface FAQCategoryOption {
  key: string;
  label: string;
}

interface FaqAccordionSectionProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle: string;
  faqs: FAQItem[];
  categories?: FAQCategoryOption[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryLink?: { text: string; href: string };
  ctaSecondaryLink?: { text: string; href: string };
  className?: string;
  searchPlaceholder?: string;
}

export function FaqAccordionSection({
  id = 'frequently-asked-questions',
  badge = 'Knowledge Base & FAQs',
  title,
  subtitle,
  faqs,
  categories,
  ctaTitle = 'Still Have Specific Questions or Custom Requirements?',
  ctaDescription = 'Our Indore customer support and operations team is always available to assist you.',
  ctaPrimaryLink = { text: 'Contact Us', href: '/contact' },
  ctaSecondaryLink,
  className = '',
  searchPlaceholder = 'Search questions by keywords...',
}: FaqAccordionSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.highlightTag && faq.highlightTag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFaq = (faqId: string) => {
    setOpenFaqId((prev) => (prev === faqId ? null : faqId));
  };

  const categoryOptions = useMemo(() => {
    if (categories && categories.length > 0) {
      return [
        { key: 'all', label: 'All Questions', count: faqs.length },
        ...categories.map((cat) => ({
          ...cat,
          count: faqs.filter((f) => f.category === cat.key).length,
        })),
      ];
    }
    // Auto-derive categories if not explicitly passed
    const unique = Array.from(new Set(faqs.map((f) => f.category)));
    return [
      { key: 'all', label: 'All Questions', count: faqs.length },
      ...unique.map((u) => {
        const item = faqs.find((f) => f.category === u);
        return {
          key: u,
          label: item?.categoryLabel || u,
          count: faqs.filter((f) => f.category === u).length,
        };
      }),
    ];
  }, [faqs, categories]);

  return (
    <section id={id} className={cn('py-16 sm:py-20 w-full', className)} aria-labelledby={`${id}-heading`}>
      <div className="container-site max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          {badge && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full mb-3 border border-primary/20">
              {badge}
            </span>
          )}
          <h2
            id={`${id}-heading`}
            className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-11 pr-14 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-xs transition-all"
              aria-label="Search FAQs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {categoryOptions.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border',
                    selectedCategory === cat.key
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accordion Questions */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-gray-200">
            <HelpCircle className="mx-auto text-gray-400 mb-3" size={36} />
            <p className="text-base font-semibold text-gray-800">No matching questions found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try searching with different keywords or reset your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'rounded-2xl transition-all duration-200 border bg-white overflow-hidden',
                    isOpen
                      ? 'border-primary/40 shadow-sm ring-1 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 shadow-xs'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-body-${faq.id}`}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left cursor-pointer transition-colors"
                  >
                    <div className="space-y-1.5 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          #{index + 1} • {faq.categoryLabel}
                        </span>
                        {faq.highlightTag && (
                          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70 flex items-center gap-1">
                            <Sparkles size={11} /> {faq.highlightTag}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-base sm:text-lg font-bold text-gray-900 leading-snug"
                        style={{ fontFamily: 'var(--font-outfit)' }}
                      >
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300',
                        isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-body-${faq.id}`}
                      className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6 border-t border-gray-100 text-sm sm:text-base text-gray-700 leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Box */}
        {(ctaPrimaryLink || ctaSecondaryLink) && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200/80 text-center shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white mb-4 shadow-xs">
              <MessageSquare size={22} />
            </div>
            <h4
              className="text-xl sm:text-2xl font-black text-gray-900"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {ctaTitle}
            </h4>
            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl mx-auto">
              {ctaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {ctaPrimaryLink && (
                <Link
                  href={ctaPrimaryLink.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-bold text-sm shadow hover:bg-primary-dark transition cursor-pointer"
                >
                  {ctaPrimaryLink.text} <ArrowRight size={16} />
                </Link>
              )}
              {ctaSecondaryLink && (
                <Link
                  href={ctaSecondaryLink.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-6 py-3 text-gray-800 font-bold text-sm shadow-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  {ctaSecondaryLink.text}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
