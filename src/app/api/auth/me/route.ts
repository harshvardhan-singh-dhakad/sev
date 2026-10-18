import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

interface FirebaseLookupResponse {
  users?: Array<{ localId?: string; email?: string }>;
}

/**
 * Firebase Admin SDK depends on Node-only modules and cannot run in a Worker.
 * Firebase's Identity Toolkit endpoint validates the ID token server-side; the
 * web API key identifies the Firebase project and is not a secret.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!apiKey) {
      return NextResponse.json({ error: 'Firebase authentication is not configured' }, { status: 503 });
    }

    const verification = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!verification.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const identity = await verification.json() as FirebaseLookupResponse;
    const firebaseUser = identity.users?.[0];
    if (!firebaseUser?.localId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await d1Query<{ role?: string }>(
      'SELECT role FROM customers WHERE firebase_uid = ? LIMIT 1',
      [firebaseUser.localId]
    );
    const role = result.results[0]?.role || 'customer';
    return NextResponse.json({
      role,
      isAdmin: role === 'admin' || firebaseUser.email === 'admin@rasvat.com' || firebaseUser.email === 'admin@aronbites.com',
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ error: 'Authentication failed', isAdmin: false }, { status: 401 });
  }
}
