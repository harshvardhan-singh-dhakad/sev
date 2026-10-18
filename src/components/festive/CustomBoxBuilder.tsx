'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Gift,
  Plus,
  Minus,
  Check,
  X,
  Package,
  ShoppingBag,
  ArrowRight,
  Flame,
  CheckCircle2,
  Heart,
  Truck,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@/lib/catalog';
import { useCartStore } from '@/lib/store';

export interface BoxTier {
  id: string;
  name: string;
  capacity: number;
  weightLabel: string;
  pricePaise: number;
  comparePricePaise: number;
  badge?: string;
  description: string;
}

const BOX_TIERS: BoxTier[] = [
  {
    id: 'custom_box_3pack',
    name: 'Festive Trio Box',
    capacity: 3,
    weightLabel: '750g (3 × 250g Packs)',
    pricePaise: 34900,
    comparePricePaise: 45000,
    badge: 'Great Value',
    description: 'Pick any 3 snacks. Crisp, fresh, and hand-packed with festive gift box packaging.',
  },
  {
    id: 'custom_box_4pack',
    name: 'Royal Family Quad Box',
    capacity: 4,
    weightLabel: '1 kg (4 × 250g Packs)',
    pricePaise: 44900,
    comparePricePaise: 60000,
    badge: '⭐ Most Popular',
    description: 'Our #1 best-selling gift box. Choose any 4 authentic namkeens + festive greeting postcard.',
  },
  {
    id: 'custom_box_6pack',
    name: 'Grand Uphaar Hamper',
    capacity: 6,
    weightLabel: '1.5 kg (6 × 250g Packs)',
    pricePaise: 64900,
    comparePricePaise: 90000,
    badge: 'Maximum Variety',
    description: 'The ultimate royal celebration. Choose 6 snacks for grand festivities and large family gatherings.',
  },
];

interface CustomBoxBuilderProps {
  products: Product[];
  festivalName?: string;
  festivalSlug?: string;
}

