import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Initialize Firebase Admin (implement this utility)
    const adminApp = initFirebaseAdmin();
    const decodedToken = await getAuth(adminApp).verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check D1 database for user role
    const result = await d1Query(
      'SELECT * FROM customers WHERE firebase_uid = ? LIMIT 1',
      [uid]
    );

    if (result.results.length === 0) {
      // User doesn't exist in our DB yet, create them or return default
      // For now, return default customer
      return NextResponse.json({ 
        role: 'customer', 
        isAdmin: false 
      });
    }

    const user = result.results[0] as Record<string, unknown>;
    
    // For demo purposes, you can hardcode an admin email here
    // e.g., if (decodedToken.email === 'admin@rasvat.com') return isAdmin: true
    const isAdmin = user.role === 'admin' || decodedToken.email === 'admin@rasvat.com';

    return NextResponse.json({ 
      role: user.role || 'customer',
      isAdmin
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ error: 'Authentication failed', isAdmin: false }, { status: 401 });
  }
}