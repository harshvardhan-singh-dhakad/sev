'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { logoutUser } from '@/lib/firebase';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Heart,
  LogOut,
  Shield,
  ArrowRight,
  PackageCheck,
  PhoneCall,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

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
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center overflow-hidden text-amber-800 text-2xl font-serif font-bold">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                {user.displayName || 'Rasvat Customer'}
              </h1>
              <p className="text-sm text-stone-600">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="w-3 h-3" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/shop"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-900">Explore Catalog</h3>
            <p className="mt-1 text-xs text-stone-500">Order authentic Sev, Namkeen & Gift Packs</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800">
              Browse products <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/bulk-orders"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-900">Wholesale / Bulk</h3>
            <p className="mt-1 text-xs text-stone-500">Request bulk pricing for weddings & retail</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800">
              Submit Enquiry <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/samples"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-900">Taste Sample Kit</h3>
            <p className="mt-1 text-xs text-stone-500">Order verified commercial sample box</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800">
              Request Samples <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Support Section */}
        <div className="bg-amber-900 text-amber-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Need assistance with your order?</h3>
            <p className="text-xs text-amber-200/80 mt-1">Our dedicated support desk is available Monday to Saturday (9 AM - 7 PM).</p>
          </div>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
