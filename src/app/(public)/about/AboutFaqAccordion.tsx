'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Sparkles, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ABOUT_FAQS, AboutFAQItem } from './faq-data';

export type { AboutFAQItem };


export function AboutFaqAccordion() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('indori-vs-regular-sev');

  const filteredFaqs = useMemo(() => {
    return ABOUT_FAQS.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.highlightTag && faq.highlightTag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const categories = [
    { key: 'all', label: 'All Questions', count: ABOUT_FAQS.length },
    { key: 'heritage', label: 'Taste & Heritage', count: ABOUT_FAQS.filter((f) => f.category === 'heritage').length },
    { key: 'quality', label: 'Ingredients & Purity', count: ABOUT_FAQS.filter((f) => f.category === 'quality').length },
    { key: 'shipping', label: 'Delivery & Shipping', count: ABOUT_FAQS.filter((f) => f.category === 'shipping').length },
    { key: 'b2b', label: 'Bulk & Gifting', count: ABOUT_FAQS.filter((f) => f.category === 'b2b').length },
  ];

  return (
    <div className="w-full">
      {/* Search and Category Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. palm oil, poha, shelf life, bulk, delivery)..."
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
            aria-label="Search FAQs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                'px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border',
                selectedCategory === cat.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-gray-200">
          <HelpCircle className="mx-auto text-gray-400 mb-3" size={36} />
          <p className="text-base font-semibold text-gray-800">No matching questions found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try searching for something else or browse all questions by clearing your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
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
                    ? 'border-primary/40 shadow-md ring-1 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left cursor-pointer transition-colors"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        #{index + 1} • {faq.categoryLabel}
                      </span>
                      {faq.highlightTag && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 flex items-center gap-1">
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
                    id={`faq-answer-${faq.id}`}
                    className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6 border-t border-gray-100"
                  >
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still Have Questions Box */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200/80 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white mb-4 shadow">
          <MessageSquare size={24} />
        </div>
        <h4 className="text-xl sm:text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-outfit)' }}>
          Have a Special Question or Custom Requirement?
        </h4>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl mx-auto">
          Our Indore customer experience team is always ready to assist with retail queries, custom festive boxes, wedding favors, and wholesale commercial supply.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-bold text-sm shadow hover:bg-primary-dark transition"
          >
            Contact Customer Support <ArrowRight size={16} />
          </Link>
          <Link
            href="/samples"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-6 py-3 text-gray-800 font-bold text-sm shadow-sm hover:bg-gray-50 transition"
          >
            Request Free B2B Samples
          </Link>
        </div>
      </div>
    </div>
  );
}
