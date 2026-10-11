'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { OrderTrackingInfo } from '@/lib/orders/types';
import { formatDateTime } from '@/lib/utils';

interface TrackOrderClientProps {
  initialOrderNumber?: string;
  initialPhone?: string;
}

export default function TrackOrderClient({
  initialOrderNumber = '',
  initialPhone = '',
}: TrackOrderClientProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<OrderTrackingInfo | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!cleanOrderNumber) {
      setError('Please enter your order number (e.g. RSV-2610-00001)');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter your 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: cleanOrderNumber,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || 'No matching order found for this order number and mobile number.'
        );
      }

      setTracking(data.tracking);
    } catch (err: any) {
      console.error('Tracking lookup error:', err);
      setTracking(null);
      setError(
        err.message || 'No matching order found. Please double check the details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if both params passed in URL
  useEffect(() => {
    if (initialOrderNumber.trim() && initialPhone.replace(/\D/g, '').length === 10) {
      handleTrack();
    }
  }, []);

  return (
    <div className="bg-[var(--color-bg)] py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Live Order Tracking
          </span>
          <h1
            className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] mt-2 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Track Your Order
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Check live preparation, packaging, dispatch, and delivery updates for your fresh Rasvat parcel.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Number */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="RSV-2610-00001"
                  className="w-full px-3.5 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
                  <span className="bg-slate-100 text-[var(--color-ink)] text-xs font-bold px-3 py-3 flex items-center border-r border-slate-200 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9826012345"
                    className="w-full px-3 py-3 text-sm text-[var(--color-ink)] placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error feedback */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 52px CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-[52px] text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Searching Tracking Records...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Track Order Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results Card */}
        {tracking && (
          <div className="space-y-6">
            {/* Order Status Header */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                      Order
                    </span>
                    <span className="font-mono font-black text-lg text-[var(--color-ink)]">
                      {tracking.order_number}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    Placed for <strong className="text-[var(--color-ink)]">{tracking.customer_name}</strong> ·{' '}
                    {formatDateTime(tracking.placed_at)}
                  </p>
                </div>

                <div className="self-start sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      tracking.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tracking.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : tracking.status === 'packed'
                        ? 'bg-purple-100 text-purple-800'
                        : tracking.status === 'confirmed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {tracking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="py-4 border-b border-slate-100 text-xs">
                <span className="text-[var(--color-ink-muted)] font-semibold">Items in Parcel: </span>
                <span className="text-[var(--color-ink)] font-bold">{tracking.item_summary}</span>
              </div>

              {/* Courier & AWB Details (if shipped) */}
              {tracking.tracking_courier && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-blue-900">
                      Courier Partner: {tracking.tracking_courier}
                    </p>
                    {tracking.tracking_awb && (
                      <p className="text-blue-800 mt-0.5 font-mono">AWB Tracking No: {tracking.tracking_awb}</p>
                    )}
                  </div>
                  {tracking.tracking_url && (
                    <a
                      href={tracking.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm h-[38px] text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-center"
                    >
                      Track on Courier
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* Visual Vertical Milestone Timeline */}
              <div className="mt-8">
                <h3
                  className="text-base font-bold text-[var(--color-ink)] mb-6"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Milestone Timeline
                </h3>

                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {tracking.milestones.map((milestone) => {
                    const isCompleted = milestone.completed;
                    const isCurrent = milestone.current;

                    return (
                      <div key={milestone.key} className="flex items-start gap-4 relative">
                        {/* Milestone Indicator Circle */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isCurrent
                              ? 'bg-[var(--color-primary)] text-white ring-4 ring-red-100 animate-pulse'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : isCurrent ? (
                            <Clock size={16} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                        </div>

                        {/* Milestone Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <p
                              className={`text-sm font-bold ${
                                isCompleted || isCurrent
                                  ? 'text-[var(--color-ink)]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {milestone.label}
                            </p>
                            {milestone.timestamp && (
                              <span className="text-[11px] text-[var(--color-ink-muted)]">
                                {formatDateTime(milestone.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                            {milestone.key === 'placed' && 'Order received and logged in system.'}
                            {milestone.key === 'confirmed' && 'Payment verified and batch dispatched for frying.'}
                            {milestone.key === 'packed' && 'Weighed and sealed in nitrogen-barrier pouches.'}
                            {milestone.key === 'shipped' && 'Parcel handed to express courier partner.'}
                            {milestone.key === 'delivered' && 'Package safely delivered to recipient.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Support Quick Contact */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[var(--color-primary)] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--color-ink)]">Need courier update or address fix?</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Our team can assist with delivery instructions directly.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/919826000000?text=${encodeURIComponent(
                  `Hi Rasvat, I need an update on my order ${tracking.order_number}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm bg-white font-bold inline-flex items-center gap-1.5"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                WhatsApp Us
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
