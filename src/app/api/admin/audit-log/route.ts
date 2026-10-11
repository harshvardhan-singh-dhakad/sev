import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { listAuditLogs } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'audit_logs', 'view');

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const data = listAuditLogs({ entityType, action, limit, offset });
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/audit-log error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
