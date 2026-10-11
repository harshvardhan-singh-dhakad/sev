import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordLoginAttempt,
  createSession,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `${ip}:${cleanEmail}`;

    // 1. Check Rate Limit
    const rateLimit = checkLoginRateLimit(rateLimitKey);
    if (rateLimit.isLocked) {
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed attempts. Please try again in ${rateLimit.lockTimeRemainingMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    // 2. Query User
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(cleanEmail) as {
      id: string;
      email: string;
      password_hash: string;
      salt: string;
      name: string;
      role: string;
      totp_enabled: number;
    } | undefined;

    if (!user) {
      recordLoginAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Verify Password
    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      recordLoginAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4. Success -> Reset Rate Limit & Update Login Timestamp
    recordLoginAttempt(rateLimitKey, true);
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);

    // 5. Create Session
    const userAgent = request.headers.get('user-agent') || undefined;
    const sessionToken = createSession(user.id, userAgent, ip);

    // 6. Set Secure HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // 7. Audit Log
    logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'login_success',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        totp_enabled: Boolean(user.totp_enabled),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
