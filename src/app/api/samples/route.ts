import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, businessName, address, city, state, pincode,
      productInterests, message
    } = body;

    if (!name || !phone || !address || !city || !state || !pincode || !productInterests) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await d1Query(
      `INSERT INTO samples (
        id, name, email, phone, business_name, address, city, state, pincode,
        product_interests, message, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, email || null, phone, businessName || null, address, city, state, pincode,
        productInterests, message || null, 'requested',
        now, now
      ]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/samples error:', error);
    return NextResponse.json({ error: 'Failed to request sample' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'enquiries', 'view');

    const result = await d1Query(
      `SELECT * FROM samples ORDER BY created_at DESC LIMIT 250`
    );

    const samples = result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      businessName: row.business_name,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      productInterests: row.product_interests,
      message: row.message,
      status: row.status,
      trackingUrl: row.tracking_url,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ samples });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/samples error:', error);
    return NextResponse.json({ error: 'Failed to load sample requests' }, { status: 500 });
  }
}
