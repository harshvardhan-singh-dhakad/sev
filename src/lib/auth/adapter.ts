/**
 * Unified Auth Adapter Interface & Migration Placeholder
 *
 * Currently Active: D1-backed session auth (Web Crypto PBKDF2 + HttpOnly Session Cookies)
 * Ready Migration Target: FirebaseAuthAdapter (Firebase Admin SDK / Client Auth with custom claims)
 *
 * To switch to Firebase Auth in the future:
 * 1. Set AUTH_PROVIDER="firebase" in .env
 * 2. Configure NEXT_PUBLIC_FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 3. The FirebaseAuthAdapter verifies ID tokens from Authorization: Bearer <token> or session cookie
 */

import { AdminUser, validateSessionToken } from './session';

export interface AuthSessionResult {
  user: AdminUser | null;
  provider: 'local' | 'firebase';
  error?: string;
}

export interface AuthAdapter {
  verifySession(tokenOrCookie: string): Promise<AdminUser | null>;
  logout(tokenOrCookie: string): Promise<void>;
}

/**
 * Local Auth Implementation (Option 1 - Self-contained SQLite session)
 */
export class LocalAuthAdapter implements AuthAdapter {
  async verifySession(token: string): Promise<AdminUser | null> {
    if (!token) return null;
    return await validateSessionToken(token);
  }

  async logout(token: string): Promise<void> {
    const { destroySession } = await import('./session');
    await destroySession(token);
  }
}

/**
 * Firebase Auth Migration Placeholder
 * Ready for drop-in activation when Firebase Auth is configured.
 */
export class FirebaseAuthAdapter implements AuthAdapter {
  async verifySession(idToken: string): Promise<AdminUser | null> {
    if (!idToken) return null;

    // Placeholder: When Firebase Admin SDK is installed and credentials exist:
    // Verify the token with Firebase's REST API when this adapter is activated.
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    //
    // Map Firebase User & Custom Claims to AdminUser:
    // return {
    //   id: decodedToken.uid,
    //   email: decodedToken.email || '',
    //   name: decodedToken.name || decodedToken.email || 'Admin',
    //   role: (decodedToken.role as any) || 'editor',
    //   totp_enabled: false,
    //   is_active: true,
    //   created_at: new Date().toISOString(),
    // };

    console.warn('[FirebaseAuthAdapter] Firebase Auth adapter placeholder called. Configure Firebase credentials to activate.');
    return null;
  }

  async logout(_token: string): Promise<void> {
    // Firebase client handles signOut(); server invalidates refresh tokens if needed
  }
}

// Factory to resolve current auth adapter
export function getAuthAdapter(): AuthAdapter {
  const provider = process.env.AUTH_PROVIDER || 'local';
  if (provider === 'firebase') {
    return new FirebaseAuthAdapter();
  }
  return new LocalAuthAdapter();
}
