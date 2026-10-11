import { test, expect } from '@playwright/test';
import { getDb } from '../src/lib/db';
import {
  createPendingOrder,
  expireOrder,
  generateOrderNumber,
  getOrderByToken,
  listOrders,
  markOrderPaid,
  markPaymentFailed,
  normalizePhoneNumber,
  recordRefund,
  recordWebhookEvent,
  trackOrder,
} from '../src/lib/orders';

test.describe('Phase R1 — Razorpay & D1 Order Engine Unit Tests', () => {
  const testVariantId = 'ratlami-sev-250g';
  const testProductId = 'ratlami-sev';
  const stockVariantId = 'test-limited-stock-variant';

  test.beforeAll(async () => {
    const db = getDb();

    // Ensure test product exists in SQLite
    const now = new Date().toISOString();
    db.prepare(
      `INSERT OR REPLACE INTO products (
        id, name, slug, category_slug, short_description, description,
        spice_level, storage, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    ).run(
      testProductId,
      'Authentic Ratlami Sev',
      testProductId,
      'classic-sev',
      'Crispy, spicy Ratlami sev with clove aroma.',
      'Full description of Ratlami Sev',
      'hot',
      'Store in airtight container at room temperature',
      'published',
      now,
      now
    );

    // Ensure standard variant exists
    db.prepare(
      `INSERT OR IGNORE INTO product_variants (
        id, product_id, label, weight_grams, price_paise, sku, stock_qty, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`
    ).run(
      testVariantId,
      testProductId,
      '250g Pack',
      250,
      13000,
      'RSV-RAT-250G',
      null, // untracked stock
      now,
      now
    );

    // Ensure limited stock variant exists for oversell rollback testing
    db.prepare(
      `INSERT OR REPLACE INTO product_variants (
        id, product_id, label, weight_grams, price_paise, sku, stock_qty, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`
    ).run(
      stockVariantId,
      testProductId,
      '500g Limited Batch',
      500,
      25000,
      'RSV-RAT-500G-LIM',
      2, // exactly 2 in stock
      now,
      now
    );
  });

  test('Order number generation is collision-safe and human-friendly', async () => {
    const num1 = await generateOrderNumber();
    const num2 = await generateOrderNumber();

    expect(num1).toMatch(/^RSV-\d{4}-\d{5}$/);
    expect(num2).toMatch(/^RSV-\d{4}-\d{5}$/);
    expect(num1).not.toBe(num2);
  });

  test('createPendingOrder computes integer paise prices and creates immutable snapshot', async () => {
    const { order, items } = await createPendingOrder({
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      customerEmail: 'aarav@example.com',
      shippingAddress: {
        line1: 'Flat 402, Shanti Vihar',
        line2: 'MG Road',
        landmark: 'Near City Mall',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    expect(order.id).toBeDefined();
    expect(order.order_number).toMatch(/^RSV-\d{4}-\d{5}$/);
    expect(order.public_token).toHaveLength(48);
    expect(order.status).toBe('pending_payment');
    expect(order.customer_phone).toBe('9876543210'); // Normalized
    expect(order.subtotal).toBe(26000); // 2 * 13000 paise
    expect(order.total).toBe(26000); // Meets free shipping threshold

    expect(items).toHaveLength(1);
    expect(items[0].pack_label).toBe('250g Pack');
    expect(items[0].unit_price).toBe(13000);
    expect(items[0].qty).toBe(2);
    expect(items[0].line_total).toBe(26000);

    // Verify persisted in DB
    const fetched = await getOrderByToken(order.public_token);
    expect(fetched).not.toBeNull();
    expect(fetched?.order_number).toBe(order.order_number);
    expect(fetched?.items[0].line_total).toBe(26000);
  });

  test('createPendingOrder rejects subtotal below minimum cart value', async () => {
    // 1 pack = Rs 130 (13000 paise), min cart is Rs 199 (19900 paise)
    await expect(
      createPendingOrder({
        customerName: 'Pooja Verma',
        customerPhone: '9826011122',
        customerEmail: 'pooja@example.com',
        shippingAddress: {
          line1: '12 Malwa Mill',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        },
        items: [{ variantId: testVariantId, qty: 1 }],
      })
    ).rejects.toThrow(/minimum order value/);
  });

  test('markOrderPaid transitions pending_payment to confirmed in atomic batch', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Rohan Joshi',
      customerPhone: '9826099988',
      customerEmail: 'rohan@example.com',
      shippingAddress: {
        line1: '45 Rajwada Chowk',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452002',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    const result = await markOrderPaid({
      orderId: order.id,
      payment: {
        razorpayPaymentId: `pay_test_${Date.now()}`,
        method: 'upi',
        amount: order.total,
      },
      actor: 'verify',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('confirmed');
    expect(result.order.paid_at).not.toBeNull();
  });

  test('markOrderPaid is IDEMPOTENT: repeated calls with duplicate webhook succeed safely', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Devendra Patel',
      customerPhone: '9826077766',
      customerEmail: 'devendra@example.com',
      shippingAddress: {
        line1: '78 Palasia Square',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    const paymentPayload = {
      razorpayPaymentId: `pay_idem_${Date.now()}`,
      method: 'netbanking',
      amount: order.total,
    };

    // First payment attempt
    const res1 = await markOrderPaid({
      orderId: order.id,
      payment: paymentPayload,
      actor: 'verify',
    });
    expect(res1.success).toBe(true);
    expect(res1.status).toBe('confirmed');

    // Duplicate webhook call with the same order
    const res2 = await markOrderPaid({
      orderId: order.id,
      payment: paymentPayload,
      actor: 'webhook',
    });

    expect(res2.success).toBe(true);
    expect(res2.alreadyPaid).toBe(true);
    expect(res2.status).toBe('confirmed');
  });

  test('markOrderPaid handles late payment from expired order', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Anita Gupta',
      customerPhone: '9826055544',
      customerEmail: 'anita@example.com',
      shippingAddress: {
        line1: '90 Vijay Nagar',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452010',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    // Order expires due to timeout
    const expired = await expireOrder(order.id);
    expect(expired).toBe(true);

    // Customer paid right after expiration
    const result = await markOrderPaid({
      orderId: order.id,
      payment: {
        razorpayPaymentId: `pay_late_${Date.now()}`,
        method: 'card',
        amount: order.total,
      },
      actor: 'webhook',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('confirmed');
  });

  test('OVERSELL ROLLBACK: batch rolls back on stock exhaustion and marks needs_attention', async () => {
    const db = getDb();
    // Reset stock to exactly 1
    db.prepare(`UPDATE product_variants SET stock_qty = 1 WHERE id = ?;`).run(stockVariantId);

    // Order A orders 1 pack
    const orderA = await createPendingOrder({
      customerName: 'Buyer A',
      customerPhone: '9826011111',
      customerEmail: 'buyer_a@example.com',
      shippingAddress: {
        line1: '10 Sarafa Bazar',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452002',
      },
      items: [{ variantId: stockVariantId, qty: 1 }],
    });

    // Order B orders 1 pack concurrently
    const orderB = await createPendingOrder({
      customerName: 'Buyer B',
      customerPhone: '9826022222',
      customerEmail: 'buyer_b@example.com',
      shippingAddress: {
        line1: '20 Chhappan Dukan',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      items: [{ variantId: stockVariantId, qty: 1 }],
    });

    // Order A pays first: succeeds, stock drops from 1 to 0
    const resA = await markOrderPaid({
      orderId: orderA.order.id,
      payment: {
        razorpayPaymentId: `pay_succ_${Date.now()}`,
        method: 'upi',
        amount: orderA.order.total,
      },
    });
    expect(resA.success).toBe(true);
    expect(resA.status).toBe('confirmed');

    // Verify stock is now 0
    const stockRow = db.prepare(`SELECT stock_qty FROM product_variants WHERE id = ?`).get(stockVariantId) as { stock_qty: number };
    expect(stockRow.stock_qty).toBe(0);

    // Order B pays second: stock decrement fails CHECK (stock_qty cannot be negative)
    const resB = await markOrderPaid({
      orderId: orderB.order.id,
      payment: {
        razorpayPaymentId: `pay_oversell_${Date.now()}`,
        method: 'upi',
        amount: orderB.order.total,
      },
    });

    // Verify recovery executed: order is NOT lost silently!
    expect(resB.success).toBe(false);
    expect(resB.oversell).toBe(true);
    expect(resB.status).toBe('needs_attention');

    // Verify stock is still 0 (never negative)
    const stockRowAfter = db.prepare(`SELECT stock_qty FROM product_variants WHERE id = ?`).get(stockVariantId) as { stock_qty: number };
    expect(stockRowAfter.stock_qty).toBe(0);

    // Verify refund flagged in refunds table
    const refundRow = db.prepare(`SELECT * FROM refunds WHERE order_id = ?`).get(orderB.order.id) as { status: string; amount: number };
    expect(refundRow).toBeDefined();
    expect(refundRow.status).toBe('pending');
    expect(refundRow.amount).toBe(orderB.order.total);
  });

  test('markPaymentFailed records payment failure and allows retry', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Vikas Soni',
      customerPhone: '9826033333',
      customerEmail: 'vikas@example.com',
      shippingAddress: {
        line1: '88 Annapurna Road',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452009',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    await markPaymentFailed({
      orderId: order.id,
      errorCode: 'BAD_REQUEST_ERROR',
      errorDescription: 'User cancelled payment on UPI screen',
    });

    const updated = await getOrderByToken(order.public_token);
    // Order is still pending_payment so user can retry
    expect(updated?.status).toBe('pending_payment');
  });

  test('recordRefund processes full refund and updates order status to refunded', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Kunal Malviya',
      customerPhone: '9826044444',
      customerEmail: 'kunal@example.com',
      shippingAddress: {
        line1: '14 Bhanwarkuan',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    await markOrderPaid({
      orderId: order.id,
      payment: {
        razorpayPaymentId: `pay_ref_${Date.now()}`,
        amount: order.total,
      },
    });

    const refund = await recordRefund({
      orderId: order.id,
      razorpayRefundId: `rfnd_${Date.now()}`,
      amount: order.total,
      reason: 'Customer requested cancellation',
      createdBy: 'support_agent',
    });

    expect(refund.status).toBe('processed');

    const updated = await getOrderByToken(order.public_token);
    expect(updated?.status).toBe('refunded');
  });

  test('trackOrder enforces order number + 10-digit phone match (anti-enumeration)', async () => {
    const { order } = await createPendingOrder({
      customerName: 'Sunita Jain',
      customerPhone: '9826088899',
      customerEmail: 'sunita@example.com',
      shippingAddress: {
        line1: '32 Sneha Nagar',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      items: [{ variantId: testVariantId, qty: 2 }],
    });

    // Valid tracking query
    const tracking = await trackOrder(order.order_number, '9826088899');
    expect(tracking).not.toBeNull();
    expect(tracking?.order_number).toBe(order.order_number);
    expect(tracking?.milestones[0].completed).toBe(true);

    // Mismatched phone returns null (no user/order enumeration)
    const mismatch = await trackOrder(order.order_number, '9999999999');
    expect(mismatch).toBeNull();

    // Invalid order number returns null
    const nonExistent = await trackOrder('RSV-9999-99999', '9826088899');
    expect(nonExistent).toBeNull();
  });

  test('recordWebhookEvent prevents duplicate webhook processing', async () => {
    const eventId = `evt_test_${Date.now()}`;

    const res1 = await recordWebhookEvent(eventId, 'payment.captured', 'Captured payload');
    expect(res1.isDuplicate).toBe(false);

    const res2 = await recordWebhookEvent(eventId, 'payment.captured', 'Captured payload duplicate');
    expect(res2.isDuplicate).toBe(true);
  });

  test('listOrders filters and paginates orders for admin overview', async () => {
    const list = await listOrders({ limit: 5 });
    expect(list.orders.length).toBeGreaterThanOrEqual(1);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(list.page).toBe(1);
  });
});
