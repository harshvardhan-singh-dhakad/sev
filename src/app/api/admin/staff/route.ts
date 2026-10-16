import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'staff', 'view');
    const result = await d1Query(
      `SELECT id, name, email, role, is_active, last_login_at, created_at
         FROM users ORDER BY created_at DESC LIMIT 250`
    );
    return NextResponse.json({ staff: result.results.map((row: Record<string, unknown>) => ({
      id: row.id, name: row.name, email: row.email, role: row.role,
      isActive: Boolean(row.is_active), lastLoginAt: row.last_login_at, createdAt: row.created_at,
    })) });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('GET /api/admin/staff error:', error);
    return NextResponse.json({ error: 'Failed to load staff' }, { status: 500 });
  }
}
