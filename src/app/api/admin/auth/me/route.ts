import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { PERMISSION_MATRIX } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const user = await getAuthenticatedAdmin();

    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const permissions = PERMISSION_MATRIX[user.role] || null;

    return NextResponse.json({
      user,
      permissions,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 });
  }
}
