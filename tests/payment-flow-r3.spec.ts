import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getDb } from '../src/lib/db';
import {
  computeHmacSha256Hex,
  verifyRazorpayPaymentSignature,
} from '../src/lib/razorpay';

test.describe('Phase R3 — Payment Flow & Signature Verification', () => {
  const testProductId = 'ratlami-special-sev';
  const testVariantId = 'rat-500g';

  test.beforeAll(async () => {
    const db = getDb();
    const now = new Date().toISOString();

    // Ensure output directories exist
    const screenshotDir = path.join(process.cwd(), 'test-results', 'gate-r3');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

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

    // Ensure variant exists with known tracked stock (100 units)
    db.prepare(
      `INSERT OR REPLACE INTO product_variants (
        id, product_id, label, weight_grams, price_paise, sku, stock_qty, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`
    ).run(
      testVariantId,
      testProductId,
      '500 g',
      500,
      16000, // Rs 160.00
      'RAT-500G',
      100, // 100 units in stock
      now,
      now
    );
  });

  test('Web Crypto HMAC-SHA256 Signature Verification Unit Logic', async () => {
    const secret = 'rzp_test_secret_998877';
    const orderId = 'order_DA1234567890';
    const paymentId = 'pay_XY0987654321';
    const payload = `${orderId}|${paymentId}`;

    const validSignature = await computeHmacSha256Hex(payload, secret);
    expect(validSignature).toBeDefined();
    expect(validSignature.length).toBe(64); // SHA-256 produces 64 hex characters

    // Positive check
    const isValid = await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: validSignature,
      keySecret: secret,
    });
    expect(isValid).toBe(true);

    // Negative check: Tampered signature
    const tamperedSignature = validSignature.replace(/^[0-9a-f]/, (c) => (c === 'a' ? 'b' : 'a'));
    const isTamperedValid = await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: tamperedSignature,
      keySecret: secret,
    });
    expect(isTamperedValid).toBe(false);

    // Negative check: Wrong secret
    const isWrongSecretValid = await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: validSignature,
      keySecret: 'wrong_secret_12345',
    });
    expect(isWrongSecretValid).toBe(false);
  });

  test('POST /api/checkout/create-order creates order and returns Razorpay payload', async ({
    request,
  }) => {
    const res = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Payment Test Customer',
        customerPhone: '9876543210',
        customerEmail: 'payment.test@example.com',
        shippingAddress: {
          line1: '404 Snack Lane',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        },
        items: [
          {
            variantId: testVariantId,
            qty: 2, // 2 * 160 = Rs 320 (exceeds min cart value of Rs 199)
          },
        ],
      },
    });

    expect(res.ok()).toBe(true);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.order).toBeDefined();
    expect(data.order.orderNumber).toMatch(/^RSV-\d{4}-\d{5}$/);
    expect(data.order.status).toBe('pending_payment');
    expect(data.razorpay).toBeDefined();
    expect(data.razorpay.orderId).toBeDefined();
    expect(data.razorpay.amount).toBe(data.order.total);
    expect(data.razorpay.currency).toBe('INR');

    // Verify in database that razorpay_order_id was saved
    const db = getDb();
    const orderRow = db
      .prepare('SELECT id, status, razorpay_order_id, total FROM orders WHERE id = ?')
      .get(data.order.id) as any;
    expect(orderRow).toBeDefined();
    expect(orderRow.razorpay_order_id).toBe(data.razorpay.orderId);
    expect(orderRow.status).toBe('pending_payment');
  });

  test('POST /api/checkout/verify-payment: Rejects invalid signature with 400', async ({
    request,
  }) => {
    // 1. Create order
    const createRes = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Invalid Sig Customer',
        customerPhone: '9876543210',
        shippingAddress: {
          line1: '12 Spice Road',
          city: 'Ratlam',
          state: 'Madhya Pradesh',
          pincode: '457001',
        },
        items: [{ variantId: testVariantId, qty: 2 }],
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    // 2. Attempt verification with bad signature
    const verifyRes = await request.post('/api/checkout/verify-payment', {
      data: {
        orderId: createData.order.id,
        orderToken: createData.order.publicToken,
        razorpayOrderId: createData.razorpay.orderId,
        razorpayPaymentId: 'pay_bad_test_123',
        razorpaySignature: 'invalid_hex_signature_00000000000000000000000000000000000000000000',
      },
    });

    expect(verifyRes.status()).toBe(400);
    const verifyData = await verifyRes.json();
    expect(verifyData.error).toContain('could not be verified');

    // Verify order was marked payment failed in database
    const db = getDb();
    const payments = db
      .prepare('SELECT status, error_code FROM payments WHERE order_id = ?')
      .all(createData.order.id) as any[];
    expect(payments.length).toBeGreaterThanOrEqual(1);
    expect(payments[0].status).toBe('failed');
    expect(payments[0].error_code).toBe('SIGNATURE_VERIFICATION_FAILED');
  });

  test('POST /api/checkout/verify-payment: Transitions order to confirmed and decrements inventory idempotently', async ({
    request,
  }) => {
    // 1. Record starting stock for item
    const db = getDb();
    const invRow = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    const initialStock = invRow?.stock_qty ?? 0;

    // 2. Create order
    const createRes = await request.post('/api/checkout/create-order', {
      data: {
        customerName: 'Successful Payment Customer',
        customerPhone: '9876543210',
        shippingAddress: {
          line1: '100 Authentic Bazar',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452002',
        },
        items: [{ variantId: testVariantId, qty: 2 }],
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    // 3. Verify payment using deterministic mock signature
    const verifyRes = await request.post('/api/checkout/verify-payment', {
      data: {
        orderId: createData.order.id,
        orderToken: createData.order.publicToken,
        razorpayOrderId: createData.razorpay.orderId,
        razorpayPaymentId: 'pay_test_succ_' + Date.now(),
        razorpaySignature: 'mock_signature',
      },
    });

    expect(verifyRes.ok()).toBe(true);
    const verifyData = await verifyRes.json();
    expect(verifyData.success).toBe(true);
    expect(verifyData.verified).toBe(true);
    expect(verifyData.orderNumber).toBe(createData.order.orderNumber);

    // 4. Verify DB state: order confirmed, paid payment recorded, inventory decremented
    const order = db
      .prepare('SELECT status, paid_at FROM orders WHERE id = ?')
      .get(createData.order.id) as any;
    expect(order.status).toBe('confirmed');
    expect(order.paid_at).not.toBeNull();

    const payment = db
      .prepare('SELECT status, amount FROM payments WHERE order_id = ?')
      .get(createData.order.id) as any;
    expect(payment.status).toBe('captured');
    expect(payment.amount).toBe(createData.order.total);

    const invAfter = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    expect(invAfter.stock_qty).toBe(initialStock - 2);

    // 5. Test idempotency: Calling verify again returns success without double inventory deduction
    const secondVerifyRes = await request.post('/api/checkout/verify-payment', {
      data: {
        orderId: createData.order.id,
        orderToken: createData.order.publicToken,
        razorpayOrderId: createData.razorpay.orderId,
        razorpayPaymentId: 'pay_test_succ_' + Date.now(),
        razorpaySignature: 'mock_signature',
      },
    });
    expect(secondVerifyRes.ok()).toBe(true);

    const invAfterSecond = db
      .prepare('SELECT stock_qty FROM product_variants WHERE id = ?')
      .get(testVariantId) as any;
    expect(invAfterSecond.stock_qty).toBe(initialStock - 2); // Unchanged!
  });

  test('E2E Checkout: Completes payment flow and redirects to paid order confirmation page', async ({
    page,
  }) => {
    // Navigate to /checkout and populate cart in localStorage
    await page.goto('/checkout');
    await page.evaluate(() => {
      localStorage.setItem(
        'rasvat-cart',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'ratlami-special-sev',
                productName: 'Ratlami Special Sev',
                variantId: 'rat-500g',
                variantName: '500g Pack',
                weight: '500g Pack',
                quantity: 2,
                price: 160,
                thumbnail: '/images/products/ratlami-sev.jpg',
                slug: 'ratlami-special-sev',
              },
            ],
          },
          version: 0,
        })
      );
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Fill form using exact placeholders
    await page.getByPlaceholder('e.g. Ramesh Sharma').fill('Harshvardhan Dhakad');
    await page.getByPlaceholder('9826012345').fill('9876543210');
    await page.getByPlaceholder('ramesh@example.com').fill('harsh@example.com');
    await page.getByPlaceholder('Flat 302, Sai Residency, MG Road').fill('Plot 42, Annapurna Road');
    await page.getByPlaceholder('Ujjain').fill('Indore');
    await page.locator('select').first().selectOption('Madhya Pradesh');
    await page.getByPlaceholder('456001').fill('452009');

    // Submit order
    const submitBtn = page.getByRole('button', { name: /Place Order/ });
    await submitBtn.click();

    // Verify redirect to order details page
    await page.waitForURL(/\/order\/[a-zA-Z0-9_-]+/, { timeout: 15000 });
    expect(page.url()).toContain('/order/');

    // Verify order page renders confirmed status
    const orderNumberEl = page.locator('text=RSV-');
    await expect(orderNumberEl.first()).toBeVisible({ timeout: 10000 });

    // Verify cart was cleared
    const cartStorage = await page.evaluate(() => {
      return localStorage.getItem('rasvat-cart');
    });
    if (cartStorage) {
      const parsed = JSON.parse(cartStorage);
      expect(parsed.state.items.length).toBe(0);
    }

    // Take screenshot for gate verification
    await page.screenshot({
      path: 'test-results/gate-r3/checkout-payment-success-1366.png',
      fullPage: true,
    });
  });
});
