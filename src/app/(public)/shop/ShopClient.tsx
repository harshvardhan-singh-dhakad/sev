'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, X } from 'lucide-react';
import { Product, ProductCategory } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';

  const updateFilters = useCallback((newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch categories if not loaded
        if (categories.length === 0) {
          const catRes = await fetch('/api/categories?status=active');
          if (catRes.ok) {
            const catData = await catRes.json();
            setCategories(catData.categories || []);
          }
        }

        // Fetch products based on current params
        let url = '/api/products?status=active';
        if (currentCategory) url += `&category=${encodeURIComponent(currentCategory)}`;
        if (currentSort) url += `&sort=${encodeURIComponent(currentSort)}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const prodRes = await fetch(url);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentCategory, currentSort, searchQuery, categories.length]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="btn btn-outline flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
        </button>
        <div className="text-sm text-gray-500">
          {products.length} Products
        </div>
      </div>

      {/* Sidebar Filters */}
      <aside
        className={`fixed inset-0 z-50 lg:static lg:z-auto bg-white lg:bg-transparent lg:w-64 flex-shrink-0 transition-transform duration-300 ${
          mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col p-5 lg:p-0">
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="font-bold text-lg">Filters</h2>
            <button onClick={() => setMobileFiltersOpen(false)} className="p-2">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8 overflow-y-auto lg:overflow-visible flex-1">
            {/* Search filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  defaultValue={searchQuery}
                  className="form-input pl-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateFilters({ q: e.currentTarget.value });
                    }
                  }}
                  onBlur={(e) => updateFilters({ q: e.target.value })}
                />
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => updateFilters({ category: null })}
                    className={`text-sm ${!currentCategory ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateFilters({ category: cat.slug })}
                      className={`text-sm text-left ${currentCategory === cat.slug ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:hidden mt-6 pt-6 border-t border-gray-100">
            <button onClick={() => setMobileFiltersOpen(false)} className="btn btn-primary w-full justify-center">
              Apply Filters
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Toolbar */}
        <div className="hidden lg:flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> products
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="form-select py-1.5 text-sm w-48"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="bestselling">Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="top_rated">Top Rated</option>
            </select>
          </div>
        </div>
        
        {/* Mobile sort (only visible when filters are closed on mobile) */}
        <div className="lg:hidden mb-6">
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="form-select w-full"
          >
             <option value="newest">Sort by: Newest Arrivals</option>
             <option value="bestselling">Sort by: Best Selling</option>
             <option value="price_asc">Sort by: Price (Low to High)</option>
             <option value="price_desc">Sort by: Price (High to Low)</option>
             <option value="top_rated">Sort by: Top Rated</option>
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any products matching your current filters.</p>
            <button
              onClick={() => updateFilters({ category: null, q: null, sort: null })}
              className="btn btn-outline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}