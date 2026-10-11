import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCOa5VcYNhLny4vFZpxz9eliNH6i6XH0qQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'sevweb.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sevweb',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'sevweb.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '435450144727',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:435450144727:web:5ff8c630dea1380fa00d92',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-V2GZ080D89',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Google Auth Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const firebaseAuth = getFirebaseAuth();
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

/**
 * Sign in using Email & Password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const firebaseAuth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  return credential.user;
}

/**
 * Create new account using Email & Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const firebaseAuth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  await sendPasswordResetEmail(firebaseAuth, email.trim());
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  await firebaseSignOut(firebaseAuth);
}

export { GoogleAuthProvider, EmailAuthProvider };