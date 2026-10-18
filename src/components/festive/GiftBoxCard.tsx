'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Gift, Check, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { GiftBoxRecord } from '@/lib/festivals';
import toast from 'react-hot-toast';

interface GiftBoxCardProps {
  box: GiftBoxRecord;
  festivalSlug: string;
}

export function GiftBoxCard({ box, festivalSlug }: GiftBoxCardProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: box.id,
      productName: box.title,
      variantId: box.id,
      variantName: box.weightLabel || 'Festive Hamper',
      weight: box.weightLabel || '1 kg',
      quantity: 1,
      price: box.pricePaise / 100,
      compareAtPrice: box.comparePricePaise ? box.comparePricePaise / 100 : undefined,
      thumbnail: box.imageUrl || '/images/placeholder-sev.svg',
      slug: box.slug,
    });
    toast.success(`${box.title} added to cart!`);
    openCart();
  };

  const handleSendAsGift = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: box.id,
      productName: box.title,
      variantId: box.id,
      variantName: box.weightLabel || 'Festive Hamper',
      weight: box.weightLabel || '1 kg',
      quantity: 1,
      price: box.pricePaise / 100,
      compareAtPrice: box.comparePricePaise ? box.comparePricePaise / 100 : undefined,
      thumbnail: box.imageUrl || '/images/placeholder-sev.svg',
      slug: box.slug,
    });
    router.push(`/checkout?gift=1&festival=${festivalSlug}`);
  };

  const discountPercent =
    box.comparePricePaise && box.comparePricePaise > box.pricePaise
      ? Math.round(((box.comparePricePaise - box.pricePaise) / box.comparePricePaise) * 100)
      : null;

  return (
    <div className="rounded-3xl border border-amber-200/80 bg-white shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Box Top / Image Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 flex items-center justify-center overflow-hidden border-b border-amber-100">
          <div className="relative w-40 h-40 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={box.imageUrl || '/images/placeholder-sev.svg'}
              alt={box.title}
              fill
              className="object-contain"
            />
          </div>

          {/* Badge */}
          {box.badge && (
            <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles size={11} /> {box.badge}
            </div>
          )}

          {discountPercent && (
            <div className="absolute top-3.5 right-3.5 text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Box Details */}
        <div className="p-5 sm:p-6 space-y-3">
          {box.weightLabel && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full inline-block">
              {box.weightLabel}
            </span>
          )}

          <h3
            className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-primary transition"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {box.title}
          </h3>

          {box.description && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {box.description}
            </p>
          )}

          {/* Price Bar */}
          <div className="flex items-baseline gap-2.5 pt-2 border-t border-slate-100">
            <span className="text-2xl font-black text-slate-900">
              ₹{(box.pricePaise / 100).toFixed(0)}
            </span>
            {box.comparePricePaise && box.comparePricePaise > box.pricePaise && (
              <span className="text-sm text-slate-400 line-through">
                ₹{(box.comparePricePaise / 100).toFixed(0)}
              </span>
            )}
            <span className="text-[11px] font-bold text-emerald-700 ml-auto bg-emerald-50 px-2 py-0.5 rounded">
              Free Gift Card & Packing
            </span>
          </div>

          {/* Items Included Checklist */}
          {box.itemsIncluded && box.itemsIncluded.length > 0 && (
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1.5 mt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Included in this box:
              </p>
              {box.itemsIncluded.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span className="font-medium line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn btn-outline h-[44px] text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-white text-slate-800 border-slate-300 hover:border-amber-400 shadow-2xs"
        >
          <ShoppingBag size={14} /> Add to Cart
        </button>

        <button
          type="button"
          onClick={handleSendAsGift}
          className="btn btn-primary h-[44px] text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 border-none"
        >
          <Gift size={14} /> Send as Gift
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
