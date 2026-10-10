import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

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

export async function GET(request: NextRequest) {
  try {
    // Admin auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await d1Query(
      `SELECT * FROM samples ORDER BY created_at DESC`
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
    console.error('GET /api/samples error:', error);
    return NextResponse.json({ samples: [] });
  }
}