export function CustomBoxBuilder({
  products,
  festivalName = 'Festive',
  festivalSlug = 'diwali',
}: CustomBoxBuilderProps) {
  const { addItem, openCart } = useCartStore();

  const [selectedTier, setSelectedTier] = useState<BoxTier>(BOX_TIERS[1]); // Default to 4-pack (1kg)
  const [selectedItems, setSelectedItems] = useState<{ id: string; product: Product }[]>([]);
  const [spiceFilter, setSpiceFilter] = useState<'all' | 'mild' | 'medium' | 'spicy'>('all');

  // Gifting customization
  const [isGift, setIsGift] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Capacity calculation
  const remainingSlots = selectedTier.capacity - selectedItems.length;
  const isFull = remainingSlots === 0;

  // Add snack to slot
  function handleAddSnack(product: Product) {
    if (selectedItems.length >= selectedTier.capacity) {
      toast.error(`Your ${selectedTier.name} can hold max ${selectedTier.capacity} snacks. Remove one to replace or select a larger box!`);
      return;
    }
    const newEntry = {
      id: `${product.slug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product,
    };
    setSelectedItems((prev) => [...prev, newEntry]);
    toast.success(`Added ${product.name} to box slot #${selectedItems.length + 1}`);
  }

  // Remove snack from slot
  function handleRemoveSlot(slotIndex: number) {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== slotIndex));
  }

  // Change tier
  function handleChangeTier(tier: BoxTier) {
    setSelectedTier(tier);
    if (selectedItems.length > tier.capacity) {
      setSelectedItems((prev) => prev.slice(0, tier.capacity));
      toast(`Box updated to ${tier.name}. Trimmed to ${tier.capacity} items.`);
    }
  }

  // Count of each product in current selection
  function getProductCountInBox(slug: string) {
    return selectedItems.filter((i) => i.product.slug === slug).length;
  }

  // Filter products by spice
  const filteredProducts = products.filter((p) => {
    if (spiceFilter === 'all') return true;
    if (spiceFilter === 'mild') return p.spice_level === 'mild' || !p.spice_level;
    if (spiceFilter === 'medium') return p.spice_level === 'medium';
    if (spiceFilter === 'spicy') return p.spice_level === 'hot';
    return true;
  });

  // Add Custom Box to Cart
  function handleAddCustomBoxToCart() {
    if (!isFull) {
      toast.error(`Please pick ${remainingSlots} more snack${remainingSlots > 1 ? 's' : ''} to complete your box!`);
      return;
    }

    const itemNames = selectedItems.map((i) => `${i.product.name} (250g)`).join(' + ');

    // Add unified custom hamper item to cart
    addItem({
      productId: 'custom_gift_box',
      productName: `${festivalName} Custom Box (${selectedTier.name})`,
      variantId: selectedTier.id,
      variantName: `Contents: ${itemNames}`,
      weight: selectedTier.weightLabel,
      quantity: 1,
      price: selectedTier.pricePaise / 100,
      compareAtPrice: selectedTier.comparePricePaise ? selectedTier.comparePricePaise / 100 : undefined,
      thumbnail: selectedItems[0]?.product.images[0]?.src || '/images/placeholder-sev.svg',
      slug: 'custom-festive-gift-box',
    });

    // Save gifting metadata to sessionStorage if entered
    if (isGift && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(
          'aron_festive_gift',
          JSON.stringify({
            isGift: true,
            festival: festivalSlug,
            senderName,
            recipientName,
            giftMessage: giftNote,
          })
        );
      } catch {
        // Ignore
      }
    }

    toast.success(`🎉 Custom ${selectedTier.name} added to cart!`);
    openCart();
  }

  return (
    <section id="custom-box-builder" className="scroll-mt-20 py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30">
      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
            <Sparkles size={14} className="text-amber-700" />
            Build Your Own Gift Box · अपनी पसंद का स्वाद चुनें
          </div>
          <h2
            className="text-2xl sm:text-4xl font-black text-slate-900 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Customize Your {festivalName} Hamper
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Choose your box size, handpick your favorite authentic Malwa namkeens from our fresh kitchen, and personalize with your festive message.
          </p>
        </div>

        {/* STEP 1: CHOOSE BOX SIZE / TIER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
              1
            </span>
            Step 1: Choose Box Size & Capacity
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOX_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const savings = Math.round(
                ((tier.comparePricePaise - tier.pricePaise) / tier.comparePricePaise) * 100
              );

              return (
                <div
                  key={tier.id}
                  onClick={() => handleChangeTier(tier)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                      {tier.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-black text-base text-slate-900">{tier.name}</h3>
                      <p className="text-xs font-bold text-amber-800 mt-0.5">{tier.weightLabel}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        ₹{tier.pricePaise / 100}
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        ₹{tier.comparePricePaise / 100}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{tier.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-700">
                      Capacity: {tier.capacity} Snacks
                    </span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save {savings}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 2: VISUAL BOX TRAY (SLOTS) */}
        <div className="mb-10 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                Step 2: Box Slots ({selectedItems.length} of {selectedTier.capacity} Selected)
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {selectedTier.name} Tray
              </h3>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    isFull
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isFull
                    ? '🎉 Box Complete & Ready!'
                    : `${remainingSlots} more snack${remainingSlots > 1 ? 's' : ''} needed`}
                </span>
              </div>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="text-xs text-rose-600 hover:text-rose-800 underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Visual Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: selectedTier.capacity }).map((_, slotIndex) => {
              const item = selectedItems[slotIndex];

              if (item) {
                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 p-4 flex flex-col justify-between group transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slotIndex)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white text-rose-600 hover:bg-rose-600 hover:text-white shadow-xs border border-rose-200 flex items-center justify-center transition-colors"
                      title="Remove snack"
                    >
                      <X size={14} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-emerald-200 overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0]?.src || '/images/placeholder-sev.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="min-w-0 pr-6">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Slot #{slotIndex + 1}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">250g Pack</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Included in Box
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slotIndex)}
                        className="text-rose-600 hover:underline text-[10px]"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`empty_${slotIndex}`}
                  className="rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/20 p-5 flex flex-col items-center justify-center text-center min-h-[120px] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 font-bold text-xs">
                    {slotIndex + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-700">Empty Slot</span>
                  <span className="text-[11px] text-amber-700/80 mt-0.5">
                    Click any snack below to add
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3: SNACK CATALOG CHOOSER */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                Step 3: Select Fresh Snacks from Kitchen (250g Packs)
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Choose Your Authentic Flavors
              </h3>
            </div>

            {/* Spice Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSpiceFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  spiceFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Snacks
              </button>
              <button
                type="button"
                onClick={() => setSpiceFilter('mild')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  spiceFilter === 'mild'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mild & Sweet
              </button>
              <button
                type="button"
                onClick={() => setSpiceFilter('medium')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  spiceFilter === 'medium'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medium Spicy
              </button>
              <button
                type="button"
                onClick={() => setSpiceFilter('spicy')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  spiceFilter === 'spicy'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teekha / Laung
              </button>
            </div>
          </div>

          {/* Snacks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const inBoxCount = getProductCountInBox(product.slug);
              const imgUrl = product.images[0]?.src || '/images/placeholder-sev.svg';

              return (
                <div
                  key={product.slug}
                  className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    inBoxCount > 0
                      ? 'border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100">
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.spice_level && (
                        <span
                          className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                            product.spice_level === 'hot'
                              ? 'bg-rose-500/90 text-white'
                              : product.spice_level === 'mild'
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-amber-500/90 text-white'
                          }`}
                        >
                          {product.spice_level}
                        </span>
                      )}
                      {inBoxCount > 0 && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                          {inBoxCount}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.short_description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">250g Pack</span>
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => handleAddSnack(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : inBoxCount > 0
                          ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                      }`}
                    >
                      <Plus size={14} />
                      {inBoxCount > 0 ? `Add Another (${inBoxCount})` : 'Add to Box'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 4: DIRECT GIFTING CUSTOMIZATION (ACCORDION) */}
        <div className="mb-10 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-5 h-5 rounded-md text-amber-600 border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Gift size={16} className="text-amber-600" />
                  Send as Direct Gift to Someone Else (Bhejo Apne Naam Se)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Package par aapka naam hoga aur andar free personalized festive greeting card jayega. No prices shown.
                </p>
              </div>
            </label>
          </div>

          {isGift && (
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Recipient Name (Jinko bhejna hai)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Ramesh Verma & Family"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sender Name (Aapka Naam / Parivar)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. With Love From: Sharma Family, Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Personal Greeting Message for Postcard
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Wishing you a prosperous, healthy and crunchy festive season filled with sweetness and smiles!"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* STICKY / BOTTOM ACTION BAR */}
        <div className="sticky bottom-4 z-30 bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-base text-white">
                  {selectedTier.name} ({selectedItems.length}/{selectedTier.capacity})
                </h4>
                <span className="text-xs text-amber-300 font-bold">
                  {selectedTier.weightLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isFull
                  ? 'All slots filled! Ready to pack & ship.'
                  : `Select ${remainingSlots} more snack${remainingSlots > 1 ? 's' : ''} to complete box`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5">
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                ₹{selectedTier.pricePaise / 100}
              </div>
              <div className="text-xs text-slate-400 line-through">
                MRP ₹{selectedTier.comparePricePaise / 100}
              </div>
            </div>

            <button
              type="button"
              disabled={!isFull}
              onClick={handleAddCustomBoxToCart}
              className={`px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg ${
                isFull
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={18} />
              {isFull ? `Add Custom Box to Cart (₹${selectedTier.pricePaise / 100})` : `Pick ${remainingSlots} More`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
