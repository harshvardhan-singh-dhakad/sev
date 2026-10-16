import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { getAdminHomepageBanners, saveHomepageBanners } from '@/lib/homepage-banners';

export async function GET() {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(user.role, 'content', 'view');
    return NextResponse.json({ banners: await getAdminHomepageBanners() });
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('GET /api/admin/banners error:', error);
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(user.role, 'content', 'edit');
    const body = await request.json();
    const banners = await saveHomepageBanners(body.banners, user.id, user.name);
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('PUT /api/admin/banners error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save banners' }, { status: 400 });
  }
}
