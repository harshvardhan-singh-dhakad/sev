'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Authentication failed');
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      toast.error('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(211, 47, 47, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(255, 206, 27, 0.08) 0%, transparent 40%)
        `,
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/aronbites-logo.svg"
              alt="Aron Bites"
              width={140}
              height={44}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary-faint text-primary-dark mb-3">
            <ShieldCheck size={14} />
            <span>Admin Control Center</span>
          </div>
          <h1
            className="text-2xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Aron Bites Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage catalog, orders, and store operations
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 bg-white border border-border shadow-xl space-y-6"
        >
          {errorMessage && (
            <div
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 leading-relaxed"
              role="alert"
            >
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Work Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aronbites.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border text-center text-xs text-gray-500">
            Protected by multi-factor rate limiting and append-only audit logging.
          </div>
        </div>
      </div>
    </div>
  );
}
