import { initializeApp, getApps, cert } from 'firebase-admin/app';

export function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Use environment variables for the service account
  // For Cloudflare Pages, these need to be set in the dashboard
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle newlines in the private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // In development or if not configured, initialize without cert
    // This will fail for token verification but prevents immediate crashes
    console.warn('Firebase Admin variables not set, initializing dummy app');
    return initializeApp({ projectId: 'demo-project' });
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}