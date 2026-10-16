import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { execute, queryFirst } from '@/lib/db';
import {
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

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (email.length > 254 || password.length > 1024) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Cloudflare sets this at the edge. Do not trust client-controlled X-Forwarded-For
    // for login throttling because an attacker can rotate that value per request.
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitKey = `${ip}:${cleanEmail}`;

    // 1. Check Rate Limit
    const rateLimit = await checkLoginRateLimit(rateLimitKey);
    if (rateLimit.isLocked) {
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed attempts. Please try again in ${rateLimit.lockTimeRemainingMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    // 2. Query User
    const user = await queryFirst<{
      id: string;
      email: string;
      password_hash: string;
      salt: string;
      name: string;
      role: string;
      totp_enabled: number;
    }>('SELECT * FROM users WHERE email = ? AND is_active = 1', [cleanEmail]);

    if (!user) {
      await recordLoginAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      await recordLoginAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4. Success -> Reset Rate Limit & Update Login Timestamp
    await recordLoginAttempt(rateLimitKey, true);
    const now = new Date().toISOString();
    await execute('UPDATE users SET last_login_at = ? WHERE id = ?', [now, user.id]);

    // 5. Create Session
    const userAgent = request.headers.get('user-agent') || undefined;
    const sessionToken = await createSession(user.id, userAgent, ip);

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
    await logAuditEvent({
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
