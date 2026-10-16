'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { reload, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useAuthStore } from '@/lib/store';
import { getFirebaseAuth, logoutUser } from '@/lib/firebase';
import toast from 'react-hot-toast';
import {
  ArrowRight, BadgeCheck, ChevronDown, CircleHelp, Clock3, Gift, Heart,
  House, LogOut, MapPin, Package, PackageCheck, Pencil, PhoneCall,
  RefreshCw, ShieldCheck, ShoppingBag, Sparkles, Truck, UserRound,
} from 'lucide-react';

interface AccountOrderItem {
  id: string;
  product_name: string;
  pack_label: string;
  weight_grams: number;
  unit_price: number;
  qty: number;
  line_total: number;
}

interface AccountOrder {
  id: string;
  order_number: string;
  public_token: string;
  status: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_landmark: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paid_at: string | null;
  tracking_courier: string | null;
  tracking_awb: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
  items: AccountOrderItem[];
}

type AccountTab = 'overview' | 'orders' | 'profile';

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed', icon: ShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: BadgeCheck },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'On the way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Heart },
];

function CuteSnackMascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      viewBox="0 0 240 210"
      role="img"
      aria-label="A cheerful little sev mascot waving hello"
      className={small ? 'h-24 w-28' : 'h-40 w-48 sm:h-48 sm:w-56'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="120" cy="190" rx="74" ry="10" fill="#7c2d12" opacity=".12" />
      <path d="M44 119c0-37 34-69 76-69s76 32 76 69v33c0 8-7 14-15 14H59c-8 0-15-6-15-14z" fill="#f59e0b" />
      <path d="M47 126c12 9 27 13 42 10 12-2 21-10 33-10s21 8 33 10c15 3 30-1 42-10v25c0 8-7 15-15 15H62c-8 0-15-7-15-15z" fill="#d97706" />
      <path d="M61 112c9-26 32-46 59-46s50 20 59 46c-12 5-21 4-31-1-10-5-18-8-28-1-10-7-18-4-28 1-10 5-19 6-31 1" fill="#fbbf24" />
      <path d="M75 94c9-9 16-20 19-32M101 76c7-13 8-22 8-33M130 75c2-13 0-23-4-33M153 83c5-11 12-19 22-25M171 104c8-5 17-8 27-8M67 107c-8-6-17-9-27-9" fill="none" stroke="#fcd34d" strokeWidth="8" strokeLinecap="round" />
      <path d="M54 124c-17-3-28-14-31-30M186 117c18-3 29-15 31-31" fill="none" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
      <circle cx="23" cy="92" r="7" fill="#fbbf24" /><circle cx="216" cy="84" r="7" fill="#fbbf24" />
      <ellipse cx="95" cy="119" rx="5" ry="7" fill="#422006" /><ellipse cx="145" cy="119" rx="5" ry="7" fill="#422006" />
      <circle cx="78" cy="132" r="7" fill="#fb7185" opacity=".7" /><circle cx="162" cy="132" r="7" fill="#fb7185" opacity=".7" />
      <path d="M108 134c7 9 17 9 24 0" fill="none" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
      <path d="M81 160v16M159 160v16" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
      <path d="M66 177h27M147 177h27" stroke="#7c2d12" strokeWidth="8" strokeLinecap="round" />
      <path d="m184 41 4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#fbbf24" />
      <path d="m49 51 3-6 3 6 6 3-6 3-3 6-3-6-6-3z" fill="#fb923c" />
    </svg>
  );
}

