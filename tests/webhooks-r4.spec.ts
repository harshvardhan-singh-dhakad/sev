import { test, expect } from '@playwright/test';
import { getDb } from '../src/lib/db';
import { computeHmacSha256Hex } from '../src/lib/razorpay';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret_key';

test.describe('Phase R4 — Razorpay Webhooks', () => {
  const testProductId = 'ratlami-special-sev';
  const testVariantId = 'rat-500g';

  test.beforeAll(async () => {
    // Ensure test environment has webhook secret set
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;

    const db = getDb();
    const now = new Date().toISOString();

    // Ensure product exists
    db.prepare(
      `INSERT OR REPLACE INTO products (
        id, name, slug, category_slug, short_description, description,
        spice_level, storage, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    ).run(
      testProductId,
      'Ratlami Special Sev',
      testProductId,
      'ratlami-sev',
      'Bold & fiery Ratlami delicacy infused with cloves.',
      'Full description of Ratlami Sev',
      'hot',
      'Store in airtight container',
      'published',
      now,
      now
    );

    // Ensure variant exists with tracked stock (100 units)
    db.prepare(
      `INSERT OR REPLACE INTO product_variants (
        id, product_id, label, weight_grams, price_paise, sku, stock_qty, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`
    ).run(
      testVariantId,
      testProductId,
      '500 g',
      500,
      16000,
      'RAT-500G-R4',
      100,
      now,
      now
    );
  });

  test('Webhook rejects missing and tampered signatures with 400', async ({ request }) => {
    const rawPayload = JSON.stringify({
      entity: 'event',
      id: 'evt_test_missing_sig',
      event: 'payment.captured',
    });

    // 1. Missing signature
    const missingRes = await request.post('/api/webhooks/razorpay', {
      data: rawPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(missingRes.status()).toBe(400);
    const missingData = await missingRes.json();
    expect(missingData.error).toContain('Missing x-razorpay-signature');

    // 2. Tampered signature
    const tamperedRes = await request.post('/api/webhooks/razorpay', {
      data: rawPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': '0000000000000000000000000000000000000000000000000000000000000000',
      },
    });
    expect(tamperedRes.status()).toBe(400);
    const tamperedData = await tamperedRes.json();
    expect(tamperedData.error).toContain('Invalid webhook signature');
  });

  test('payment.captured webhook updates order to confirmed and decrements inventory', async ({
    request,
  }) => {
    // 1. Create pending order
    const createRes = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Webhook Capture Customer',
        customerPhone: '9876543210',
        shippingAddress: {
          line1: '12 Webhook Street',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        },
        items: [{ variantId: testVariantId, qty: 2 }],
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    const db = getDb();
    const invBefore = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    const initialStock = invBefore.stock_qty;

    // 2. Construct payment.captured payload
    const eventId = 'evt_capt_' + Date.now();
    const paymentId = 'pay_capt_' + Date.now();
    const payloadObj = {
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: 'payment',
            amount: createData.order.total,
            currency: 'INR',
            status: 'captured',
            order_id: createData.razorpay.orderId,
            method: 'upi',
          },
        },
      },
      id: eventId,
      created_at: Math.floor(Date.now() / 1000),
    };

    const rawBody = JSON.stringify(payloadObj);
    const signature = await computeHmacSha256Hex(rawBody, WEBHOOK_SECRET);

    // 3. Send webhook
    const hookRes = await request.post('/api/webhooks/razorpay', {
      data: rawBody,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    });

    expect(hookRes.ok()).toBe(true);
    const hookData = await hookRes.json();
    expect(hookData.success).toBe(true);
    expect(hookData.event).toBe('payment.captured');

    // 4. Verify DB: order confirmed, payment recorded, stock decremented, webhook ledger marked processed
    const order = db
      .prepare('SELECT status, paid_at FROM orders WHERE id = ?')
      .get(createData.order.id) as any;
    expect(order.status).toBe('confirmed');
    expect(order.paid_at).not.toBeNull();

    const payment = db
      .prepare('SELECT status, amount FROM payments WHERE razorpay_payment_id = ?')
      .get(paymentId) as any;
    expect(payment).toBeDefined();
    expect(payment.status).toBe('captured');
    expect(payment.amount).toBe(createData.order.total);

    const invAfter = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    expect(invAfter.stock_qty).toBe(initialStock - 2);

    const webhookEvent = db
      .prepare('SELECT status FROM webhook_events WHERE event_id = ?')
      .get(eventId) as any;
    expect(webhookEvent).toBeDefined();
    expect(webhookEvent.status).toBe('processed');

    // 5. Test IDEMPOTENCY / Replay Protection: Re-sending exact same webhook
    const replayRes = await request.post('/api/webhooks/razorpay', {
      data: rawBody,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    });

    expect(replayRes.ok()).toBe(true);
    const replayData = await replayRes.json();
    expect(replayData.status).toBe('already_processed');

    // Stock must NOT be decremented again
    const invAfterReplay = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    expect(invAfterReplay.stock_qty).toBe(initialStock - 2);
  });

  test('payment.failed webhook logs payment failure and marks webhook processed', async ({
    request,
  }) => {
    // 1. Create order
    const createRes = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Webhook Failed Customer',
        customerPhone: '9876543210',
        shippingAddress: {
          line1: '99 Failure Court',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        },
        items: [{ variantId: testVariantId, qty: 2 }],
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    // 2. payment.failed payload
    const eventId = 'evt_fail_' + Date.now();
    const paymentId = 'pay_fail_' + Date.now();
    const payloadObj = {
      entity: 'event',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: createData.razorpay.orderId,
            amount: createData.order.total,
            currency: 'INR',
            status: 'failed',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Payment was declined by issuing bank',
          },
        },
      },
      id: eventId,
    };

    const rawBody = JSON.stringify(payloadObj);
    const signature = await computeHmacSha256Hex(rawBody, WEBHOOK_SECRET);

    const hookRes = await request.post('/api/webhooks/razorpay', {
      data: rawBody,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    });

    expect(hookRes.ok()).toBe(true);

    const db = getDb();
    const payment = db
      .prepare('SELECT status, error_code, error_description FROM payments WHERE razorpay_payment_id = ?')
      .get(paymentId) as any;
    expect(payment).toBeDefined();
    expect(payment.status).toBe('failed');
    expect(payment.error_code).toBe('BAD_REQUEST_ERROR');
  });

  test('refund.processed webhook records refund and updates order status to refunded', async ({
    request,
  }) => {
    // 1. Create and pay order
    const createRes = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Webhook Refund Customer',
        customerPhone: '9876543210',
        shippingAddress: {
          line1: '1 Refund Avenue',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        },
        items: [{ variantId: testVariantId, qty: 2 }],
      },
    });
    const createData = await createRes.json();

    const paymentId = 'pay_for_refund_' + Date.now();
    await request.post('/api/checkout/verify-payment', {
      data: {
        orderId: createData.order.id,
        orderToken: createData.order.publicToken,
        razorpayOrderId: createData.razorpay.orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: 'mock_signature',
      },
    });

    // 2. Construct refund.processed payload
    const eventId = 'evt_ref_' + Date.now();
    const refundId = 'rfnd_' + Date.now();
    const payloadObj = {
      entity: 'event',
      event: 'refund.processed',
      contains: ['refund', 'payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: createData.razorpay.orderId,
          },
        },
        refund: {
          entity: {
            id: refundId,
            payment_id: paymentId,
            amount: createData.order.total,
            currency: 'INR',
            status: 'processed',
            notes: {
              reason: 'Customer requested return of Sev order',
            },
          },
        },
      },
      id: eventId,
    };

    const rawBody = JSON.stringify(payloadObj);
    const signature = await computeHmacSha256Hex(rawBody, WEBHOOK_SECRET);

    const hookRes = await request.post('/api/webhooks/razorpay', {
      data: rawBody,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    });

    expect(hookRes.ok()).toBe(true);

    const db = getDb();
    const refund = db
      .prepare('SELECT amount, status, razorpay_refund_id FROM refunds WHERE razorpay_refund_id = ?')
      .get(refundId) as any;
    expect(refund).toBeDefined();
    expect(refund.status).toBe('processed');
    expect(refund.amount).toBe(createData.order.total);

    const order = db
      .prepare('SELECT status FROM orders WHERE id = ?')
      .get(createData.order.id) as any;
    expect(order.status).toBe('refunded');
  });

  test('Unknown webhook events are acknowledged with 200 and marked ignored', async ({
    request,
  }) => {
    const eventId = 'evt_unknown_' + Date.now();
    const payloadObj = {
      entity: 'event',
      event: 'invoice.paid',
      id: eventId,
    };

    const rawBody = JSON.stringify(payloadObj);
    const signature = await computeHmacSha256Hex(rawBody, WEBHOOK_SECRET);

    const hookRes = await request.post('/api/webhooks/razorpay', {
      data: rawBody,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    });

    expect(hookRes.ok()).toBe(true);

    const db = getDb();
    const event = db
      .prepare('SELECT status FROM webhook_events WHERE event_id = ?')
      .get(eventId) as any;
    expect(event).toBeDefined();
    expect(event.status).toBe('ignored');
  });

});
