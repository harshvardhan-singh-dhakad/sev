'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

const MIN_ORDER_VALUE = 199; // Rs 199 minimum cart threshold
const FREE_SHIPPING_THRESHOLD = 499; // Rs 499 for free delivery
const STANDARD_SHIPPING_FEE = 49;

export default function CartPageContent() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[var(--color-bg)] py-16 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const isMinOrderMet = subtotal >= MIN_ORDER_VALUE;
  const remainingForMin = Math.max(0, MIN_ORDER_VALUE - subtotal);
  const minOrderPercent = Math.min(100, Math.round((subtotal / MIN_ORDER_VALUE) * 100));

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="bg-[var(--color-bg)] py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[var(--color-ink-muted)]">
            <ShoppingBag size={38} className="text-[var(--color-primary)]" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Cart is Empty
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mb-8 max-w-md mx-auto">
            You haven&apos;t added any crunchy Malwa snacks yet. Discover our fresh, authentic Ratlami, Laung, and Indori Sev crafted with traditional recipes.
          </p>
          <Link
            href="/shop"
            className="btn btn-primary h-[52px] px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            Explore Authentic Sev
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)] py-8 sm:py-12 pb-28 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Breadcrumbs / Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
            <Link href="/shop" className="hover:text-[var(--color-primary)]">
              Store
            </Link>
            <span>/</span>
            <span className="text-[var(--color-primary)]">Shopping Cart</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)}{' '}
            {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {/* Minimum Order Value Progress Banner */}
        <div
          className={`mb-8 p-4 sm:p-5 rounded-2xl border transition-all ${
            isMinOrderMet
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isMinOrderMet ? (
                <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle size={22} className="text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm sm:text-base">
                  {isMinOrderMet
                    ? 'Minimum order requirement met! Ready for checkout.'
                    : `Add ₹${remainingForMin} more to reach the ₹${MIN_ORDER_VALUE} minimum order requirement`}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {isMinOrderMet
                    ? 'Your parcel will be handcrafted and nitrogen-sealed for crispness.'
                    : 'We ship fresh batches directly from our kitchen with minimum order ₹199.'}
                </p>
              </div>
            </div>
            {!isMinOrderMet && (
              <Link
                href="/shop"
                className="text-xs font-bold text-[var(--color-primary)] hover:underline whitespace-nowrap self-center"
              >
                + Add More
              </Link>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isMinOrderMet ? 'bg-emerald-600' : 'bg-[var(--color-primary)]'
              }`}
              style={{ width: `${minOrderPercent}%` }}
            />
          </div>
        </div>

        {/* 2-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm divide-y divide-slate-100 overflow-hidden">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.variantId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors hover:bg-slate-50/50"
                  >
                    {/* Item Thumbnail & Info */}
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 relative group"
                      >
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.productName}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-bold text-sm sm:text-base text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 font-medium">
                          Pack: <span className="text-[var(--color-ink)]">{item.weight || item.variantName}</span>
                        </p>
                        <p className="text-xs font-semibold text-[var(--color-primary)] mt-1 sm:hidden">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    {/* Stepper + Price + Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Stepper (min 44px touch targets) */}
                      <div className="flex items-center border border-[var(--color-border)] rounded-xl bg-slate-50/60 p-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white text-[var(--color-ink)] transition-colors disabled:opacity-30"
                          aria-label={`Decrease quantity of ${item.productName}`}
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[var(--color-ink)] select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white text-[var(--color-ink)] transition-colors"
                          aria-label={`Increase quantity of ${item.productName}`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-extrabold text-base sm:text-lg text-[var(--color-ink)]">
                          {formatPrice(lineTotal)}
                        </p>
                        <p className="text-[11px] text-[var(--color-ink-muted)] hidden sm:block">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      {/* Remove Button (44px min touch target) */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label={`Remove ${item.productName} from cart`}
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Shopping link */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-primary)] hover:underline"
              >
                ← Continue Shopping Flavours
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-sm">
              <h2
                className="text-lg font-bold text-[var(--color-ink)] mb-4 pb-3 border-b border-slate-100"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-[var(--color-ink)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-ink-muted)]">Delivery Fee</span>
                    {isFreeShipping && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Free
                      </span>
                    )}
                  </div>
                  <span className="font-bold">
                    {isFreeShipping ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>

                {!isFreeShipping && (
                  <p className="text-xs text-[var(--color-ink-muted)] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    💡 Free delivery on orders above ₹{FREE_SHIPPING_THRESHOLD}. (Add ₹
                    {FREE_SHIPPING_THRESHOLD - subtotal} more for free shipping)
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="font-extrabold text-base text-[var(--color-ink)]">Total</span>
                    <span className="block text-[11px] text-[var(--color-ink-muted)]">
                      Inclusive of all GST
                    </span>
                  </div>
                  <span
                    className="text-2xl font-black text-[var(--color-primary)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* 52px CTA Button */}
              <div className="mt-6">
                {isMinOrderMet ? (
                  <Link
                    href="/checkout"
                    className="btn btn-primary w-full h-[52px] text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <div>
                    <button
                      type="button"
                      disabled
                      className="btn btn-primary w-full h-[52px] text-base font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Min Order ₹{MIN_ORDER_VALUE} to Checkout
                    </button>
                    <p className="text-[11px] text-center text-amber-700 font-medium mt-2">
                      Please add ₹{remainingForMin} more to unlock checkout.
                    </p>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-[var(--color-ink-muted)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>256-Bit SSL Encrypted & Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                  <span>Handcrafted batches dispatched within 24-48 hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                  <span>100% Nitrogen-flushed moisture-barrier pouch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar (fixed bottom for screens < 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[var(--color-ink-muted)] uppercase font-semibold">
              Total Amount
            </span>
            <p
              className="text-xl font-black text-[var(--color-primary)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatPrice(total)}
            </p>
          </div>

          <div className="flex-1 max-w-[200px]">
            {isMinOrderMet ? (
              <Link
                href="/checkout"
                className="btn btn-primary w-full h-[52px] text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                Checkout
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/shop"
                className="btn btn-secondary w-full h-[52px] text-xs font-bold border border-amber-300 bg-amber-50 text-amber-900 flex items-center justify-center text-center leading-tight"
              >
                Add ₹{remainingForMin} more
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
