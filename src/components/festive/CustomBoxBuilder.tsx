'use client';

import { useState, useMemo } from 'react';
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
  Info,
  Palette,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@/lib/catalog';
import { useCartStore } from '@/lib/store';

// =============================================================================
// GIFT BOX DESIGNS (Step 1: Choose Box Style)
// =============================================================================
export interface GiftBoxDesign {
  id: string;
  name: string;
  theme: string;
  tagline: string;
  badge: string;
  accentBg: string;
  gradientHeader: string;
  borderColor: string;
  accentText: string;
  iconBg: string;
  description: string;
}

export const GIFT_BOX_DESIGNS: GiftBoxDesign[] = [
  {
    id: 'design_royal_gold',
    name: 'Shahi Gold & Maroon',
    theme: 'Imperial Velvet Edition',
    tagline: 'Rich Royal Gold Foil with Deep Crimson Velvet Accents',
    badge: '⭐ Most Popular',
    accentBg: 'bg-amber-500/10',
    gradientHeader: 'from-amber-700 via-amber-800 to-amber-950',
    borderColor: 'border-amber-500',
    accentText: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Rigid gold-embossed keepsake gift box with traditional Malwa royal motifs. Hand-tied with satin ribbon.',
  },
  {
    id: 'design_crimson_peacock',
    name: 'Festive Crimson & Peacock',
    theme: 'Traditional Utsav Edition',
    tagline: 'Sindoor Red with Gilded Peacock & Sacred Lotus Emblems',
    badge: '🪔 Festive Special',
    accentBg: 'bg-rose-500/10',
    gradientHeader: 'from-rose-700 via-red-800 to-red-950',
    borderColor: 'border-rose-500',
    accentText: 'text-rose-800',
    iconBg: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Vibrant auspicious Indian celebration box. Brings colors of happiness for Diwali, Pooja, and family gatherings.',
  },
  {
    id: 'design_eco_kraft',
    name: 'Eco-Kraft Malwa Heritage',
    theme: 'Artisanal Organic Edition',
    tagline: 'Textured Kraft Box with Natural Jute Twine & Wax Seal',
    badge: '🌿 100% Eco-Friendly',
    accentBg: 'bg-emerald-500/10',
    gradientHeader: 'from-stone-700 via-stone-800 to-amber-950',
    borderColor: 'border-stone-500',
    accentText: 'text-stone-800',
    iconBg: 'bg-stone-200 text-stone-900 border-stone-400',
    description: 'Rustic artisanal hamper packed in recyclable kraft board with handcrafted jute tie and wax heritage stamp.',
  },
  {
    id: 'design_midnight_gold',
    name: 'Midnight Navy & Champagne',
    theme: 'Executive Luxe Edition',
    tagline: 'Matte Midnight Blue with Brushed Champagne Gold Foil',
    badge: '✨ Executive Luxe',
    accentBg: 'bg-blue-500/10',
    gradientHeader: 'from-blue-900 via-slate-900 to-slate-950',
    borderColor: 'border-blue-600',
    accentText: 'text-blue-900',
    iconBg: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Sophisticated modern architectural box designed for corporate gifting, clients, and contemporary celebrations.',
  },
];

