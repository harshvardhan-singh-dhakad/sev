'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { user } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      toast.success(`Welcome, ${u.displayName || 'Food Lover'}!`);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const u = await signInWithEmail(email, password);
        toast.success(`Welcome back, ${u.displayName || u.email}!`);
        router.push(redirectUrl);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const u = await signUpWithEmail(email, password, name.trim());
        toast.success(`Account created! Welcome, ${u.displayName || u.email}!`);
        router.push(redirectUrl);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
        toast.success('Password reset email sent. Check your inbox.');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      let msg = 'Authentication failed. Please check credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="font-serif text-3xl font-bold tracking-tight text-amber-950 group-hover:text-amber-700 transition">
              RASVAT
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-600" />
          </Link>
          <h2 className="mt-4 text-2xl font-serif font-bold text-stone-900">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your Rasvat account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {mode === 'signin' && 'Authentic Ujjaini & Malwi Namkeen delivered fresh.'}
            {mode === 'signup' && 'Join thousands of authentic sev lovers across India.'}
            {mode === 'forgot' && 'Enter your registered email and we will send a reset link.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-stone-200/60 rounded-2xl border border-stone-200/80 sm:px-10 relative">
          {/* Mode Switch Tabs (Sign In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex rounded-lg bg-stone-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  mode === 'signin'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  mode === 'signup'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Google Sign-In Button */}
          {mode !== 'forgot' && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-stone-300 rounded-xl text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition shadow-sm disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-stone-500 font-medium">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Reset Feedback */}
          {mode === 'forgot' && resetSent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-stone-900">Check your email</h3>
              <p className="mt-1 text-sm text-stone-600">
                We sent a password reset link to <strong className="text-stone-800">{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setResetSent(false);
                }}
                className="mt-6 inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field for Sign Up */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Password field */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-medium text-amber-700 hover:text-amber-800"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 shadow-md shadow-amber-800/20 transition disabled:opacity-60 text-sm mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Cancel forgot password */}
              {mode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-xs text-stone-500 hover:text-stone-800 font-medium"
                  >
                    Cancel and return to Sign In
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Perks footer */}
          <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Track Orders in real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Secure 100% data privacy</span>
            </div>
          </div>
        </div>

        {/* Link to Staff / Admin Login */}
        <div className="mt-6 text-center text-xs text-stone-500">
          <span>Are you an administrator or store staff? </span>
          <Link
            href="/admin/login"
            className="font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-4"
          >
            Access Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}

