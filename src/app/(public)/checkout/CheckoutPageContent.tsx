'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { loadRazorpayScript, openRazorpayModal } from '@/lib/razorpay/client';

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const MIN_ORDER_VALUE = 199;
const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING_FEE = 49;

export default function CheckoutPageContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, getSubtotal, clearCart } = useCartStore();

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Madhya Pradesh');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[var(--color-bg)] py-20 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={36} />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const isMinOrderMet = subtotal >= MIN_ORDER_VALUE;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="bg-[var(--color-bg)] py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[var(--color-ink-muted)]">
            <ShoppingBag size={30} className="text-[var(--color-primary)]" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your cart is empty
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="btn btn-primary h-[52px] px-8 text-base font-bold shadow-md inline-flex items-center gap-2"
          >
            Explore Snacks
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  // Min-order fallback
  if (!isMinOrderMet) {
    return (
      <div className="bg-[var(--color-bg)] py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-8 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <AlertCircle size={36} className="text-amber-600 mx-auto mb-4" />
          <h1
            className="text-xl sm:text-2xl font-black text-[var(--color-ink)] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Minimum Order is ₹{MIN_ORDER_VALUE}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Current cart subtotal is {formatPrice(subtotal)}. Please add ₹
            {MIN_ORDER_VALUE - subtotal} more of your favorite snacks to continue to checkout.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/shop"
              className="btn btn-primary h-[52px] text-base font-bold shadow-md inline-flex items-center justify-center gap-2"
            >
              Add More Items
              <ArrowRight size={17} />
            </Link>
            <Link href="/cart" className="text-xs text-[var(--color-ink-muted)] hover:underline font-medium">
              ← Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name is required (min 2 characters)';
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Valid 10-digit Indian mobile number required (starts with 6-9)';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!line1.trim() || line1.trim().length < 3) {
      errs.line1 = 'House / Flat / Street address is required';
    }

    const cleanPin = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      errs.pincode = 'Valid 6-digit Indian PIN code required';
    }

    if (!city.trim() || city.trim().length < 2) {
      errs.city = 'City / District is required';
    }

    if (!state.trim()) {
      errs.state = 'Please select a state / UT';
    }

    if (!consent) {
      errs.consent = 'You must accept the Terms of Service & Refund Policy';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Double-submit protection

    setServerError(null);

    if (!validate()) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const cleanPin = pincode.trim();

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: cleanPhone,
          customerEmail: email.trim() || null,
          shippingAddress: {
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            landmark: landmark.trim() || undefined,
            city: city.trim(),
            state: state.trim(),
            pincode: cleanPin,
          },
          items: items.map((i) => ({
            variantId: i.variantId,
            qty: i.quantity,
          })),
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please check details.');
      }

      if (!data.razorpay) {
        // Fallback for orders without online payment
        clearCart();
        router.push(`/order/${data.order.publicToken}`);
        return;
      }

      const isMockOrder = typeof data.razorpay.orderId === 'string' && data.razorpay.orderId.startsWith('order_mock_');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded && !isMockOrder) {
        throw new Error('Unable to connect to payment gateway. Please check your internet connection and try again.');
      }

      // Mock automated fallback for testing environments without live Razorpay credentials or script access
      if (isMockOrder) {
        const verifyRes = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.id,
            orderToken: data.order.publicToken,
            razorpayOrderId: data.razorpay.orderId,
            razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
            razorpaySignature: 'mock_signature',
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'Payment verification failed');
        }

        clearCart();
        router.push(`/order/${data.order.publicToken}`);
        return;
      }

      // Open official Razorpay Checkout Modal
      const opened = openRazorpayModal({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency || 'INR',
        name: 'Rasvat Authentic Snacks',
        description: `Order #${data.order.orderNumber}`,
        order_id: data.razorpay.orderId,
        prefill: {
          name: name.trim(),
          contact: cleanPhone,
          email: email.trim() || undefined,
        },
        theme: {
          color: '#D32F2F',
        },
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.order.id,
                orderToken: data.order.publicToken,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            clearCart();
            router.push(`/order/${data.order.publicToken}`);
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            setServerError(verifyErr.message || 'Payment verification failed. Your order status will be updated shortly.');
            router.push(`/order/${data.order.publicToken}`);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setServerError('Payment was cancelled or closed. You can retry anytime.');
          },
        },
      });

      if (!opened) {
        throw new Error('Failed to open payment gateway. Please disable pop-up blockers or try again.');
      }
    } catch (err: any) {
      console.error('Checkout submit error:', err);
      setServerError(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
            <Link href="/cart" className="hover:text-[var(--color-primary)]">
              Cart
            </Link>
            <span>/</span>
            <span className="text-[var(--color-primary)]">Checkout</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            Fill in your delivery address to place your authentic Sev order.
          </p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Order Error</p>
              <p className="text-xs mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* 2-Column Desktop Layout (≥1024px) */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Contact Details */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2
                    className="text-base sm:text-lg font-bold text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Contact Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2" data-error={!!errors.name}>
                    <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                        errors.name ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* 10-Digit Mobile */}
                  <div data-error={!!errors.phone}>
                    <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                      10-Digit Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex rounded-xl overflow-hidden border border-[var(--color-border)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent">
                      <span className="bg-slate-100 text-[var(--color-ink)] text-xs font-bold px-3 py-2.5 flex items-center border-r border-slate-200 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9826012345"
                        className={`w-full px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none ${
                          errors.phone ? 'border-red-500 bg-red-50/30' : ''
                        }`}
                      />
                    </div>
                    {errors.phone ? (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>
                    ) : (
                      <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                        For dispatch & delivery alerts on WhatsApp/SMS
                      </p>
                    )}
                  </div>

                  {/* Email (Optional) */}
                  <div data-error={!!errors.email}>
                    <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-[var(--color-ink-muted)] font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                        errors.email ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2
                    className="text-base sm:text-lg font-bold text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Line 1 */}
                  <div data-error={!!errors.line1}>
                    <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                      House / Flat / Street (Line 1) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="Flat 302, Sai Residency, MG Road"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                        errors.line1 ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                      }`}
                    />
                    {errors.line1 && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.line1}</p>
                    )}
                  </div>

                  {/* Line 2 & Landmark */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                        Apartment / Area (Line 2) <span className="text-[var(--color-ink-muted)] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        placeholder="Near Freeganj Tower"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                        Nearby Landmark <span className="text-[var(--color-ink-muted)] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Opposite Jain Temple"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  {/* Pincode, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* 6-digit Pincode */}
                    <div data-error={!!errors.pincode}>
                      <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                        6-Digit Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="456001"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                          errors.pincode ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.pincode}</p>
                      )}
                    </div>

                    {/* City */}
                    <div data-error={!!errors.city}>
                      <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                        City / District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ujjain"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                          errors.city ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.city}</p>
                      )}
                    </div>

                    {/* State Dropdown */}
                    <div data-error={!!errors.state}>
                      <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                        State / UT <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[var(--color-ink)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                          errors.state ? 'border-red-500 bg-red-50/30' : 'border-[var(--color-border)]'
                        }`}
                      >
                        {INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                      Delivery Instructions <span className="text-[var(--color-ink-muted)] font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Ring bell or leave at security desk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Policy Consent */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-5 h-5 min-w-[20px] rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] mt-0.5"
                  />
                  <span className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-bold text-[var(--color-primary)] underline hover:text-[var(--color-primary-dark)]"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/refund-policy"
                      target="_blank"
                      className="font-bold text-[var(--color-primary)] underline hover:text-[var(--color-primary-dark)]"
                    >
                      Refund Policy
                    </Link>
                    . I understand fresh namkeen is shipped within 24-48 hours.
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs text-red-600 mt-2 font-medium">{errors.consent}</p>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Order Summary (4 Cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <h2
                    className="text-base sm:text-lg font-bold text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Items in Order ({items.length})
                  </h2>
                  <Link href="/cart" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                    Edit Cart
                  </Link>
                </div>

                {/* Items snapshot list */}
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1 mb-4 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.variantId} className="pt-2.5 first:pt-0 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.productName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--color-ink)] line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-[var(--color-ink-muted)]">
                          {item.weight || item.variantName} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[var(--color-ink)] whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[var(--color-ink-muted)]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[var(--color-ink)]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[var(--color-ink-muted)]">
                    <div className="flex items-center gap-1.5">
                      <span>Delivery Fee</span>
                      {isFreeShipping && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Free
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-[var(--color-ink)]">
                      {isFreeShipping ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <span className="font-extrabold text-base text-[var(--color-ink)]">Total Payable</span>
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

                {/* 52px CTA Button with Double-Submit Block */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full h-[52px] text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Securing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Place Order · {formatPrice(total)}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Plain-text trust line */}
                <p className="text-[11px] text-center text-[var(--color-ink-muted)] mt-3 leading-relaxed">
                  🔒 256-Bit SSL Encrypted · Direct Dispatch from Kitchen · 100% Authentic Taste
                </p>

                {/* Quality Guarantees */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-600 flex-shrink-0" />
                    <span>Safe contactless delivery via priority courier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-[var(--color-primary)] flex-shrink-0" />
                    <span>Live SMS and WhatsApp tracking links</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
