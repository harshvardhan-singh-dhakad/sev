'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setAdmin } = useAuthStore();

  useEffect(() => {
    let unsubscribe = () => {};

    // Dynamically import Firebase auth to avoid SSR issues
    import('@/lib/firebase').then(({ getFirebaseAuth }) => {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Check admin role via API
          try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.ok ? await res.json() : null;

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: data?.role || 'customer',
            });
            setAdmin(data?.isAdmin || false);
          } catch {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
          }
        } else {
          setUser(null);
          setAdmin(false);
        }
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setAdmin]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            borderRadius: '10px',
            fontSize: '0.9375rem',
            fontWeight: 500,
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
          },
        }}
      />
    </>
  );
}