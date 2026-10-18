'use client';

import { useState } from 'react';
import {
  Package,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Box,
  Truck,
  Sparkles,
  HelpCircle,
  Tag,
  Check,
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import toast from 'react-hot-toast';

const AVAILABLE_SAMPLE_VARIETIES = [
  { id: 'indori-50g', name: 'Classic Indori Sev', pack: '50g Pack' },
  { id: 'ratlami-50g', name: 'Ratlami Laung Sev (Spicy)', pack: '50g Pack' },
  { id: 'nylon-50g', name: 'Thin Nylon Chaat Sev', pack: '50g Pack' },
  { id: 'garlic-50g', name: 'Lasun / Garlic Sev', pack: '50g Pack' },
  { id: 'gathiya-50g', name: 'Bhavnagari Gathiya', pack: '50g Pack' },
  { id: 'hing-50g', name: 'Aromatic Hing Sev', pack: '50g Pack' },
];

export default function SamplesPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([
    'Classic Indori Sev (50g)',
    'Ratlami Laung Sev (Spicy) (50g)',
  ]);

  function toggleVariety(nameWithPack: string) {
    if (selectedVarieties.includes(nameWithPack)) {
      if (selectedVarieties.length === 1) {
        toast.error('Kam se kam 1 variety select karni hogi.');
        return;
      }
      setSelectedVarieties(selectedVarieties.filter((v) => v !== nameWithPack));
    } else {
      if (selectedVarieties.length >= 4) {
        toast.error('Sample box me maximum 4 varieties (50g each) select kar sakte hain.');
        return;
      }
      setSelectedVarieties([...selectedVarieties, nameWithPack]);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      businessName: formData.get('businessName'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode'),
      productInterests: selectedVarieties.join(', '),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success('Sample request submitted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to request sample');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white py-14 sm:py-20 border-b border-amber-100/60">
        <div className="container-site text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary mb-4 border border-primary/20">
            <Sparkles size={14} /> B2B Taste Testing Kit · 50g Packets
          </div>
          <h1
            className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Try Before You Buy in Bulk
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Experience our authentic Indore clove aroma, crunch, and quality firsthand before booking wholesale orders.
            <strong className="text-slate-900 block mt-1 font-black">
              Sample namkeen is 100% Free — Only nominal courier delivery charge applies!
            </strong>
          </p>
        </div>
      </div>

      <div className="container-site py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column: Guidelines & Pricing Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Value & Pricing Breakdown Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                <Tag size={16} className="text-primary" />
                Sample Box Order Value
              </div>
              <div className="space-y-2.5 text-xs border-b border-amber-200/70 pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Sample Namkeen (4 × 50g packs):</span>
                  <span className="font-bold text-emerald-700 uppercase bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                    FREE (₹0)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Courier Shipping & Packing:</span>
                  <span className="font-bold text-slate-900">₹49 only</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-black text-sm text-slate-900">Total Payable:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">₹49</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Delivery charge only</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug bg-white/80 p-3 rounded-2xl border border-amber-100">
                💡 <strong className="text-slate-900">Why delivery charge?</strong> Hum authentic testing kit genuinely interested B2B buyers tak pahuchane ke liye sirf express delivery charges lete hain, sample bilkul muft hai.
              </p>
            </div>

            {/* 50g Packaging Feature Note */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2
                className="text-base font-black text-slate-900 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Box size={18} className="text-primary" />
                50 Grams Fresh Packaging
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Har sample variety ko <strong>50 grams ke nitrogen-barrier airtight pouch</strong> me pack kiya jata hai, taaki delivery ke baad bhi aapko real crunch, taazgi aur Malwi masalon ka asli swaad mile.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>Har packet 50g net weight ka standard packaging kit hai.</li>
                <li>Aap ek box me maximum <strong>4 varieties (200g total)</strong> chun sakte hain.</li>
                <li>Express courier se 24–48 ghante me dispatch hota hai.</li>
                <li>Delivery tracking link aapko email aur SMS par milegi.</li>
              </ul>
            </div>

            {/* Steps */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">How It Works</h3>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, title: '1. Business Details', desc: 'Shop / Company name aur shipping address fill karein.' },
                  { icon: Box, title: '2. 50g Pack Preparation', desc: 'Selected varieties ko fresh 50g pouches me nitrogen flush ke saath pack karenge.' },
                  { icon: Truck, title: '3. Express Courier', desc: 'Shiprocket / express courier se direct link ke saath dispatch.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                      <step.icon size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-100">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={42} />
                  </div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-3">
                    Sample Request Registered
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Sample Kit Request Received!
                  </h2>
                  <p className="text-slate-600 mb-8 max-w-md text-sm leading-relaxed">
                    Dhanyawaad! Aapka 50g sample tasting kit request register ho gaya hai. Hamari sales team verify karke parcel dispatch karegi aur live courier tracking link provide karegi.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="btn btn-primary h-[48px] px-8 text-sm font-bold"
                  >
                    Request Another Sample
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h2
                      className="text-2xl font-black text-slate-900"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      B2B Sample Kit Request Form
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose up to 4 varieties (50g packs each) and fill your delivery address below.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Variety Selector (50g packaging) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                          Select Varieties (50g Each) *
                        </label>
                        <span className="text-xs font-bold text-primary">
                          {selectedVarieties.length} / 4 Selected
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Har product 50g fresh pouch me aayega. Minimum 1 aur maximum 4 varieties select karein:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AVAILABLE_SAMPLE_VARIETIES.map((v) => {
                          const fullName = `${v.name} (${v.pack})`;
                          const isSelected = selectedVarieties.includes(fullName);

                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleVariety(fullName)}
                              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 font-bold'
                                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{v.name}</p>
                                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                                  {v.pack} · Nitrogen Sealed
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contact & Business Info */}
                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">
                        Business & Contact Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Business / Shop / Restaurant Name *
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="E.g. Indore Sweets & Namkeen"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Contact Person Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Phone / WhatsApp Number *
                          </label>
                          <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2.5 flex items-center border-r border-slate-200 select-none">
                              +91
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              required
                              maxLength={10}
                              className="w-full px-3 py-2.5 text-sm focus:outline-none"
                              placeholder="9885123339"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">
                        Delivery Address
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Complete Address (Shop/Street/Area) *
                          </label>
                          <textarea
                            name="address"
                            required
                            rows={2}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Shop No, Road, Landmark"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                          <input
                            type="text"
                            name="state"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="State"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
                          <input
                            type="text"
                            name="pincode"
                            required
                            maxLength={6}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="6-digit PIN code"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="border-t border-slate-100 pt-5">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Any specific requirements or notes? (Optional)
                      </label>
                      <textarea
                        name="message"
                        rows={2}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="E.g. Interested in 100 KG monthly supply if taste is approved"
                      ></textarea>
                    </div>

                    {/* Order Value Summary Banner */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                      <div className="text-xs">
                        <p className="font-black text-amber-950">
                          📦 Sample Kit: 100% Free ({selectedVarieties.length} varieties × 50g)
                        </p>
                        <p className="text-amber-800 mt-0.5">
                          Order Value: Only express courier delivery fee (₹49) applies.
                        </p>
                      </div>
                      <span className="font-black text-lg text-primary shrink-0">₹49</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full justify-center btn-lg h-[50px] text-sm font-bold shadow-md"
                    >
                      {loading ? 'Submitting Request…' : 'Submit Sample Request (50g Packs)'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}