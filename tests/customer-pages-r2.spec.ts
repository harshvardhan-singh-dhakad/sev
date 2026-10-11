import { test, expect } from '@playwright/test';
import { getDb } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Phase R2 — Customer Pages & Flow Verification', () => {
  const screenshotsDir = path.resolve('test-results/gate-r2');
  const paidToken = 'test_token_paid_r2_abc123456789';
  const verifyingToken = 'test_token_verifying_r2_def987654321';
  const failedToken = 'test_token_failed_r2_ghi555444333';
  const testOrderNumber = 'RSV-2610-99001';
  const testPhone = '9826012345';

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const db = getDb();
    const now = new Date().toISOString();

    // 1. Seed Paid Order
    db.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, public_token, status, customer_name, customer_phone, customer_email,
        shipping_line1, shipping_city, shipping_state, shipping_pincode,
        subtotal, shipping, total, razorpay_order_id, paid_at,
        created_at, updated_at
      ) VALUES (
        'order-r2-paid-id', '${testOrderNumber}', '${paidToken}', 'confirmed',
        'Ramesh Sharma', '${testPhone}', 'ramesh@example.com',
        'Flat 302, Sai Residency, Freeganj', 'Ujjain', 'Madhya Pradesh', '456001',
        38000, 0, 38000, 'order_rzp_paid_123', '${now}',
        '${now}', '${now}'
      );
    `).run();

    // Seed Items for Paid Order
    db.prepare(`DELETE FROM order_items WHERE order_id = 'order-r2-paid-id';`).run();
    db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_name, pack_label,
        weight_grams, unit_price, qty, line_total, created_at
      ) VALUES
        ('item-1', 'order-r2-paid-id', 'ratlami-sev', 'ratlami-sev-250g', 'Authentic Ratlami Sev', '250g Pack', 250, 13000, 2, 26000, '${now}'),
        ('item-2', 'order-r2-paid-id', 'ujjaini-sev', 'ujjaini-sev-250g', 'Ujjaini Sev', '250g Pack', 250, 12000, 1, 12000, '${now}');
    `).run();

    // 2. Seed Verifying Order
    db.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, public_token, status, customer_name, customer_phone, customer_email,
        shipping_line1, shipping_city, shipping_state, shipping_pincode,
        subtotal, shipping, total, created_at, updated_at
      ) VALUES (
        'order-r2-verifying-id', 'RSV-2610-99002', '${verifyingToken}', 'pending_payment',
        'Pooja Patel', '9876543210', 'pooja@example.com',
        '12, Scheme 54, Vijay Nagar', 'Indore', 'Madhya Pradesh', '452010',
        25000, 4900, 29900, '${now}', '${now}'
      );
    `).run();

    // 3. Seed Failed Order
    db.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, public_token, status, customer_name, customer_phone, customer_email,
        shipping_line1, shipping_city, shipping_state, shipping_pincode,
        subtotal, shipping, total, created_at, updated_at
      ) VALUES (
        'order-r2-failed-id', 'RSV-2610-99003', '${failedToken}', 'cancelled',
        'Amit Verma', '9123456780', 'amit@example.com',
        '45, Civil Lines', 'Bhopal', 'Madhya Pradesh', '462001',
        20000, 4900, 24900, '${now}', '${now}'
      );
    `).run();

    // Close SQLite connection immediately so no lock is held
    db.close();
  });

  // TEST 1: Empty Cart
  test('Cart — Empty State at 1366px and 375px', async ({ page }) => {
    // Clear localStorage cart
    await page.goto('http://localhost:3000/cart');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 900 });
    await expect(page.locator('h1:has-text("Your Cart is Empty")')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-empty-1366.png'),
      fullPage: true,
    });

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("Your Cart is Empty")')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-empty-375.png'),
      fullPage: true,
    });
  });

  // TEST 2: Filled Cart with Subtotal < 199 (Min-Cart Banner Warning)
  test('Cart — Subtotal < 199 with Min-Cart Warning Banner', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    // Inject 1 item priced at 140 (subtotal = 140 < 199)
    await page.evaluate(() => {
      localStorage.setItem(
        'rasvat-cart',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'laung-sev',
                productName: 'Special Laung Sev (Clove Flavoured)',
                variantId: 'laung-sev-250g',
                variantName: '250g Pack',
                weight: '250g Pack',
                quantity: 1,
                price: 140,
                thumbnail: '/images/products/laung-sev.jpg',
                slug: 'laung-sev',
              },
            ],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 900 });
    await expect(page.locator('text=Add ₹59 more to reach the ₹199 minimum order')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-min-order-warning-1366.png'),
      fullPage: true,
    });

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-min-order-warning-375.png'),
      fullPage: true,
    });
  });

  // TEST 3: Filled Cart with Subtotal >= 199 (Ready for Checkout)
  test('Cart — Subtotal >= 199 Ready for Checkout with Mobile Sticky Bar', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    // Inject 2 items: 140 + 260 = 400 (subtotal >= 199)
    await page.evaluate(() => {
      localStorage.setItem(
        'rasvat-cart',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'laung-sev',
                productName: 'Special Laung Sev (Clove Flavoured)',
                variantId: 'laung-sev-250g',
                variantName: '250g Pack',
                weight: '250g Pack',
                quantity: 1,
                price: 140,
                thumbnail: '/images/products/laung-sev.jpg',
                slug: 'laung-sev',
              },
              {
                productId: 'ratlami-sev',
                productName: 'Authentic Ratlami Sev',
                variantId: 'ratlami-sev-500g',
                variantName: '500g Pack',
                weight: '500g Pack',
                quantity: 1,
                price: 260,
                thumbnail: '/images/products/ratlami-sev.jpg',
                slug: 'ratlami-sev',
              },
            ],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 900 });
    await expect(page.locator('text=Minimum order requirement met!')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-unlocked-1366.png'),
      fullPage: true,
    });

    // Tablet 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-unlocked-768.png'),
      fullPage: true,
    });

    // Mobile 375px (Verifies sticky bottom bar)
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('a[href="/checkout"]').first()).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'cart-sticky-mobile-375.png'),
      fullPage: true,
    });
  });

  // TEST 4: Checkout 2-Column Desktop & Mobile Views
  test('Checkout — 2-Column Desktop and Mobile Stacked Views', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    // Ensure cart has items
    await page.evaluate(() => {
      localStorage.setItem(
        'rasvat-cart',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'ratlami-sev',
                productName: 'Authentic Ratlami Sev',
                variantId: 'ratlami-sev-500g',
                variantName: '500g Pack',
                weight: '500g Pack',
                quantity: 1,
                price: 260,
                thumbnail: '/images/products/ratlami-sev.jpg',
                slug: 'ratlami-sev',
              },
            ],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Desktop 1366px (2-column layout)
    await page.setViewportSize({ width: 1366, height: 900 });
    await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Delivery Address' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Items in Order/ })).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'checkout-2col-1366.png'),
      fullPage: true,
    });

    // Tablet 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'checkout-768.png'),
      fullPage: true,
    });

    // Mobile 375px (Stacked layout)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'checkout-mobile-375.png'),
      fullPage: true,
    });
  });

  // TEST 5: Checkout Form Validation Errors
  test('Checkout — Validation Errors Feedback on Empty Submit', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    // Ensure cart has items so form renders
    await page.evaluate(() => {
      localStorage.setItem(
        'rasvat-cart',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'ratlami-sev',
                productName: 'Authentic Ratlami Sev',
                variantId: 'ratlami-sev-500g',
                variantName: '500g Pack',
                weight: '500g Pack',
                quantity: 1,
                price: 260,
                thumbnail: '/images/products/ratlami-sev.jpg',
                slug: 'ratlami-sev',
              },
            ],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 1366, height: 900 });

    // Ensure cart drawer is closed if open
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Click submit button in checkout form
    const submitBtn = page.getByRole('button', { name: /Place Order/ });
    await submitBtn.click();

    // Verify validation error messages appear
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Valid 10-digit Indian mobile number required')).toBeVisible();
    await expect(page.locator('text=House / Flat / Street address is required')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotsDir, 'checkout-validation-errors-1366.png'),
      fullPage: true,
    });
  });

  // TEST 6: Order Details — Paid State
  test('Order Details — Paid State at 1366px & 375px', async ({ page }) => {
    await page.goto(`http://localhost:3000/order/${paidToken}`, { waitUntil: 'domcontentloaded' });

    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 900 });
    await expect(page.locator('text=Order Placed & Confirmed')).toBeVisible();
    await expect(page.locator(`text=${testOrderNumber}`).first()).toBeVisible();
    await expect(page.locator('text=What Happens Next?')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'order-paid-1366.png'),
      fullPage: true,
    });

    // Tablet 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'order-paid-768.png'),
      fullPage: true,
    });

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'order-paid-375.png'),
      fullPage: true,
    });
  });

  // TEST 7: Order Details — Verifying State
  test('Order Details — Verifying State at 1366px', async ({ page }) => {
    await page.goto(`http://localhost:3000/order/${verifyingToken}`, { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 1366, height: 900 });

    await expect(page.locator('text=Confirming Your Payment')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'order-verifying-1366.png'),
      fullPage: true,
    });
  });

  // TEST 8: Order Details — Failed State
  test('Order Details — Failed State at 1366px', async ({ page }) => {
    await page.goto(`http://localhost:3000/order/${failedToken}`, { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 1366, height: 900 });

    await expect(page.locator('text=Order Payment Not Completed')).toBeVisible();
    await expect(page.locator('text=Retry Order Checkout')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'order-failed-1366.png'),
      fullPage: true,
    });
  });

  // TEST 9: Track Order — Lookup Form & Timeline Display
  test('Track Order — Lookup and Active Timeline Milestones', async ({ page }) => {
    // 1. Initial Lookup Form
    await page.goto('http://localhost:3000/track-order', { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 1366, height: 900 });

    await expect(page.locator('text=Live Order Tracking')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'track-order-form-1366.png'),
      fullPage: true,
    });

    // 2. Submit test order number and phone
    await page.fill('input[placeholder="RSV-2610-00001"]', testOrderNumber);
    await page.fill('input[placeholder="9826012345"]', testPhone);
    await page.click('button:has-text("Track Order Status")');

    // Verify timeline appears
    await expect(page.locator('text=Milestone Timeline')).toBeVisible();
    await expect(page.locator('text=Order Confirmed')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotsDir, 'track-order-timeline-1366.png'),
      fullPage: true,
    });

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'track-order-timeline-375.png'),
      fullPage: true,
    });
  });

  // TEST 10: Policy Pages
  test('Policy Pages — Terms, Refund Policy, Privacy Policy at 1366px', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto('http://localhost:3000/terms', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1:has-text("Terms of Service")')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'policy-terms-1366.png'),
      fullPage: true,
    });

    await page.goto('http://localhost:3000/refund-policy', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1:has-text("Refund & Cancellation Policy")')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'policy-refund-1366.png'),
      fullPage: true,
    });

    await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1:has-text("Privacy Policy")')).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, 'policy-privacy-1366.png'),
      fullPage: true,
    });
  });
});
