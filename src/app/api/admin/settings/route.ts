import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { getAdminStoreSettings, updateAdminStoreSettings } from '@/lib/settings';

export async function GET() {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'settings', 'view');

    const settings = await getAdminStoreSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'settings', 'edit');

    const body = await request.json();
    const updated = await updateAdminStoreSettings(body, user.id, user.name);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
