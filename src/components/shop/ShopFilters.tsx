'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X, Check, Flame, RotateCcw } from 'lucide-react';
import { Category, SpiceLevel } from '@/lib/catalog';

interface ShopFiltersProps {
  categories: Category[];
  totalCount: number;
}

export function ShopFilters({ categories, totalCount }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentSpice = searchParams.get('spice') || 'all';

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset page when filtering
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const resetAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters = currentCategory !== 'all' || currentSpice !== 'all' || currentSort !== 'popular';

  return (
    <>
      {/* Category Chips Bar (Horizontal Scroll / Wrap) */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${
              currentCategory === 'all'
                ? 'shadow-sm text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: currentCategory === 'all' ? 'var(--color-primary)' : 'var(--color-bg-white)',
              border: `1px solid ${currentCategory === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam('category', cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isSelected ? 'shadow-sm text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-white)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bar: Filter Drawer Trigger + Sort */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-white border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-gray-800 bg-gray-50 border border-border"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="mobile-sort-select" className="text-xs text-gray-500 font-medium">
            Sort:
          </label>
          <select
            id="mobile-sort-select"
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-gray-50 border border-border text-gray-800 focus:ring-primary focus:outline-none"
          >
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Desktop Filter Sidebar (Rendered inside main layout on >=1024px) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
        <div
          className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-6 sticky top-24"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="font-bold text-sm uppercase tracking-wider text-ink flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Filter Catalog
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div>
            <label htmlFor="desktop-sort-select" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Sort By
            </label>
            <select
              id="desktop-sort-select"
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-gray-50 border border-border text-ink focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="popular">Popular (Featured first)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>

          {/* Categories Radio Group */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Categories
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1 px-1.5 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="desktop-category"
                  checked={currentCategory === 'all'}
                  onChange={() => updateParam('category', 'all')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-gray-800">All Varieties</span>
              </label>
              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1 px-1.5 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="desktop-category"
                    checked={currentCategory === cat.slug}
                    onChange={() => updateParam('category', cat.slug)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-gray-800">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Flame size={14} className="text-orange-500" />
              Spice Level
            </h3>
            <div className="space-y-1.5">
              {[
                { label: 'All Spice Levels', value: 'all' },
                { label: 'Mild (Gentle & fragrant)', value: 'mild' },
                { label: 'Medium (Balanced kick)', value: 'medium' },
                { label: 'Hot (Fiery & sharp)', value: 'hot' },
              ].map((sp) => (
                <label
                  key={sp.value}
                  className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1 px-1.5 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="desktop-spice"
                    checked={currentSpice === sp.value}
                    onChange={() => updateParam('spice', sp.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-gray-800">{sp.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer (<1024px) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Filter catalog"
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('category', 'all');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      currentCategory === 'all'
                        ? 'bg-primary-faint text-primary-dark font-bold'
                        : 'text-gray-700 bg-gray-50'
                    }`}
                  >
                    <span>All Varieties</span>
                    {currentCategory === 'all' && <Check size={14} />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        updateParam('category', cat.slug);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                        currentCategory === cat.slug
                          ? 'bg-primary-faint text-primary-dark font-bold'
                          : 'text-gray-700 bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {currentCategory === cat.slug && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-500" />
                  Spice Level
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Mild', value: 'mild' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Hot', value: 'hot' },
                  ].map((sp) => (
                    <button
                      key={sp.value}
                      type="button"
                      onClick={() => updateParam('spice', sp.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border ${
                        currentSpice === sp.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-700 border-border'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetAllFilters();
                  setDrawerOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark"
              >
                View Results ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