// Capacity info and box packaging fee breakdown (Option B)
export function getBoxCapacityInfo(itemCount: number) {
  if (itemCount <= 5) {
    return {
      tierName: 'Royal Quad & Panch-Ratna Box',
      capacityLabel: '4 – 5 Packs Box',
      targetCount: Math.max(4, itemCount),
      weightLabel: `${(itemCount * 0.25).toFixed(2)} kg (${itemCount} × 250g Packs)`,
      basePackagingFee: 59,
      comparePackagingFee: 100,
      packagingTag: 'Rigid 4-5 Compartment Custom Box',
    };
  } else if (itemCount <= 8) {
    return {
      tierName: 'Classic Grand Hamper',
      capacityLabel: '6 – 8 Packs Box',
      targetCount: Math.max(6, itemCount),
      weightLabel: `${(itemCount * 0.25).toFixed(2)} kg (${itemCount} × 250g Packs)`,
      basePackagingFee: 89,
      comparePackagingFee: 150,
      packagingTag: 'Double-Row Festive Hamper Box',
    };
  } else if (itemCount <= 10) {
    return {
      tierName: 'Shahi Darbar Hamper',
      capacityLabel: '9 – 10 Packs Box',
      targetCount: Math.max(9, itemCount),
      weightLabel: `${(itemCount * 0.25).toFixed(2)} kg (${itemCount} × 250g Packs)`,
      basePackagingFee: 119,
      comparePackagingFee: 200,
      packagingTag: 'Grand Multi-Tier Gift Hamper Tray',
    };
  } else {
    return {
      tierName: 'Jumbo Imperial Trunk',
      capacityLabel: '11 – 15 Packs Trunk',
      targetCount: Math.max(11, itemCount),
      weightLabel: `${(itemCount * 0.25).toFixed(2)} kg (${itemCount} × 250g Packs)`,
      basePackagingFee: 149,
      comparePackagingFee: 250,
      packagingTag: 'Mega Celebration Hamper Trunk (11–15 Packs)',
    };
  }
}

function getProduct250gDetails(product: Product) {
  const v =
    product.variants.find((variant) => variant.weight_grams === 250) ||
    product.variants.find((variant) => variant.label?.toLowerCase().includes('250')) ||
    product.variants[0];

  const priceRupees = v ? (v.price > 1000 ? Math.round(v.price / 100) : v.price) : 90;
  const compareAtPriceRupees = v?.mrp ? (v.mrp > 1000 ? Math.round(v.mrp / 100) : v.mrp) : Math.round(priceRupees * 1.25);

  return {
    variantId: v?.id || `${product.slug}-250g`,
    price: priceRupees,
    compareAtPrice: compareAtPriceRupees,
    label: v?.label || '250g',
  };
}

interface CustomBoxBuilderProps {
  products: Product[];
  festivalName?: string;
  festivalSlug?: string;
}

