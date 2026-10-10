import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, company, city, state,
      requirements, estimatedQuantity, message
    } = body;

    if (!name || !phone || !requirements || !estimatedQuantity) {
      return NextResponse.json(
        { error: 'Name, phone, requirements and estimated quantity are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await d1Query(
      `INSERT INTO bulk_enquiries (
        id, name, email, phone, company, city, state,
        requirements, estimated_quantity, message, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, email || null, phone, company || null, city || null, state || null,
        requirements, estimatedQuantity, message || null, 'new',
        now, now
      ]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bulk-enquiries error:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
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
      `SELECT * FROM bulk_enquiries ORDER BY created_at DESC`
    );

    const enquiries = result.results.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      city: row.city,
      state: row.state,
      requirements: row.requirements,
      estimatedQuantity: row.estimated_quantity,
      message: row.message,
      status: row.status,
      assignedTo: row.assigned_to,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('GET /api/bulk-enquiries error:', error);
    return NextResponse.json({ enquiries: [] });
  }
}