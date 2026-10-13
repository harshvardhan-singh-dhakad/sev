import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';
import { listMedia, uploadMedia, deleteMedia } from '@/lib/media';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'media', 'view');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const data = await listMedia(limit, offset);
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/media error:', error);
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'media', 'create');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const mediaItem = await uploadMedia({
      bytes: new Uint8Array(arrayBuffer),
      originalName: file.name,
      altText,
      uploadedBy: user.id,
    });

    return NextResponse.json({ success: true, media: mediaItem }, { status: 201 });
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('POST /api/admin/media error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    assertPermission(user.role, 'media', 'delete');

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    await deleteMedia(mediaId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('DELETE /api/admin/media error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 400 });
  }
}
