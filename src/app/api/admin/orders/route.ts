import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Execute } from '@/lib/d1';
import { getAuthenticatedAdmin } from '@/lib/auth/session';
import { assertPermission } from '@/lib/auth/permissions';

const ALLOWED_STATUSES = [
  'pending_payment',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'needs_attention',
] as const;

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'sales', 'view');

    const ordersResult = await d1Query(
      `SELECT id, order_number, public_token, status, customer_name, customer_phone, customer_email,
              shipping_line1, shipping_line2, shipping_landmark, shipping_city, shipping_state, shipping_pincode,
              subtotal, shipping, total, razorpay_order_id, paid_at,
              tracking_courier, tracking_awb, tracking_url, notes,
              is_gift, sender_name, sender_phone, sender_email, recipient_name, gift_message, gift_festival_tag, hide_price_slip,
              created_at, updated_at
         FROM orders ORDER BY created_at DESC LIMIT 250`
    );

    const orders = ordersResult.results as Array<Record<string, unknown>>;
    const itemsByOrderId: Record<string, Array<{
      id: string;
      productName: string;
      packLabel: string;
      weightGrams: number;
      unitPricePaise: number;
      qty: number;
      lineTotalPaise: number;
    }>> = {};

    if (orders.length > 0) {
      try {
        const itemsResult = await d1Query(
          `SELECT id, order_id, product_name, pack_label, weight_grams, unit_price, qty, line_total
             FROM order_items ORDER BY unit_price DESC`
        );
        for (const row of itemsResult.results as Array<Record<string, unknown>>) {
          const orderId = String(row.order_id);
          if (!itemsByOrderId[orderId]) itemsByOrderId[orderId] = [];
          itemsByOrderId[orderId].push({
            id: String(row.id),
            productName: String(row.product_name || ''),
            packLabel: String(row.pack_label || ''),
            weightGrams: Number(row.weight_grams || 0),
            unitPricePaise: Number(row.unit_price || 0),
            qty: Number(row.qty || 1),
            lineTotalPaise: Number(row.line_total || 0),
          });
        }
      } catch (err) {
        console.warn('Could not load order_items for admin orders:', err);
      }
    }

    return NextResponse.json({
      orders: orders.map((row) => ({
        id: row.id,
        orderNumber: row.order_number,
        publicToken: row.public_token,
        status: row.status,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email,
        shippingAddress: {
          line1: row.shipping_line1 || '',
          line2: row.shipping_line2 || '',
          landmark: row.shipping_landmark || '',
          city: row.shipping_city || '',
          state: row.shipping_state || '',
          pincode: row.shipping_pincode || '',
        },
        city: row.shipping_city,
        state: row.shipping_state,
        subtotalPaise: row.subtotal,
        shippingPaise: row.shipping,
        totalPaise: row.total,
        razorpayOrderId: row.razorpay_order_id,
        paidAt: row.paid_at,
        trackingCourier: row.tracking_courier || '',
        trackingAwb: row.tracking_awb || '',
        trackingUrl: row.tracking_url || '',
        notes: row.notes || '',
        isGift: Boolean(row.is_gift),
        senderName: (row.sender_name as string) || '',
        senderPhone: (row.sender_phone as string) || '',
        senderEmail: (row.sender_email as string) || '',
        recipientName: (row.recipient_name as string) || '',
        giftMessage: (row.gift_message as string) || '',
        giftFestivalTag: (row.gift_festival_tag as string) || '',
        hidePriceSlip: row.hide_price_slip !== 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: itemsByOrderId[String(row.id)] || [],
      })),
    });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    assertPermission(admin.role, 'sales', 'edit');

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { orderId, status, trackingCourier, trackingAwb, trackingUrl, notes } = body as {
      orderId?: string;
      status?: string;
      trackingCourier?: string;
      trackingAwb?: string;
      trackingUrl?: string;
      notes?: string;
    };

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    if (status && !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    // Verify order exists
    const existing = await d1Query(
      `SELECT id, order_number, status, tracking_courier, tracking_awb, tracking_url, notes
         FROM orders WHERE id = ? LIMIT 1`,
      [orderId]
    );

    if (existing.results.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentOrder = existing.results[0] as Record<string, unknown>;

    // Sanitize tracking URL
    let formattedUrl: string | null = null;
    if (typeof trackingUrl === 'string' && trackingUrl.trim().length > 0) {
      const trimmed = trackingUrl.trim();
      formattedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    } else if (trackingUrl === '') {
      formattedUrl = null;
    } else {
      formattedUrl = (currentOrder.tracking_url as string | null) ?? null;
    }

    const newCourier = typeof trackingCourier === 'string'
      ? (trackingCourier.trim() || null)
      : (currentOrder.tracking_courier as string | null);

    const newAwb = typeof trackingAwb === 'string'
      ? (trackingAwb.trim() || null)
      : (currentOrder.tracking_awb as string | null);

    const newStatus = status ? status : (currentOrder.status as string);

    const newNotes = typeof notes === 'string'
      ? (notes.trim() || null)
      : (currentOrder.notes as string | null);

    const now = new Date().toISOString();

    await d1Execute(
      `UPDATE orders
          SET status = ?,
              tracking_courier = ?,
              tracking_awb = ?,
              tracking_url = ?,
              notes = ?,
              updated_at = ?
        WHERE id = ?`,
      [newStatus, newCourier, newAwb, formattedUrl, newNotes, now, orderId]
    );

    // Record audit event in order_events
    try {
      const eventId = crypto.randomUUID();
      const eventType = newStatus === 'shipped' ? 'shipped' : 'dispatch_updated';
      const auditNote = `Fulfillment updated by ${admin.email || admin.name}: Status=${newStatus}, Courier=${newCourier || 'N/A'}, AWB=${newAwb || 'N/A'}, URL=${formattedUrl || 'N/A'}`;
      await d1Execute(
        `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [eventId, orderId, eventType, admin.email || 'admin', auditNote, now]
      );
    } catch (auditErr) {
      console.warn('Failed to insert order audit event:', auditErr);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status: newStatus,
        trackingCourier: newCourier,
        trackingAwb: newAwb,
        trackingUrl: formattedUrl,
        notes: newNotes,
        updatedAt: now,
      },
    });
  } catch (error) {
    if ((error as { status?: number })?.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('PATCH /api/admin/orders error:', error);
    return NextResponse.json({ error: 'Failed to update order fulfillment' }, { status: 500 });
  }
}