export function CustomBoxBuilder({
  products,
  festivalName = 'Festive',
  festivalSlug = 'custom-box',
}: CustomBoxBuilderProps) {
  const { addItem, openCart } = useCartStore();

  // Selected Box Design (Step 1)
  const [selectedDesign, setSelectedDesign] = useState<GiftBoxDesign>(GIFT_BOX_DESIGNS[0]);

  // Selected Snack items (Min 4, Max 15)
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    product: Product;
    variantId: string;
    price: number;
    comparePrice?: number;
  }[]>([]);

  // Filter snacks by spice
  const [spiceFilter, setSpiceFilter] = useState<'all' | 'mild' | 'medium' | 'spicy'>('all');

  // Gifting customization
  const [isGift, setIsGift] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Target count helper (minimum 4, maximum 15)
  const count = selectedItems.length;
  const capacityInfo = getBoxCapacityInfo(Math.max(count, 4));

  // Option B Pricing Calculations
  const snacksSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price, 0);
  }, [selectedItems]);

  const snacksCompareTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.comparePrice || item.price * 1.25), 0);
  }, [selectedItems]);

  // Free Box Packaging Offer on orders >= ₹999
  const isFreePackaging = snacksSubtotal >= 999;
  const packagingFee = count >= 4 ? (isFreePackaging ? 0 : capacityInfo.basePackagingFee) : capacityInfo.basePackagingFee;
  const totalPrice = count >= 4 ? snacksSubtotal + packagingFee : snacksSubtotal;
  const totalComparePrice = count >= 4 ? snacksCompareTotal + capacityInfo.comparePackagingFee : snacksCompareTotal;

  // Add snack to slot
  function handleAddSnack(product: Product) {
    if (selectedItems.length >= 15) {
      toast.error('Maximum 15 snacks reached for our Jumbo Celebration Hamper!');
      return;
    }
    const details = getProduct250gDetails(product);
    const newEntry = {
      id: `${product.slug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product,
      variantId: details.variantId,
      price: details.price,
      comparePrice: details.compareAtPrice,
    };
    setSelectedItems((prev) => [...prev, newEntry]);
    toast.success(`Added ${product.name} (250g) • ₹${details.price}`);
  }

  // Remove snack from slot
  function handleRemoveSlot(slotIndex: number) {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== slotIndex));
  }

  // Remove by slug (from catalog card)
  function handleRemoveBySlug(slug: string) {
    const lastIndex = [...selectedItems].map((i) => i.product.slug).lastIndexOf(slug);
    if (lastIndex !== -1) {
      handleRemoveSlot(lastIndex);
    }
  }

  // Count of each product in current box
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
    if (count < 4) {
      toast.error(`Please pick at least 4 snacks to complete your custom box (${4 - count} more needed)!`);
      return;
    }
    if (count > 15) {
      toast.error('Maximum 15 snacks allowed in a single hamper.');
      return;
    }

    const itemNames = selectedItems.map((i) => `${i.product.name} (250g)`).join(' + ');

    // Add unified custom hamper item to cart
    addItem({
      productId: 'custom_gift_box',
      productName: `Custom Gift Box • ${selectedDesign.name}`,
      variantId: `custom_box_${count}pack`,
      variantName: `${selectedDesign.name} (${count} Snacks): ${selectedItems.map((i) => i.product.name).join(', ')}`,
      weight: capacityInfo.weightLabel,
      quantity: 1,
      price: totalPrice,
      compareAtPrice: totalComparePrice,
      thumbnail: selectedItems[0]?.product.images[0]?.src || '/images/placeholder-sev.svg',
      slug: 'custom-festive-gift-box',
      customBoxDetails: {
        designId: selectedDesign.id,
        designName: selectedDesign.name,
        designTheme: selectedDesign.theme,
        items: selectedItems.map((i) => ({
          variantId: i.variantId,
          productSlug: i.product.slug,
          productName: i.product.name,
          qty: 1,
          price: i.price,
        })),
        snacksSubtotal,
        boxFee: packagingFee,
        senderName: isGift ? senderName.trim() : undefined,
        recipientName: isGift ? recipientName.trim() : undefined,
        giftMessage: isGift ? giftNote.trim() : undefined,
      },
    });

    // Save gifting metadata to sessionStorage for checkout pre-fill
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

    toast.success(`🎉 Custom ${selectedDesign.name} (${count} Snacks) added to cart!`);
    openCart();
  }

  // Pre-calculated slots array (shows chosen items + empty placeholders up to at least 4 or next tier)
  const displaySlotsCount = Math.max(4, count < 4 ? 4 : count < 6 ? 6 : count < 8 ? 8 : count < 10 ? 10 : Math.min(15, count + 1));

  return (
    <section
      id="custom-box-builder"
      className="scroll-mt-20 py-12 sm:py-20 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30"
    >
      <div className="container-site">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3 shadow-xs">
            <Sparkles size={14} className="text-amber-700" />
            Build Your Own Gift Box · अपनी पसंद का स्वाद चुनें
          </div>
          <h2
            className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Customize Your {festivalName} Gift Box
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Choose your preferred box packaging design, handpick <strong>minimum 4 up to 15 authentic snacks</strong>, and personalize with your warm message. Each snack is freshly hand-packed in 250g pouches!
          </p>

          {/* Quick Stats Pill */}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="flex items-center gap-1.5 text-amber-800">
              <Package size={14} className="text-amber-600" /> Min 4 Snacks, Max 15 Snacks
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Gift size={14} className="text-emerald-600" /> Free Greeting Postcard
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-rose-800">
              <Sparkles size={14} className="text-rose-600" /> Free Box Packaging on ₹999+
            </span>
          </div>
        </div>

        {/* =========================================================================
            STEP 1: CHOOSE GIFT BOX DESIGN
        ========================================================================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                1
              </span>
              Step 1: Select Gift Box Design & Outer Theme
            </div>
            <span className="text-xs font-bold text-slate-500">
              Selected: <strong className="text-slate-900">{selectedDesign.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GIFT_BOX_DESIGNS.map((design) => {
              const isSelected = selectedDesign.id === design.id;

              return (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? `${design.borderColor} ${design.accentBg} shadow-md ring-2 ${design.borderColor}/30 -translate-y-0.5`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs">
                      {design.badge}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Design Box Graphic / Preview Header */}
                  <div
                    className={`h-24 rounded-xl bg-gradient-to-r ${design.gradientHeader} p-3 text-white flex flex-col justify-between mb-3 shadow-inner relative overflow-hidden`}
                  >
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-sm pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                        {design.theme}
                      </span>
                      <Palette size={14} className="opacity-90" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-black text-sm tracking-tight text-amber-100">
                        {design.name}
                      </h4>
                      <p className="text-[10px] text-white/80 line-clamp-1">{design.tagline}</p>
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {design.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Outer Packaging</span>
                    <span className={`font-black text-xs ${isSelected ? 'text-amber-800' : 'text-slate-500'}`}>
                      {isSelected ? '✓ Chosen' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 2: VISUAL TRAY (SLOTS & CAPACITY COUNTER)
        ========================================================================= */}
        <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm relative overflow-hidden">
          {/* Header & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                Step 2: Box Slots & Contents ({count} Snacks in Box)
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>{selectedDesign.name}</span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {capacityInfo.tierName}
                </span>
              </h3>
            </div>

            {/* Live Progress Pill & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span
                  className={`text-xs font-black px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                    count >= 4
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {count >= 4 ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Box Ready ({count} of 15 max)
                    </>
                  ) : (
                    <>
                      <Info size={14} className="text-amber-700" />
                      Need {4 - count} more to reach Min 4
                    </>
                  )}
                </span>
              </div>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="text-xs text-rose-600 hover:text-rose-800 underline font-bold px-2 py-1"
                >
                  Clear Box
                </button>
              )}
            </div>
          </div>

          {/* Quick Capacity Helper Chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1">Popular Capacities:</span>
            {[4, 5, 6, 8, 10, 12, 15].map((capacityNum) => (
              <span
                key={capacityNum}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold border transition-colors ${
                  count === capacityNum
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {capacityNum} Packs {capacityNum === 4 ? '(Min)' : capacityNum === 15 ? '(Max)' : ''}
              </span>
            ))}
          </div>

          {/* Visual Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: displaySlotsCount }).map((_, slotIndex) => {
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 font-medium">250g Pack</span>
                          <span className="text-[11px] font-black text-slate-900">₹{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Included
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slotIndex)}
                        className="text-rose-600 hover:underline text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`empty_${slotIndex}`}
                  className="rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/20 p-5 flex flex-col items-center justify-center text-center min-h-[110px] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-1 font-bold text-xs">
                    {slotIndex + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-700">Empty Slot</span>
                  <span className="text-[10px] text-amber-700/80 mt-0.5">
                    Click snack below to add
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown Summary Strip inside Tray */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 rounded-b-3xl">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Snacks ({count} Packs):</span>
                <span className="font-black text-slate-900">₹{snacksSubtotal}</span>
                {snacksCompareTotal > snacksSubtotal && (
                  <span className="text-slate-400 line-through text-[11px]">₹{snacksCompareTotal}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Gift Box Packaging ({selectedDesign.name}):</span>
                {isFreePackaging ? (
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded">
                    FREE (Festive Offer)
                  </span>
                ) : (
                  <span className="font-black text-slate-900">₹{packagingFee}</span>
                )}
                <span className="text-[10px] text-slate-400">(Includes rigid box + custom postcard)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Box Total</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalPrice}</div>
              </div>
              <button
                type="button"
                onClick={handleAddCustomBoxToCart}
                disabled={count < 4}
                className={`btn btn-md font-black px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 ${
                  count >= 4
                    ? 'btn-primary text-slate-900 bg-amber-400 hover:bg-amber-300 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <ShoppingBag size={18} />
                {count < 4 ? `Need ${4 - count} More (Min 4)` : `Add to Cart • ₹${totalPrice}`}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 3: SNACK SELECTION CATALOG (HANDPICK FROM AUTHENTIC NAMKEEN)
        ========================================================================= */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                Step 3: Handpick Fresh Malwa Namkeens (250g Each)
              </div>
              <p className="text-xs text-slate-600">
                Click <strong>+ Add to Box</strong> on any savory. You can also pick multiple packs of your favorite snacks!
              </p>
            </div>

            {/* Spice Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              {(['all', 'mild', 'medium', 'spicy'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceFilter(level)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                    spiceFilter === level
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level === 'all' ? 'All Snacks' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Snacks Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const details = getProduct250gDetails(product);
              const countInBox = getProductCountInBox(product.slug);

              return (
                <div
                  key={product.slug}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    countInBox > 0
                      ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                      <img
                        src={product.images[0]?.src || '/images/placeholder-sev.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {countInBox > 0 && (
                        <span className="absolute top-2 right-2 bg-slate-950 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                          {countInBox} in box
                        </span>
                      )}
                    </div>

                    {/* Snack Details */}
                    <div className="mb-2">
                      <h4 className="font-black text-sm text-slate-900 line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.short_description || 'Authentic stone-ground Malwa namkeen.'}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add / Quantity Controller */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900">₹{details.price}</div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">250g Pack</span>
                    </div>

                    {countInBox > 0 ? (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveBySlug(product.slug)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-800 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                          title="Decrease quantity in box"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-slate-900 min-w-4 text-center">
                          {countInBox}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSnack(product)}
                          disabled={count >= 15}
                          className="w-6 h-6 rounded-lg bg-white text-slate-800 hover:bg-amber-400 flex items-center justify-center transition-colors shadow-xs disabled:opacity-40"
                          title="Add another pack"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddSnack(product)}
                        disabled={count >= 15}
                        className="btn btn-sm btn-primary bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
                      >
                        <Plus size={14} /> Add to Box
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 4: PERSONALIZED GREETING POSTCARD (OPTIONAL)
        ========================================================================= */}
        <div className="mb-14 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                4
              </span>
              Step 4: Personalize with Handwritten Postcard (Free)
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800">Sending as a Gift?</span>
            </label>
          </div>

          <p className="text-xs text-slate-600 mb-6 max-w-xl">
            We will print your heartfelt wishes on a premium festival postcard and place it right inside your gift box!
          </p>

          {isGift ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-amber-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sender Name (From)</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Ramesh & Neha Sharma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name (To)</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Verma Family / Amit Uncle"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Personal Greeting Message (Will be printed on postcard)
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Wishing you sweet crunchy moments and grand celebrations this festive season!"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-800/80 bg-amber-100/60 p-3 rounded-xl border border-amber-200/80">
              💡 Tip: Tick &quot;Sending as a Gift&quot; above to include your name and custom message on the recipient&apos;s parcel at no extra charge!
            </div>
          )}
        </div>

        {/* =========================================================================
            FINAL SUMMARY & CALL TO ACTION
        ========================================================================= */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Custom Hamper Summary
            </span>
            <h3
              className="text-xl sm:text-2xl font-black text-white mt-2 mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {selectedDesign.name} ({count} Packs)
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              {count >= 4
                ? `Includes ${count} packs of stone-ground Malwa namkeens + ${selectedDesign.name} packaging + greeting card.`
                : `Please pick at least 4 snacks to complete this box. (${4 - count} more required).`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="text-right sm:border-r sm:border-slate-800 sm:pr-6">
              <div className="text-xs text-slate-400">Total Price</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">₹{totalPrice}</div>
              {packagingFee === 0 && count >= 4 && (
                <div className="text-[10px] text-emerald-400 font-bold">✓ Free Packaging Applied</div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddCustomBoxToCart}
              disabled={count < 4}
              className={`btn btn-lg font-black px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                count >= 4
                  ? 'btn-primary text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer scale-100 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <ShoppingBag size={20} />
              {count < 4 ? `Select Min 4 Snacks (${count}/4)` : `Add Custom Box to Cart • ₹${totalPrice}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
