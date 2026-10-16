import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'sales', 'view');

    const result = await d1Query(
      `SELECT id, email, role, created_at, updated_at
         FROM customers ORDER BY created_at DESC LIMIT 500`
    );
    return NextResponse.json({ customers: result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
