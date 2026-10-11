'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Sparkles,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  RefreshCw,
  MapPin,
  Calendar,
} from 'lucide-react';
import { PublicOrderDetails } from '@/lib/orders/types';
import { formatPrice } from '@/lib/utils';

interface OrderDetailsClientProps {
  token: string;
  initialOrder: PublicOrderDetails | null;
}

export default function OrderDetailsClient({ token, initialOrder }: OrderDetailsClientProps) {
  const [order, setOrder] = useState<PublicOrderDetails | null>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);
  const [pollSeconds, setPollSeconds] = useState(0);
  const [isPollTimedOut, setIsPollTimedOut] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLatestOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          return data.order;
        }
      }
    } catch (e) {
      console.error('Error fetching order update:', e);
    }
    return null;
  };

  // Polling logic for 'pending_payment' state
  useEffect(() => {
    if (!order || order.status !== 'pending_payment') {
      return;
    }

    const startTime = Date.now();
    const MAX_POLL_MS = 60000; // 60 seconds

    pollIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      setPollSeconds(Math.floor(elapsed / 1000));

      if (elapsed >= MAX_POLL_MS) {
        setIsPollTimedOut(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        return;
      }

      const updated = await fetchLatestOrder();
      if (updated && updated.status !== 'pending_payment') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [order?.status, token]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await fetchLatestOrder();
    setIsLoading(false);
  };

  // Not Found State
  if (!order) {
    return (
      <div className="bg-[var(--color-bg)] py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center text-slate-400">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1
            className="text-2xl font-black text-[var(--color-ink)] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Order Not Found
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            We couldn&apos;t find an order matching this secure link. It may have expired or been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/track-order" className="btn btn-primary h-[48px] px-6 text-sm font-bold">
              Track by Phone Number
            </Link>
            <Link href="/shop" className="btn btn-outline h-[48px] px-6 text-sm font-bold">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaidOrConfirmed =
    order.status === 'confirmed' ||
    order.status === 'packed' ||
    order.status === 'shipped' ||
    order.status === 'delivered';

  const isFailed = order.status === 'cancelled';
  const isVerifying = order.status === 'pending_payment';

  // Subtotal, shipping, total in INR (dividing paise by 100)
  const subtotalInRupees = order.subtotal / 100;
  const shippingInRupees = order.shipping / 100;
  const totalInRupees = order.total / 100;

  return (
    <div className="bg-[var(--color-bg)] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ========================================================= */}
        {/* STATE 1: VERIFYING PAYMENT STATE */}
        {/* ========================================================= */}
        {isVerifying && (
          <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-10 shadow-sm text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Clock size={32} className="text-amber-600 animate-spin" />
            </div>

            <span className="badge badge-yellow text-xs font-bold mb-2">Payment Verification</span>
            <h1
              className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mt-2 mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Confirming Your Payment
            </h1>

            <p className="text-sm text-[var(--color-ink-muted)] max-w-lg mx-auto mb-6">
              We are verifying your transaction with your bank / UPI provider. Please keep this window open while we secure your order.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto mb-6 text-xs text-[var(--color-ink)]">
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-ink-muted)]">Order Number:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-ink-muted)]">Total Amount:</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {formatPrice(totalInRupees)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-200 mt-1 pt-1">
                <span className="text-[var(--color-ink-muted)]">Checking status:</span>
                <span className="text-amber-700 font-semibold">{pollSeconds}s elapsed</span>
              </div>
            </div>

            {isPollTimedOut ? (
              <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 max-w-md mx-auto text-left mb-6">
                <p className="text-xs font-bold text-amber-900 mb-1">
                  ⏳ Payment verification taking longer than usual
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your order is safely logged. If your bank has debited the amount, our automated system will confirm your order within a few minutes. You will receive an SMS/WhatsApp notification once confirmed.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    className="btn btn-outline btn-sm h-[40px] text-xs font-bold bg-white"
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Check Status Now
                  </button>
                  <Link
                    href={`/track-order?order=${order.order_number}&phone=${order.customer_phone}`}
                    className="btn btn-primary btn-sm h-[40px] text-xs font-bold"
                  >
                    Go to Track Order
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="btn btn-outline btn-sm h-[42px] px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh Status
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STATE 2: FAILED STATE */}
        {/* ========================================================= */}
        {isFailed && (
          <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-10 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <XCircle size={34} className="text-red-600" />
            </div>

            <span className="badge badge-red text-xs font-bold mb-2">Payment Incomplete</span>
            <h1
              className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mt-2 mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Order Payment Not Completed
            </h1>

            <p className="text-sm text-[var(--color-ink-muted)] max-w-lg mx-auto mb-6">
              The payment was either cancelled, declined by your bank, or timed out. If money was deducted, your bank will automatically refund it within 2–4 business days.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                href="/checkout"
                className="btn btn-primary h-[52px] px-8 text-base font-bold shadow-md inline-flex items-center justify-center gap-2"
              >
                Retry Order Checkout
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                className="btn btn-outline h-[52px] px-6 text-sm font-bold inline-flex items-center justify-center"
              >
                Browse Flavours
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STATE 3: PAID / CONFIRMED SUCCESS STATE */}
        {/* ========================================================= */}
        {isPaidOrConfirmed && (
          <div className="space-y-8">
            {/* Success Banner */}
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <Sparkles size={13} /> Order Placed & Confirmed
              </span>

              <h1
                className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mt-3 mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Thank You for Your Order!
              </h1>

              <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto mb-6">
                Your fresh batch of authentic Sev has been registered under Order{' '}
                <strong className="text-[var(--color-ink)]">{order.order_number}</strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/track-order?order=${order.order_number}&phone=${order.customer_phone}`}
                  className="btn btn-primary h-[52px] px-8 text-base font-bold shadow-md inline-flex items-center gap-2"
                >
                  <Truck size={18} />
                  Track Live Order Status
                </Link>
                <Link
                  href="/shop"
                  className="btn btn-outline h-[52px] px-6 text-sm font-bold inline-flex items-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* "What Happens Next" 3-Step Timeline Card */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm">
              <h2
                className="text-lg font-bold text-[var(--color-ink)] mb-6 text-center sm:text-left"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                What Happens Next?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[var(--color-primary)] font-bold text-sm flex items-center justify-center flex-shrink-0 border border-red-100">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-ink)] mb-1">
                      Handcrafted & Fresh
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      Our artisans prepare and nitrogen-seal your Sev in barrier pouches to lock in crunch and clove aroma.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-amber-100">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-ink)] mb-1">
                      Priority Dispatch
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      Your parcel is handed over to our courier within 24-48 hours. Live tracking link sent on WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-ink)] mb-1">
                      Crisp Doorstep Delivery
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      Delivered safe and sound right to your doorstep. Authentic Malwa flavors ready to savor!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items & Breakdown */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm">
              <h2
                className="text-lg font-bold text-[var(--color-ink)] mb-4 pb-3 border-b border-slate-100"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Order Summary & Items ({order.items.length})
              </h2>

              <div className="divide-y divide-slate-100 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--color-ink)]">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                        Pack: <span className="text-[var(--color-ink)]">{item.pack_label}</span> · Qty:{' '}
                        <span className="text-[var(--color-ink)]">{item.qty}</span>
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[var(--color-ink)]">
                      {formatPrice(item.line_total / 100)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-sm pt-4 border-t border-slate-100 text-[var(--color-ink-muted)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatPrice(subtotalInRupees)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {shippingInRupees === 0 ? 'FREE' : formatPrice(shippingInRupees)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                  <span className="font-bold text-base text-[var(--color-ink)]">Total Paid</span>
                  <span
                    className="text-2xl font-black text-[var(--color-primary)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatPrice(totalInRupees)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Contact Details */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  <MapPin size={15} /> Shipping Address
                </div>
                <p className="font-bold text-sm text-[var(--color-ink)]">{order.customer_name}</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                  {order.shipping_address.line1}
                  {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                  {order.shipping_address.landmark && ` (Near ${order.shipping_address.landmark})`}
                  <br />
                  {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                  <span className="font-semibold text-[var(--color-ink)]">
                    {order.shipping_address.pincode}
                  </span>
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  <Calendar size={15} /> Order Information
                </div>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Order ID: <span className="font-bold text-[var(--color-ink)]">{order.order_number}</span>
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                  Recipient Mobile:{' '}
                  <span className="font-bold text-[var(--color-ink)]">+91 {order.customer_phone}</span>
                </p>
                {order.customer_email && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                    Email: <span className="text-[var(--color-ink)]">{order.customer_email}</span>
                  </p>
                )}
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                  Placed on:{' '}
                  <span className="text-[var(--color-ink)]">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* Need Assistance Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--color-primary)]">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-ink)]">Need help with your order?</p>
                  <p className="text-[var(--color-ink-muted)]">
                    Our team is here to assist with packaging, address changes, or delivery queries.
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/919826000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm bg-white font-bold inline-flex items-center gap-1.5"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                WhatsApp Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
