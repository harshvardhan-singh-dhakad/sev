'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
  UtensilsCrossed,
  Info,
} from 'lucide-react';
import { Product, Variant, Settings } from '@/lib/catalog';
import { formatINR } from '@/lib/pricing';

interface ProductDetailsAccordionProps {
  product: Product;
  selectedVariant: Variant;
  settings: Settings;
}

export function ProductDetailsAccordion({
  product,
  selectedVariant,
  settings,
}: ProductDetailsAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    productInfo: true,
    ingredients: true,
    usage: true,
    nutrition: false,
    shipping: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 pt-10 border-t border-border mt-12">
      {/* 1. Description & Story */}
      <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('description')}
          className="w-full flex items-center justify-between text-left focus:outline-none"
          aria-expanded={openSections.description}
        >
          <h2
            className="text-lg sm:text-xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Product Story & Craftsmanship
          </h2>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${
              openSections.description ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.description && (
          <div className="mt-4 pt-4 border-t border-border text-sm sm:text-base text-gray-700 leading-relaxed space-y-3">
            <p>{product.description}</p>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-border text-xs text-gray-600">
              <strong>Storage & Care:</strong> {product.storage}
            </div>
          </div>
        )}
      </section>

      {/* 2. Product Information Table (Hidden rows if null!) */}
      <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('productInfo')}
          className="w-full flex items-center justify-between text-left focus:outline-none"
          aria-expanded={openSections.productInfo}
        >
          <h2
            className="text-lg sm:text-xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Product Information
          </h2>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${
              openSections.productInfo ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.productInfo && (
          <div className="mt-4 pt-4 border-t border-border overflow-hidden">
            <dl className="divide-y divide-border text-xs sm:text-sm">
              {/* Net Quantity of selected pack */}
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500 font-medium">Net Quantity</dt>
                <dd className="text-ink font-bold text-right">{selectedVariant.label} ({selectedVariant.weight_grams} g)</dd>
              </div>

              {/* Price & Taxes */}
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500 font-medium">MRP (Maximum Retail Price)</dt>
                <dd className="text-ink font-bold text-right">
                  {formatINR(selectedVariant.price)} (inclusive of all taxes)
                </dd>
              </div>

              {/* Veg Mark */}
              <div className="py-2.5 flex justify-between gap-4 items-center">
                <dt className="text-gray-500 font-medium">Food Category</dt>
                <dd className="flex items-center gap-2 font-bold text-ink text-right">
                  <span className="w-4 h-4 rounded-sm border-2 border-green-600 flex items-center justify-center p-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                  </span>
                  <span className="capitalize">{product.veg_mark} Product (100% Vegetarian)</span>
                </dd>
              </div>

              {/* Shelf Life */}
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500 font-medium">Shelf Life</dt>
                <dd className="text-ink font-medium text-right">{product.shelf_life_days} Days from packing</dd>
              </div>

              {/* Country of Origin */}
              {product.country_of_origin && (
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-gray-500 font-medium">Country of Origin</dt>
                  <dd className="text-ink font-medium text-right">{product.country_of_origin}</dd>
                </div>
              )}

              {/* Manufacturer (ONLY shown if not null) */}
              {settings.manufacturer !== null && (
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-gray-500 font-medium">Manufacturer</dt>
                  <dd className="text-ink font-medium text-right">{settings.manufacturer}</dd>
                </div>
              )}

              {/* FSSAI (ONLY shown if not null) */}
              {settings.fssai_no !== null && (
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-gray-500 font-medium">FSSAI License No.</dt>
                  <dd className="text-ink font-medium text-right">{settings.fssai_no}</dd>
                </div>
              )}

              {/* Customer Care (ONLY shown if not null) */}
              {settings.customer_care !== null && (
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-gray-500 font-medium">Customer Care</dt>
                  <dd className="text-ink font-medium text-right">{settings.customer_care}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </section>

      {/* 3. Ingredients & Allergens (Hidden if null) */}
      {(product.ingredients || product.allergens) && (
        <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('ingredients')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
            aria-expanded={openSections.ingredients}
          >
            <h2
              className="text-lg sm:text-xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ingredients & Allergen Info
            </h2>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                openSections.ingredients ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.ingredients && (
            <div className="mt-4 pt-4 border-t border-border text-sm text-gray-700 space-y-3">
              {product.ingredients && (
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Ingredients
                  </h3>
                  <p className="leading-relaxed">{product.ingredients}</p>
                </div>
              )}

              {product.allergens && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900">
                  <strong>Allergen Advisory:</strong> {product.allergens}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 4. Ways to Enjoy */}
      {product.usage_ideas && product.usage_ideas.length > 0 && (
        <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('usage')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
            aria-expanded={openSections.usage}
          >
            <h2
              className="text-lg sm:text-xl font-bold text-ink flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <UtensilsCrossed size={18} className="text-primary" />
              Ways to Enjoy
            </h2>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                openSections.usage ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.usage && (
            <div className="mt-4 pt-4 border-t border-border">
              <ul className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                {product.usage_ideas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-border">
                    <Sparkles size={15} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 5. Optional Nutrition Table */}
      {product.nutrition_per_100g && (
        <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('nutrition')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
            aria-expanded={openSections.nutrition}
          >
            <h2
              className="text-lg sm:text-xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Nutritional Values (Approx. per 100g)
            </h2>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                openSections.nutrition ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.nutrition && (
            <div className="mt-4 pt-4 border-t border-border overflow-hidden">
              <table className="w-full text-xs sm:text-sm divide-y divide-border">
                <tbody>
                  {product.nutrition_per_100g.energy_kcal && (
                    <tr className="py-2 flex justify-between">
                      <td className="text-gray-500 py-1.5">Energy</td>
                      <td className="text-ink font-bold py-1.5">{product.nutrition_per_100g.energy_kcal} kcal</td>
                    </tr>
                  )}
                  {product.nutrition_per_100g.protein_g && (
                    <tr className="py-2 flex justify-between">
                      <td className="text-gray-500 py-1.5">Protein</td>
                      <td className="text-ink font-bold py-1.5">{product.nutrition_per_100g.protein_g} g</td>
                    </tr>
                  )}
                  {product.nutrition_per_100g.carbohydrates_g && (
                    <tr className="py-2 flex justify-between">
                      <td className="text-gray-500 py-1.5">Carbohydrates</td>
                      <td className="text-ink font-bold py-1.5">{product.nutrition_per_100g.carbohydrates_g} g</td>
                    </tr>
                  )}
                  {product.nutrition_per_100g.fat_g && (
                    <tr className="py-2 flex justify-between">
                      <td className="text-gray-500 py-1.5">Total Fat</td>
                      <td className="text-ink font-bold py-1.5">{product.nutrition_per_100g.fat_g} g</td>
                    </tr>
                  )}
                  {product.nutrition_per_100g.sodium_mg && (
                    <tr className="py-2 flex justify-between">
                      <td className="text-gray-500 py-1.5">Sodium</td>
                      <td className="text-ink font-bold py-1.5">{product.nutrition_per_100g.sodium_mg} mg</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 6. Shipping & Returns */}
      <section className="rounded-2xl bg-white border border-border p-5 sm:p-6 shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('shipping')}
          className="w-full flex items-center justify-between text-left focus:outline-none"
          aria-expanded={openSections.shipping}
        >
          <h2
            className="text-lg sm:text-xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shipping & Return Policies
          </h2>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${
              openSections.shipping ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.shipping && (
          <div className="mt-4 pt-4 border-t border-border text-xs sm:text-sm text-gray-700 space-y-2 leading-relaxed">
            <p>
              • <strong>Pan India Delivery:</strong> Orders dispatched within 24-48 hours. Express delivery across major metro cities in 3-5 business days.
            </p>
            <p>
              • <strong>Food Quality Assurance:</strong> Packed in 3-layer nitrogen-flushed pouches to guarantee factory freshness.
            </p>
            <p>
              • <strong>Support & Inquiries:</strong> Review our full{' '}
              <Link href="/terms" className="text-primary font-bold underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary font-bold underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