function formatMoney(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function getStatus(status: string) {
  const map: Record<string, { label: string; tone: string }> = {
    pending_payment: { label: 'Payment pending', tone: 'bg-amber-100 text-amber-900' },
    confirmed: { label: 'Confirmed', tone: 'bg-emerald-100 text-emerald-800' },
    packed: { label: 'Packed with care', tone: 'bg-sky-100 text-sky-800' },
    shipped: { label: 'On the way', tone: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', tone: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', tone: 'bg-rose-100 text-rose-800' },
    refunded: { label: 'Refunded', tone: 'bg-slate-100 text-slate-700' },
    expired: { label: 'Expired', tone: 'bg-slate-100 text-slate-700' },
    needs_attention: { label: 'We are checking this', tone: 'bg-orange-100 text-orange-800' },
  };
  return map[status] || { label: 'Being prepared', tone: 'bg-stone-100 text-stone-700' };
}

function getStatusStep(status: string): number {
  const index = ['pending_payment', 'confirmed', 'packed', 'shipped', 'delivered'].indexOf(status);
  return index < 0 ? -1 : index;
}

function OrderProgress({ status }: { status: string }) {
  const currentStep = getStatusStep(status);
  if (currentStep < 0) return null;
  return (
    <div className="mt-5 grid grid-cols-5">
      {STATUS_STEPS.map(({ key, label, icon: Icon }, index) => {
        const done = index <= currentStep;
        return (
          <div className="relative flex flex-col items-center gap-2 text-center" key={key}>
            {index < STATUS_STEPS.length - 1 && <span className={`absolute left-1/2 top-4 h-0.5 w-full ${index < currentStep ? 'bg-emerald-400' : 'bg-stone-200'}`} aria-hidden="true" />}
            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${done ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
              <Icon size={14} />
            </span>
            <span className={`text-[10px] leading-tight sm:text-xs ${done ? 'font-semibold text-stone-700' : 'text-stone-400'}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: AccountOrder }) {
  const status = getStatus(order.status);
  const itemCount = order.items.reduce((count, item) => count + item.qty, 0);
  const address = [order.shipping_line1, order.shipping_line2, order.shipping_landmark, order.shipping_city, order.shipping_state, order.shipping_pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_12px_40px_-28px_rgba(124,45,18,.35)]">
      <div className="flex flex-col gap-4 border-b border-stone-100 bg-gradient-to-r from-orange-50/90 to-amber-50/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-stone-900">{order.order_number}</h3>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.tone}`}>{status.label}</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">Placed {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Order total</p><p className="text-lg font-black text-amber-900">{formatMoney(order.total)}</p></div>
          <Link href={`/order/${encodeURIComponent(order.public_token)}`} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-900">
            Track order <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item) => (
              <p key={item.id} className="text-sm font-medium text-stone-800">{item.product_name} <span className="font-normal text-stone-500">· {item.pack_label} × {item.qty}</span></p>
            ))}
            {order.items.length > 2 && <p className="text-xs text-stone-500">and {order.items.length - 2} more items</p>}
          </div>
          {order.tracking_courier && <p className="inline-flex items-center gap-1.5 text-xs text-stone-600"><Truck size={14} className="text-amber-700" />{order.tracking_courier}{order.tracking_awb ? ` · ${order.tracking_awb}` : ''}</p>}
        </div>
        <OrderProgress status={order.status} />
        <details className="group mt-5 border-t border-stone-100 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-amber-900">
            Full order details <ChevronDown size={16} className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-[10px] font-black uppercase tracking-wider text-stone-400">Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-xs"><span className="text-stone-600">{item.product_name} · {item.pack_label} × {item.qty}</span><span className="font-semibold text-stone-800">{formatMoney(item.line_total)}</span></div>)}
              </div>
              <div className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-xs">
                <div className="flex justify-between text-stone-500"><span>Items subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Delivery</span><span>{order.shipping ? formatMoney(order.shipping) : 'Free'}</span></div>
                <div className="flex justify-between pt-1 font-bold text-stone-900"><span>Total</span><span>{formatMoney(order.total)}</span></div>
              </div>
            </div>
            <div>
              <h4 className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-stone-400"><MapPin size={12} />Delivery address</h4>
              <p className="text-xs leading-5 text-stone-600">{address || 'Address unavailable'}</p>
              {order.paid_at && <p className="mt-3 text-xs text-emerald-700">Payment received {formatDate(order.paid_at)}</p>}
              {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline underline-offset-2">Open courier tracking <ArrowRight size={12} /></a>}
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout, setUser } = useAuthStore();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const nameDraft = nameOverride ?? user?.displayName ?? '';

  const loadOrders = useCallback(async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/account/orders', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const data = await response.json();
      if (response.status === 403 && data.code === 'email_verification_required') {
        setOrders([]);
        setTotalOrderCount(0);
        setEmailVerificationRequired(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Could not load orders');
      setEmailVerificationRequired(false);
      setOrders(data.orders || []);
      setTotalOrderCount(Number(data.totalOrders ?? data.orders?.length ?? 0));
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Could not load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void loadOrders();
  }, [user, loadOrders]);

  const handleResendVerification = async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    setVerificationBusy(true);
    try {
      await sendEmailVerification(currentUser);
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send the verification email.');
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleCheckVerification = async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    setVerificationBusy(true);
    try {
      await reload(currentUser);
      if (!currentUser.emailVerified) {
        toast.error('Email is not verified yet. Open the link in your inbox first.');
        return;
      }
      await currentUser.getIdToken(true);
      setEmailVerificationRequired(false);
      await loadOrders();
      toast.success('Email verified. Your orders are ready.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not refresh your account.');
    } finally {
      setVerificationBusy(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) router.push('/login?redirect=/account');
  }, [user, isLoading, router]);

  const inProgressCount = orders.filter((order) => ['pending_payment', 'confirmed', 'packed', 'shipped', 'needs_attention'].includes(order.status)).length;
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length;
  const latestAddress = orders[0]
    ? [orders[0].shipping_line1, orders[0].shipping_line2, orders[0].shipping_city, orders[0].shipping_state, orders[0].shipping_pincode].filter(Boolean).join(', ')
    : '';
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const handleSaveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !nameDraft.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    setSavingName(true);
    try {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) throw new Error('Please sign in again to update your profile.');
      await updateProfile(currentUser, { displayName: nameDraft.trim() });
      setUser({ ...user, displayName: nameDraft.trim() });
      setNameOverride(null);
      toast.success('Your profile has been updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      logout();
      toast.success('Signed out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (isLoading || !user) {
    return <div className="flex min-h-[70vh] items-center justify-center bg-[#fffaf4]"><div className="flex flex-col items-center gap-3 text-sm font-medium text-stone-500"><span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700/20 border-t-amber-700" />Setting your table…</div></div>;
  }

  const tabs: { key: AccountTab; label: string; icon: typeof House }[] = [
    { key: 'overview', label: 'Overview', icon: House },
    { key: 'orders', label: 'My orders', icon: PackageCheck },
    { key: 'profile', label: 'My profile', icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf4] px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 p-6 shadow-[0_18px_60px_-42px_rgba(124,45,18,.5)] sm:p-9">
          <div className="absolute -right-8 -top-12 -z-10 h-56 w-56 rounded-full bg-white/55 blur-3xl" />
          <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <div className="max-w-2xl text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900"><Sparkles size={13} /> Your Rasvat account</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-amber-950 sm:text-4xl">Namaste, {user.displayName?.split(' ')[0] || 'snack lover'}!</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-amber-950/70">Your orders, delivery updates and account details are all together here. Our little sev buddy is happy you came by.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button type="button" onClick={() => setActiveTab('orders')} className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-900"><PackageCheck size={16} />See my orders</button>
                <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white/80 px-4 py-2.5 text-sm font-bold text-amber-950 transition hover:bg-white"><ShoppingBag size={16} />Shop snacks</Link>
              </div>
            </div>
            <div className="shrink-0 animate-[float_4s_ease-in-out_infinite]"><CuteSnackMascot /></div>
          </div>
          <div className="absolute bottom-5 right-7 hidden rounded-full border border-white bg-white/80 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm md:block">Made fresh, packed with love ✨</div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total orders', value: totalOrderCount, icon: ShoppingBag, color: 'bg-amber-100 text-amber-800' },
            { label: 'On their way', value: inProgressCount, icon: Truck, color: 'bg-sky-100 text-sky-800' },
            { label: 'Delivered to you', value: deliveredCount, icon: Heart, color: 'bg-rose-100 text-rose-800' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon size={20} /></span>
              <div><p className="text-2xl font-black leading-none text-stone-900">{ordersLoading ? '—' : value}</p><p className="mt-1 text-xs font-medium text-stone-500">{label}</p></div>
            </div>
          ))}
        </div>

        {emailVerificationRequired && (
          <section className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div><h2 className="text-sm font-black text-amber-950">Verify your email to see your orders</h2><p className="mt-1 text-xs leading-5 text-amber-900/75">We’ll only show order details linked to your verified account email.</p></div>
            <div className="flex shrink-0 gap-2"><button type="button" onClick={handleResendVerification} disabled={verificationBusy} className="rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-950 disabled:opacity-50">Send email again</button><button type="button" onClick={handleCheckVerification} disabled={verificationBusy} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50"><RefreshCw size={13} className={verificationBusy ? 'animate-spin' : ''} />I verified</button></div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-orange-100 bg-white p-1.5 shadow-sm">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setActiveTab(key)} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeTab === key ? 'bg-amber-800 text-white shadow-sm' : 'text-stone-600 hover:bg-amber-50 hover:text-amber-950'}`}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' ? (
              <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Your details</p><h2 className="mt-1 text-xl font-black">My profile</h2><p className="mt-1 text-sm text-stone-500">Keep your account name up to date.</p></div>
                  <span className="rounded-2xl bg-amber-50 p-3 text-amber-800"><UserRound size={20} /></span>
                </div>
                <form onSubmit={handleSaveName} className="max-w-xl space-y-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Full name
                    <input required maxLength={80} value={nameDraft} onChange={(event) => setNameOverride(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium normal-case tracking-normal text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" placeholder="Your name" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Email address
                    <input readOnly value={user.email || ''} className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-4 text-sm font-medium normal-case tracking-normal text-stone-500" />
                    <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-stone-400">Your sign-in email is managed by your Google or email account.</span>
                  </label>
                  <button type="submit" disabled={savingName || nameDraft.trim() === (user.displayName || '')} className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50">{savingName ? <RefreshCw size={16} className="animate-spin" /> : <Pencil size={15} />}Save profile</button>
                </form>
                <div className="mt-8 rounded-2xl bg-[#fffaf4] p-4 sm:p-5">
                  <h3 className="inline-flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-amber-800" />Recent delivery address</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{ordersLoading ? 'Loading your latest delivery address…' : latestAddress || 'Your delivery address will appear here after your first order.'}</p>
                  <Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline">Place an order <ArrowRight size={13} /></Link>
                </div>
              </section>
            ) : activeTab === 'orders' ? (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3 px-1"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Your Rasvat journey</p><h2 className="mt-1 text-2xl font-black">My orders</h2></div><button type="button" onClick={() => void loadOrders()} disabled={ordersLoading} className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-orange-50 disabled:opacity-50"><RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />Refresh</button></div>
                {ordersError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{ordersError} <button type="button" onClick={() => void loadOrders()} className="ml-1 font-bold underline">Try again</button></div>}
                {ordersLoading ? <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center text-sm text-stone-500"><RefreshCw size={22} className="mx-auto mb-3 animate-spin text-amber-700" />Finding your orders…</div> : orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : !ordersError ? (
                  <div className="rounded-3xl border border-orange-100 bg-white px-6 py-8 text-center shadow-sm sm:px-10">
                    <div className="flex justify-center"><CuteSnackMascot small /></div>
                    <h3 className="mt-2 text-xl font-black">Your snack story starts here</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">When you place an order with this email address, you’ll find its status, delivery progress and full details right here.</p>
                    <Link href="/shop" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-5 py-3 text-sm font-bold text-white hover:bg-amber-900">Explore the shop <ArrowRight size={15} /></Link>
                  </div>
                ) : null}
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3 px-1"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Fresh from your kitchen table</p><h2 className="mt-1 text-2xl font-black">Recent orders</h2></div>{orders.length > 3 && <button type="button" onClick={() => setActiveTab('orders')} className="text-xs font-bold text-amber-800 hover:underline">See all {orders.length}</button>}</div>
                {ordersError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{ordersError} <button type="button" onClick={() => void loadOrders()} className="ml-1 font-bold underline">Try again</button></div>}
                {ordersLoading ? <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center text-sm text-stone-500"><RefreshCw size={22} className="mx-auto mb-3 animate-spin text-amber-700" />Loading your orders…</div> : recentOrders.length ? recentOrders.map((order) => <OrderCard key={order.id} order={order} />) : !ordersError ? (
                  <div className="flex flex-col items-center rounded-3xl border border-orange-100 bg-white px-6 py-8 text-center shadow-sm sm:flex-row sm:text-left">
                    <CuteSnackMascot small />
                    <div className="sm:ml-4"><h3 className="text-lg font-black">Your first sev treat is waiting!</h3><p className="mt-1 text-sm leading-6 text-stone-500">Once you order, tracking and order details will show up right here.</p><Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800">Browse the shop <ArrowRight size={13} /></Link></div>
                  </div>
                ) : null}
              </section>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Snack club member</p><h2 className="mt-1 truncate text-lg font-black">{user.displayName || 'Rasvat friend'}</h2><p className="mt-1 truncate text-xs text-stone-500">{user.email}</p></div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100 text-lg font-black text-amber-900">{(user.displayName || user.email || 'R')[0].toUpperCase()}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"><ShieldCheck size={15} />Your account is signed in</div>
              <button type="button" onClick={() => setActiveTab('profile')} className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">Edit profile <Pencil size={13} /></button>
            </section>

            <section className="rounded-3xl bg-amber-950 p-5 text-amber-50 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold"><CircleHelp size={17} className="text-amber-300" />Need a little help?</div>
              <p className="mt-2 text-xs leading-5 text-amber-100/75">We’re happy to help with an order, delivery or anything tasty.</p>
              <a href="tel:+919876543210" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-amber-400"><PhoneCall size={14} />Call Rasvat support</a>
              <Link href="/track-order" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-700 px-3 py-2.5 text-xs font-bold text-amber-50 transition hover:bg-amber-900"><Clock3 size={14} />Track an order</Link>
            </section>

            <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
              <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-2 text-rose-500 shadow-sm"><Gift size={18} /></span><div><p className="text-sm font-black">A treat for later?</p><p className="text-[11px] text-stone-500">Find your next favourite</p></div></div>
              <Link href="/shop" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">Explore all snacks <ArrowRight size={13} /></Link>
            </section>

            <button type="button" onClick={handleSignOut} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><LogOut size={15} />Sign out</button>
          </aside>
        </div>

        <footer className="border-t border-orange-100 pt-5 text-center text-[11px] text-stone-400">Thanks for being part of the Rasvat family. Made fresh, packed with love. <span aria-hidden="true">♥</span></footer>
      </div>
      <style jsx>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
    </div>
  );
}
