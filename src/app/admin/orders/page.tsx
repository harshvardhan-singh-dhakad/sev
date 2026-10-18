'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Truck,
  ExternalLink,
  Copy,
  Check,
  Search,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  AlertCircle,
  Link as LinkIcon,
  Gift,
  Printer,
  Sparkles,
  Heart,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  packLabel: string;
  weightGrams: number;
  unitPricePaise: number;
  qty: number;
  lineTotalPaise: number;
}

interface ShippingAddress {
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  publicToken: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  city: string;
  state: string;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  razorpayOrderId: string | null;
  paidAt: string | null;
  trackingCourier: string;
  trackingAwb: string;
  trackingUrl: string;
  notes: string;
  isGift?: boolean;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  recipientName?: string;
  giftMessage?: string;
  giftFestivalTag?: string;
  hidePriceSlip?: boolean;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const COURIER_OPTIONS = [
  { label: 'Shiprocket', icon: '🚀' },
  { label: 'Delhivery', icon: '🚚' },
  { label: 'DTDC', icon: '📦' },
  { label: 'Blue Dart', icon: '✈️' },
  { label: 'India Post', icon: '📮' },
  { label: 'Shadowfax', icon: '⚡' },
  { label: 'Other', icon: '✏️' },
];

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed (Payment Received)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'packed', label: 'Packed & Ready', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'shipped', label: 'Shipped via Courier', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-800 border-red-200' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formStatus, setFormStatus] = useState('shipped');
  const [formCourier, setFormCourier] = useState('');
  const [formAwb, setFormAwb] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Festive Greeting Postcard Printable Modal
  const [cardOrder, setCardOrder] = useState<Order | null>(null);

  function getFestiveTitle(tag?: string) {
    switch ((tag || '').toLowerCase()) {
      case 'diwali':
        return { title: 'Shubh Deepavali', icon: '🪔', themeColor: '#d97706' };
      case 'eid':
        return { title: 'Eid Mubarak', icon: '🌙', themeColor: '#059669' };
      case 'rakhi':
        return { title: 'Happy Raksha Bandhan', icon: '🧵', themeColor: '#e11d48' };
      case 'holi':
        return { title: 'Happy Holi', icon: '🎨', themeColor: '#7c3aed' };
      case 'newyear':
        return { title: 'Happy New Year', icon: '🎊', themeColor: '#2563eb' };
      default:
        return { title: 'Warm Festive Greetings', icon: '🎁', themeColor: '#d97706' };
    }
  }

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Orders load nahi hue.');
      setOrders(data.orders || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Orders load nahi hue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  function openDispatchModal(order: Order) {
    setSelectedOrder(order);
    setFormStatus(order.status || 'shipped');
    setFormCourier(order.trackingCourier || 'Shiprocket');
    setFormAwb(order.trackingAwb || '');
    setFormUrl(order.trackingUrl || '');
    setFormNotes(order.notes || '');
    setSaveSuccess(false);
    setSaveError('');
  }

  function closeDispatchModal() {
    setSelectedOrder(null);
    setSaveSuccess(false);
    setSaveError('');
  }

  async function handleSaveDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: formStatus,
          trackingCourier: formCourier,
          trackingAwb: formAwb,
          trackingUrl: formUrl,
          notes: formNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order fulfillment');
      }

      setSaveSuccess(true);

      // Optimistically update local order state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: formStatus,
                trackingCourier: formCourier,
                trackingAwb: formAwb,
                trackingUrl: formUrl,
                notes: formNotes,
              }
            : o
        )
      );

      // Auto close after 1.2s on success
      setTimeout(() => {
        closeDispatchModal();
      }, 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error updating fulfillment');
    } finally {
      setSaving(false);
    }
  }

  function copyAddress(order: Order, idKey: string) {
    const addr = order.shippingAddress;
    const text = [
      order.isGift ? `*** FESTIVE GIFT PARCEL (CONCEAL INVOICE) ***` : '',
      order.isGift ? `Sender: ${order.senderName || 'Anonymous'} (Mobile: +91 ${order.senderPhone || ''})` : '',
      order.isGift ? `Deliver To (Recipient): ${order.customerName}` : `Customer: ${order.customerName}`,
      `Phone: +91 ${order.customerPhone}`,
      `Address: ${addr.line1}`,
      addr.line2 ? addr.line2 : '',
      addr.landmark ? `Landmark: Near ${addr.landmark}` : '',
      `City: ${addr.city}, State: ${addr.state}`,
      `PIN Code: ${addr.pincode}`,
      `Order: ${order.orderNumber}`,
      order.isGift && order.giftFestivalTag ? `Occasion: ${order.giftFestivalTag.toUpperCase()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleAutoFillUrl() {
    const cleanAwb = formAwb.trim();
    if (!cleanAwb) return;
    const c = formCourier.toLowerCase();
    if (c.includes('shiprocket')) {
      setFormUrl(`https://shiprocket.co/tracking/${cleanAwb}`);
    } else if (c.includes('delhivery')) {
      setFormUrl(`https://www.delhivery.com/track/package/${cleanAwb}`);
    } else if (c.includes('dtdc')) {
      setFormUrl(`https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${cleanAwb}`);
    } else if (c.includes('bluedart') || c.includes('blue dart')) {
      setFormUrl(`https://www.bluedart.com/tracking?handler=trak&numbers=${cleanAwb}`);
    } else if (c.includes('post')) {
      setFormUrl(`https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/tracking.aspx`);
    }
  }

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        (order.city && order.city.toLowerCase().includes(q)) ||
        (order.trackingAwb && order.trackingAwb.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      packed: orders.filter((o) => o.status === 'packed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
  }, [orders]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Sales & Logistics</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
            <ShoppingCart size={24} className="text-primary" /> Orders & Dispatch
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage customer orders, view items, print shipping labels, and add courier tracking links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading}
          className="btn btn-outline inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Orders
        </button>
      </header>

      {/* Metrics / Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'all'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-slate-500 uppercase">Total Orders</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{counts.all}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('confirmed')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'confirmed'
              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-emerald-700 uppercase">Confirmed</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{counts.confirmed}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('packed')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'packed'
              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-amber-700 uppercase">Packed</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{counts.packed}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('shipped')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'shipped'
              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-purple-700 uppercase">Dispatched / Shipped</p>
          <p className="mt-1 text-2xl font-black text-purple-900">{counts.shipped}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'delivered'
              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-green-700 uppercase">Delivered</p>
          <p className="mt-1 text-2xl font-black text-green-900">{counts.delivered}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Name, Phone, City, AWB..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-primary" />
            Loading orders from database…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
            <h2 className="font-bold text-slate-900">Koi order nahi mila</h2>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try changing your search keywords or filter tab.'
                : 'Customer orders yahan list honge jaise hi checkout hoga.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Order & Date</th>
                  <th className="px-5 py-3.5">Customer & Address</th>
                  <th className="px-5 py-3.5">Items Ordered</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Dispatch & Tracking</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const hasTracking = Boolean(order.trackingCourier || order.trackingAwb || order.trackingUrl);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      {/* Order & Date */}
                      <td className="px-5 py-4 align-top">
                        <span className="font-mono font-black text-slate-900 block">
                          {order.orderNumber}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                              order.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.status === 'packed'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : order.status === 'shipped'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : order.status === 'delivered'
                                ? 'bg-green-50 text-green-800 border-green-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          {order.isGift && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                              <Gift size={11} className="text-amber-600" />
                              {order.giftFestivalTag || 'Gift'}
                            </span>
                          )}
                        </div>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer & Address */}
                      <td className="px-5 py-4 align-top max-w-[280px]">
                        {order.isGift && (
                          <div className="mb-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                            <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              <Heart size={11} className="text-amber-600 fill-amber-500" /> Sent With Love By:
                            </span>
                            <p className="font-black text-slate-900 mt-0.5">{order.senderName || 'Anonymous'}</p>
                            {order.senderPhone && (
                              <a
                                href={`tel:+91${order.senderPhone}`}
                                className="text-[11px] text-amber-900 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <Phone size={10} /> +91 {order.senderPhone}
                              </a>
                            )}
                          </div>
                        )}
                        <div>
                          {order.isGift && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                              Deliver To Recipient:
                            </span>
                          )}
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs">
                            <a
                              href={`tel:+91${order.customerPhone}`}
                              className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Phone size={11} /> +91 {order.customerPhone}
                            </a>
                            <a
                              href={`https://wa.me/91${order.customerPhone}?text=Hi%20${encodeURIComponent(
                                order.customerName
                              )},%20this%20is%20Aron%20Bites%20regarding%20your%20order%20${order.orderNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                          {order.customerEmail && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{order.customerEmail}</p>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-start justify-between gap-1">
                            <span className="leading-snug line-clamp-2">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
                              {order.shippingAddress.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyAddress(order, order.id)}
                              className="text-slate-400 hover:text-slate-700 shrink-0 p-1"
                              title="Copy Full Shipping Address"
                            >
                              {copiedId === order.id ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 align-top max-w-[240px]">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-2 text-xs bg-slate-50/80 px-2 py-1 rounded border border-slate-100"
                              >
                                <span className="font-semibold text-slate-800 leading-tight">
                                  {item.productName}{' '}
                                  <span className="text-slate-500 font-normal">({item.packLabel})</span>
                                </span>
                                <span className="font-bold text-slate-900 shrink-0">
                                  ×{item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No item breakdown</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 align-top">
                        <span className="font-black text-slate-900 block text-base">
                          ₹{(order.totalPaise / 100).toFixed(2)}
                        </span>
                        {order.razorpayOrderId && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {order.razorpayOrderId}
                          </span>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Paid
                        </span>
                      </td>

                      {/* Dispatch & Tracking */}
                      <td className="px-5 py-4 align-top max-w-[220px]">
                        {hasTracking ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                              <Truck size={14} className="text-purple-600" />
                              <span>{order.trackingCourier || 'Courier'}</span>
                            </div>

                            {order.trackingAwb && (
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-mono bg-purple-50 text-purple-950 px-2 py-0.5 rounded border border-purple-200">
                                  {order.trackingAwb}
                                </span>
                              </div>
                            )}

                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-1"
                              >
                                <ExternalLink size={12} /> Live Tracking Link ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock size={11} /> Ready to Dispatch
                            </span>
                            <p className="text-[11px] text-slate-400">Click button to add link</p>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDispatchModal(order)}
                            className="btn btn-primary btn-sm h-[36px] px-3.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Truck size={14} />
                            {hasTracking ? 'Edit Dispatch' : 'Dispatch & Link'}
                          </button>

                          {order.isGift && (
                            <button
                              type="button"
                              onClick={() => setCardOrder(order)}
                              className="btn btn-sm h-[32px] px-3 text-[11px] font-bold inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs"
                              title="Print 4x6 Festive Greeting Postcard"
                            >
                              <Printer size={12} className="text-amber-700" />
                              Print Card
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => copyAddress(order, `btn-${order.id}`)}
                            className="btn btn-outline btn-sm h-[30px] px-2.5 text-[11px] font-semibold inline-flex items-center gap-1 bg-white text-slate-600"
                            title="Copy customer shipping address"
                          >
                            {copiedId === `btn-${order.id}` ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                Copy Label
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DISPATCH / FULFILLMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Dispatch Order #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedOrder.customerName} · +91 {selectedOrder.customerPhone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDispatchModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveDispatch} className="p-5 sm:p-6 space-y-6">
              {/* GIFT ORDER DISPATCH NOTICE */}
              {selectedOrder.isGift && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Gift size={15} className="text-amber-600" />
                      Festive Gift Order Notice
                    </span>
                    <button
                      type="button"
                      onClick={() => setCardOrder(selectedOrder)}
                      className="btn btn-sm h-[28px] px-2.5 text-[11px] font-bold bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Printer size={12} /> Print 4×6 Card
                    </button>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    🤫 <strong>Zero Price Slip:</strong> Do NOT put invoice or price tag in this package. Enclose printed greeting card from <strong>{selectedOrder.senderName || 'Sender'}</strong>.
                  </p>
                </div>
              )}

              {/* Shipping Address Label & 1-Click Copy */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-700" />
                    Customer Shipping Label
                  </span>
                  <button
                    type="button"
                    onClick={() => copyAddress(selectedOrder, 'modal-addr')}
                    className="btn btn-outline btn-sm h-[30px] px-3 text-xs font-bold bg-white text-amber-900 border-amber-300 hover:bg-amber-100 inline-flex items-center gap-1.5"
                  >
                    {copiedId === 'modal-addr' ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        Copied Address!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Full Address
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-amber-200/80">
                  <p className="font-bold text-slate-900">{selectedOrder.customerName} (+91 {selectedOrder.customerPhone})</p>
                  <p>{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  {selectedOrder.shippingAddress.landmark && <p>Near {selectedOrder.shippingAddress.landmark}</p>}
                  <p className="font-bold mt-1">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Items to Pack */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    📦 Items to Pack ({selectedOrder.items.length})
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="font-bold text-slate-900">
                          {item.productName}{' '}
                          <span className="font-normal text-slate-600">({item.packLabel})</span>
                        </span>
                        <span className="font-black text-primary px-2 py-0.5 rounded bg-white border border-slate-200">
                          Qty: {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Order Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setFormStatus(st.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition ${
                        formStatus === st.value
                          ? `${st.color} ring-2 ring-primary/20 shadow-xs font-black`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courier Partner */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Courier Partner Name
                </label>
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COURIER_OPTIONS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setFormCourier(c.label === 'Other' ? '' : c.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition inline-flex items-center gap-1.5 ${
                        formCourier.toLowerCase() === c.label.toLowerCase()
                          ? 'bg-purple-100 text-purple-900 border-purple-300 ring-2 ring-purple-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formCourier}
                  onChange={(e) => setFormCourier(e.target.value)}
                  placeholder="e.g. Shiprocket, Delhivery, DTDC, Blue Dart..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* AWB / Dispatch Tracking Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  AWB / Consignment Tracking Number
                </label>
                <input
                  type="text"
                  value={formAwb}
                  onChange={(e) => setFormAwb(e.target.value)}
                  placeholder="e.g. 1425129381 or SR148291038"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Direct Courier Tracking Link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Direct Courier Tracking Link (URL)
                  </label>
                  {formAwb && (
                    <button
                      type="button"
                      onClick={handleAutoFillUrl}
                      className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <LinkIcon size={12} /> Auto-generate URL from AWB
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="e.g. https://shiprocket.co/tracking/1425129381"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  💡 Customer ko ye direct link milegi taaki wo 1-click me live status dekh sake (Shiprocket, Delhivery etc.).
                </p>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Fulfillment Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Dispatched in batch 4, express air cargo"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Error / Success Feedback */}
              {saveError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <XCircle size={16} /> {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Dispatch details updated successfully!
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeDispatchModal}
                  disabled={saving}
                  className="btn btn-outline h-[44px] px-5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary h-[44px] px-6 text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Save & Update Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4x6 INCH PRINTABLE FESTIVE POSTCARD MODAL */}
      {cardOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Printer size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Print 4×6 Festive Postcard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Order #{cardOrder.orderNumber} · {cardOrder.giftFestivalTag || 'Festive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm h-[36px] px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} /> Print Postcard (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={() => setCardOrder(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Postcard Body (Target for @media print) */}
            <div className="p-6 flex flex-col items-center">
              <p className="text-xs text-slate-500 mb-4 text-center">
                This 4×6 card will be printed and placed inside the snack box. No price will be shown to the recipient.
              </p>

              {/* POSTCARD CANVAS */}
              <div
                id="festive-card-print"
                className="w-full max-w-[500px] aspect-[6/4] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-lg overflow-hidden border-4 border-double border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40"
              >
                {/* Decorative Icon Watermark */}
                <div className="absolute right-3 top-3 text-5xl opacity-15 pointer-events-none select-none">
                  {getFestiveTitle(cardOrder.giftFestivalTag).icon}
                </div>

                {/* Card Top: Festival Greeting Banner & Logo */}
                <div className="flex items-start justify-between border-b border-amber-300/60 pb-3">
                  <div>
                    <span className="text-xl sm:text-2xl mr-2">
                      {getFestiveTitle(cardOrder.giftFestivalTag).icon}
                    </span>
                    <span
                      className="text-lg sm:text-xl font-black tracking-wide text-amber-950 uppercase"
                    >
                      {getFestiveTitle(cardOrder.giftFestivalTag).title}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black tracking-widest text-primary uppercase">
                      ARON BITES
                    </span>
                    <span className="block text-[9px] text-amber-900 font-semibold tracking-wider uppercase">
                      Authentic Ujjaini Snacks
                    </span>
                  </div>
                </div>

                {/* Card Center: Dear [Recipient] & Personalized Message */}
                <div className="my-auto py-3">
                  <p className="text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wider">
                    Dear {cardOrder.recipientName || cardOrder.customerName},
                  </p>
                  <p className="text-sm sm:text-base font-serif italic text-slate-800 leading-relaxed font-medium">
                    "{cardOrder.giftMessage || 'Wishing you joyous celebrations, good health, and sweet memorable crunch with your loved ones!'}"
                  </p>
                </div>

                {/* Card Bottom: Sender Signature & Artisan Seal */}
                <div className="border-t border-amber-300/60 pt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                      With Warmest Wishes & Love From,
                    </p>
                    <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {cardOrder.senderName || 'Aron Bites Well-Wisher'}
                    </p>
                  </div>

                  <div className="text-right text-[9px] text-slate-500 font-medium">
                    <p className="font-bold text-amber-900">100% Artisanal & Fresh</p>
                    <p>Ujjain (M.P.) · aronbites.com</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-5 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Packing Checklist:</span>
                  <p className="text-[11px] text-slate-500">Insert this printed greeting card into the box. Ensure no invoice is enclosed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-outline btn-sm h-[32px] px-3 font-bold text-slate-700 bg-white"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles for 4x6 Postcard */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #festive-card-print,
          #festive-card-print * {
            visibility: visible !important;
          }
          #festive-card-print {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 148mm !important;
            height: 105mm !important;
            margin: 0 !important;
            padding: 16mm !important;
            box-shadow: none !important;
            border: 3px double #d97706 !important;
            background: #fffdf5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </section>
  );
}
