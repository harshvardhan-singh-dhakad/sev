/**
 * ============================================================
 * RASVAT ORDERS ENGINE (Cloudflare D1 & Worker Compliant)
 * ============================================================
 * The SINGLE authoritative module for all order creation, payment
 * state transitions, stock decrementing, and tracking.
 * Routes and UI components MUST NOT write SQL queries directly.
 */

import { listProducts, getStoreSettings } from '@/lib/catalog';
import { orderDbBatch, orderDbExecute, orderDbQuery, orderDbQueryFirst, SqlStatement } from './db';
import {
  CreatePendingOrderInput,
  MarkOrderPaidInput,
  MarkOrderPaidResult,
  MarkPaymentFailedInput,
  OrderItemSnapshot,
  OrderListFilters,
  OrderListResult,
  OrderRecord,
  OrderTrackingInfo,
  PaymentRecord,
  PublicOrderDetails,
  RecordRefundInput,
  RefundRecord,
  TrackingMilestone,
  WebhookEventRecord,
} from './types';

export * from './types';

// ============================================================
// Helpers
// ============================================================

/**
 * Generates a collision-safe, human-friendly order number: RSV-YYMM-NNNNN
 * Uses atomic sequence counter in D1 / SQLite.
 */
export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${yy}${mm}`;

  try {
    // Atomic upsert with RETURNING in SQLite / D1
    const res = await orderDbQuery<{ last_seq: number }>(
      `INSERT INTO order_sequences (year_month, last_seq)
       VALUES (?, 1)
       ON CONFLICT(year_month) DO UPDATE SET last_seq = last_seq + 1
       RETURNING last_seq;`,
      [yearMonth]
    );

    if (res.length > 0 && typeof res[0].last_seq === 'number') {
      const seqStr = String(res[0].last_seq).padStart(5, '0');
      return `RSV-${yearMonth}-${seqStr}`;
    }
  } catch {
    // Fallback if RETURNING clause not supported by driver
    const existing = await orderDbQueryFirst<{ last_seq: number }>(
      `SELECT last_seq FROM order_sequences WHERE year_month = ?`,
      [yearMonth]
    );

    let nextSeq = 1;
    if (existing) {
      nextSeq = existing.last_seq + 1;
      await orderDbExecute(
        `UPDATE order_sequences SET last_seq = ? WHERE year_month = ?`,
        [nextSeq, yearMonth]
      );
    } else {
      await orderDbExecute(
        `INSERT INTO order_sequences (year_month, last_seq) VALUES (?, ?)`,
        [yearMonth, 1]
      );
    }

    return `RSV-${yearMonth}-${String(nextSeq).padStart(5, '0')}`;
  }

  // Fallback safety
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `RSV-${yearMonth}-${randomSuffix}`;
}

/**
 * Generates an unguessable 32-byte cryptographic public token for customer order URLs.
 */
export function generatePublicToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Normalizes phone numbers to standard 10 digits for lookup & comparison.
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

// ============================================================
// Core Module Functions
// ============================================================

/**
 * 1. createPendingOrder
 * Creates an authoritative pending order from verified catalog prices.
 * Server recalculates all prices, line totals, shipping, and order total.
 */
export async function createPendingOrder(input: CreatePendingOrderInput): Promise<{
  order: OrderRecord;
  items: OrderItemSnapshot[];
}> {
  if (!input.items || input.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // Fetch catalog products to verify variants and prices
  const catalog = listProducts({ status: 'active' }, 'popular', 1, 100);
  const orderId = input.customId || crypto.randomUUID();
  const orderNumber = await generateOrderNumber();
  const publicToken = generatePublicToken();
  const now = new Date().toISOString();

  let subtotal = 0;
  const itemSnapshots: OrderItemSnapshot[] = [];

  for (const itemInput of input.items) {
    if (itemInput.qty <= 0) {
      throw new Error(`Invalid item quantity: ${itemInput.qty}`);
    }

    // Find product and variant in catalog
    let foundProduct = null;
    let foundVariant: any = null;

    for (const prod of catalog.products) {
      const v = prod.variants.find((variant) => variant.id === itemInput.variantId);
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
    }

    // If not found in memory catalog, fallback to database product_variants table
    if (!foundVariant) {
      const dbVariant = await orderDbQueryFirst<any>(
        `SELECT pv.*, p.name as product_name, p.slug as product_slug
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = ?`,
        [itemInput.variantId]
      );
      if (dbVariant) {
        foundProduct = { slug: dbVariant.product_slug, name: dbVariant.product_name };
        foundVariant = {
          id: dbVariant.id,
          label: dbVariant.label,
          weight_grams: dbVariant.weight_grams,
          price: dbVariant.price_paise ?? dbVariant.price,
          min_qty: dbVariant.min_qty || 1,
          max_qty: dbVariant.max_qty || null,
          step: dbVariant.step || 1,
          is_active: Boolean(dbVariant.is_active),
        };
      }
    }

    if (!foundProduct || !foundVariant) {
      throw new Error(`Variant not found in active catalog: ${itemInput.variantId}`);
    }

    if (!foundVariant.is_active) {
      throw new Error(`Variant is inactive: ${foundVariant.label}`);
    }

    // Check quantity bounds
    if (itemInput.qty < foundVariant.min_qty) {
      throw new Error(`Minimum quantity for ${foundVariant.label} is ${foundVariant.min_qty}`);
    }
    if (foundVariant.max_qty && itemInput.qty > foundVariant.max_qty) {
      throw new Error(`Maximum quantity for ${foundVariant.label} is ${foundVariant.max_qty}`);
    }
    if (foundVariant.step && (itemInput.qty - foundVariant.min_qty) % foundVariant.step !== 0) {
      throw new Error(`Quantity for ${foundVariant.label} must increment by ${foundVariant.step}`);
    }

    const unitPrice = foundVariant.price ?? foundVariant.price_paise;
    const lineTotal = unitPrice * itemInput.qty;
    subtotal += lineTotal;


    itemSnapshots.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: foundProduct.slug,
      variant_id: foundVariant.id,
      product_name: foundProduct.name,
      pack_label: foundVariant.label,
      weight_grams: foundVariant.weight_grams,
      unit_price: unitPrice,
      qty: itemInput.qty,
      line_total: lineTotal,
      created_at: now,
    });
  }

  // Check store settings & minimum cart value
  const settings = getStoreSettings();
  if (subtotal < settings.min_cart_value) {
    throw new Error(
      `Cart subtotal (${subtotal} paise) does not meet minimum order value (${settings.min_cart_value} paise)`
    );
  }

  // Calculate shipping
  let shipping = 0;
  if (settings.free_shipping_above && subtotal < settings.free_shipping_above) {
    shipping = 4900; // Rs 49 standard shipping if below threshold
  }
  const total = subtotal + shipping;

  const orderRecord: OrderRecord = {
    id: orderId,
    order_number: orderNumber,
    public_token: publicToken,
    status: 'pending_payment',
    customer_name: input.customerName.trim(),
    customer_phone: normalizePhoneNumber(input.customerPhone),
    customer_email: input.customerEmail ? input.customerEmail.trim().toLowerCase() : '',
    shipping_line1: input.shippingAddress.line1.trim(),
    shipping_line2: input.shippingAddress.line2?.trim() || null,
    shipping_landmark: input.shippingAddress.landmark?.trim() || null,
    shipping_city: input.shippingAddress.city.trim(),
    shipping_state: input.shippingAddress.state.trim(),
    shipping_pincode: input.shippingAddress.pincode.trim(),
    subtotal,
    shipping,
    total,
    razorpay_order_id: null,
    paid_at: null,
    tracking_courier: null,
    tracking_awb: null,
    tracking_url: null,
    notes: input.notes || null,
    created_at: now,
    updated_at: now,
  };

  // Atomic batch to save order, line items, and audit event
  const statements: SqlStatement[] = [
    {
      sql: `INSERT INTO orders (
        id, order_number, public_token, status, customer_name, customer_phone, customer_email,
        shipping_line1, shipping_line2, shipping_landmark, shipping_city, shipping_state, shipping_pincode,
        subtotal, shipping, total, razorpay_order_id, paid_at, tracking_courier, tracking_awb, tracking_url,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        orderRecord.id,
        orderRecord.order_number,
        orderRecord.public_token,
        orderRecord.status,
        orderRecord.customer_name,
        orderRecord.customer_phone,
        orderRecord.customer_email,
        orderRecord.shipping_line1,
        orderRecord.shipping_line2,
        orderRecord.shipping_landmark,
        orderRecord.shipping_city,
        orderRecord.shipping_state,
        orderRecord.shipping_pincode,
        orderRecord.subtotal,
        orderRecord.shipping,
        orderRecord.total,
        orderRecord.razorpay_order_id,
        orderRecord.paid_at,
        orderRecord.tracking_courier,
        orderRecord.tracking_awb,
        orderRecord.tracking_url,
        orderRecord.notes,
        orderRecord.created_at,
        orderRecord.updated_at,
      ],
    },
    ...itemSnapshots.map((item) => ({
      sql: `INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_name, pack_label, weight_grams,
        unit_price, qty, line_total, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        item.id,
        item.order_id,
        item.product_id,
        item.variant_id,
        item.product_name,
        item.pack_label,
        item.weight_grams,
        item.unit_price,
        item.qty,
        item.line_total,
        item.created_at,
      ],
    })),
    {
      sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
            VALUES (?, ?, 'created', 'customer', 'Pending order created by customer', ?);`,
      params: [crypto.randomUUID(), orderRecord.id, now],
    },
  ];

  await orderDbBatch(statements);
  return { order: orderRecord, items: itemSnapshots };
}

/**
 * Attaches a Razorpay Order ID to an existing pending order.
 */
export async function attachRazorpayOrderId(
  orderId: string,
  razorpayOrderId: string
): Promise<void> {
  await orderDbExecute(
    `UPDATE orders SET razorpay_order_id = ?, updated_at = ? WHERE id = ?`,
    [razorpayOrderId, new Date().toISOString(), orderId]
  );
}


/**
 * 2. markOrderPaid
 * Safe, idempotent transition to 'confirmed' status.
 * Executes as ONE atomic D1 batch:
 *  - Order status transition (only from pending_payment or expired)
 *  - Payment row insertion
 *  - Stock decrement (enforces non-negative stock constraint)
 *  - Order event row
 *
 * If the batch fails due to stock (oversell), sets 'needs_attention', records payment,
 * creates an oversell audit event, and flags a refund. A paid order is NEVER lost silently.
 */
export async function markOrderPaid(params: MarkOrderPaidInput): Promise<MarkOrderPaidResult> {
  const { orderId, razorpayOrderId, payment, actor = 'webhook' } = params;

  // 1. Fetch Order
  let order: OrderRecord | null = null;
  if (orderId) {
    order = await orderDbQueryFirst<OrderRecord>(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  } else if (razorpayOrderId) {
    order = await orderDbQueryFirst<OrderRecord>(
      `SELECT * FROM orders WHERE razorpay_order_id = ?`,
      [razorpayOrderId]
    );
  }

  if (!order) {
    throw new Error(`Order not found for markOrderPaid: id=${orderId}, rzp=${razorpayOrderId}`);
  }

  // 2. Idempotency Check: Already paid/confirmed
  if (
    order.status === 'confirmed' ||
    order.status === 'packed' ||
    order.status === 'shipped' ||
    order.status === 'delivered'
  ) {
    return {
      success: true,
      status: order.status,
      order,
      alreadyPaid: true,
    };
  }

  // If already marked needs_attention due to oversell
  if (order.status === 'needs_attention') {
    return {
      success: false,
      status: 'needs_attention',
      order,
      oversell: true,
      reason: 'Order previously marked needs_attention (stock oversell)',
    };
  }

  // Not allowed to pay cancelled or refunded orders
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new Error(`Cannot mark paid: order is in '${order.status}' state`);
  }

  // Allowed statuses: 'pending_payment' or 'expired' (late payment recovery)
  const now = new Date().toISOString();
  const paymentId = crypto.randomUUID();

  // 3. Fetch line items to identify stock decrements
  const items = await orderDbQuery<OrderItemSnapshot>(
    `SELECT * FROM order_items WHERE order_id = ?`,
    [order.id]
  );

  // Build the atomic batch statements
  const statements: SqlStatement[] = [
    // 1) Transition order status
    {
      sql: `UPDATE orders
            SET status = 'confirmed', paid_at = ?, updated_at = ?
            WHERE id = ? AND (status = 'pending_payment' OR status = 'expired');`,
      params: [now, now, order.id],
    },
    // 2) Insert payment row
    {
      sql: `INSERT INTO payments (
        id, order_id, razorpay_payment_id, status, method, amount,
        error_code, error_description, raw_details_json, created_at
      ) VALUES (?, ?, ?, 'captured', ?, ?, NULL, NULL, ?, ?);`,
      params: [
        paymentId,
        order.id,
        payment.razorpayPaymentId,
        payment.method || null,
        payment.amount,
        payment.rawDetailsJson || null,
        now,
      ],
    },
    // 3) Stock decrements (product_variants has stock check / trigger)
    ...items.map((item) => ({
      sql: `UPDATE product_variants
            SET stock_qty = stock_qty - ?
            WHERE id = ? AND stock_qty IS NOT NULL;`,
      params: [item.qty, item.variant_id],
    })),
    // 4) Order event
    {
      sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
            VALUES (?, ?, 'paid', ?, ?, ?);`,
      params: [
        crypto.randomUUID(),
        order.id,
        actor,
        `Payment captured via Razorpay (${payment.razorpayPaymentId}) for Rs ${(payment.amount / 100).toFixed(2)}`,
        now,
      ],
    },
  ];

  try {
    // Attempt atomic batch execution
    await orderDbBatch(statements);

    const updatedOrder = (await orderDbQueryFirst<OrderRecord>(
      `SELECT * FROM orders WHERE id = ?`,
      [order.id]
    ))!;

    return {
      success: true,
      status: 'confirmed',
      order: updatedOrder,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isStockError =
      errorMsg.includes('stock_qty') ||
      errorMsg.includes('negative') ||
      errorMsg.includes('CHECK constraint failed');

    if (isStockError) {
      // OVERSELL RECOVERY BATCH:
      // Never drop paid orders silently. Mark needs_attention, record payment, record oversell event, flag refund.
      const recoveryStatements: SqlStatement[] = [
        {
          sql: `UPDATE orders SET status = 'needs_attention', updated_at = ? WHERE id = ?;`,
          params: [now, order.id],
        },
        {
          sql: `INSERT INTO payments (
            id, order_id, razorpay_payment_id, status, method, amount,
            error_code, error_description, raw_details_json, created_at
          ) VALUES (?, ?, ?, 'captured', ?, ?, 'OVERSELL', 'Payment received but stock insufficient', ?, ?);`,
          params: [
            paymentId,
            order.id,
            payment.razorpayPaymentId,
            payment.method || null,
            payment.amount,
            payment.rawDetailsJson || null,
            now,
          ],
        },
        {
          sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
                VALUES (?, ?, 'oversell_detected', 'system', ?, ?);`,
          params: [
            crypto.randomUUID(),
            order.id,
            `Stock constraint failed during markOrderPaid. Marked 'needs_attention'. Automatic refund flagged. Error: ${errorMsg}`,
            now,
          ],
        },
        {
          sql: `INSERT INTO refunds (
            id, order_id, payment_id, razorpay_refund_id, amount, status, reason, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', 'Automatic flag: Stock oversell on paid order', 'system', ?);`,
          params: [
            crypto.randomUUID(),
            order.id,
            paymentId,
            `flag_${payment.razorpayPaymentId}`,
            payment.amount,
            now,
          ],
        },
      ];

      await orderDbBatch(recoveryStatements);

      const flaggedOrder = (await orderDbQueryFirst<OrderRecord>(
        `SELECT * FROM orders WHERE id = ?`,
        [order.id]
      ))!;

      return {
        success: false,
        status: 'needs_attention',
        order: flaggedOrder,
        oversell: true,
        reason: 'Stock insufficient for order items; marked needs_attention; refund flagged',
      };
    }

    // Re-throw unexpected database failures
    throw error;
  }
}

/**
 * 3. markPaymentFailed
 * Records a failed payment attempt while keeping the order in pending_payment for retry.
 */
export async function markPaymentFailed(params: MarkPaymentFailedInput): Promise<void> {
  const { orderId, razorpayOrderId, razorpayPaymentId, errorCode, errorDescription, amount, actor = 'webhook' } = params;

  let order: OrderRecord | null = null;
  if (orderId) {
    order = await orderDbQueryFirst<OrderRecord>(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  } else if (razorpayOrderId) {
    order = await orderDbQueryFirst<OrderRecord>(
      `SELECT * FROM orders WHERE razorpay_order_id = ?`,
      [razorpayOrderId]
    );
  }

  if (!order) {
    throw new Error(`Order not found for markPaymentFailed: id=${orderId}, rzp=${razorpayOrderId}`);
  }

  const now = new Date().toISOString();
  const paymentRowId = crypto.randomUUID();

  const statements: SqlStatement[] = [
    {
      sql: `INSERT INTO payments (
        id, order_id, razorpay_payment_id, status, method, amount,
        error_code, error_description, raw_details_json, created_at
      ) VALUES (?, ?, ?, 'failed', NULL, ?, ?, ?, NULL, ?);`,
      params: [
        paymentRowId,
        order.id,
        razorpayPaymentId || `failed_${Date.now()}`,
        amount || order.total,
        errorCode || 'PAYMENT_FAILED',
        errorDescription || 'Customer payment attempt failed',
        now,
      ],
    },
    {
      sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
            VALUES (?, ?, 'payment_failed', ?, ?, ?);`,
      params: [
        crypto.randomUUID(),
        order.id,
        actor,
        `Payment attempt failed: ${errorDescription || errorCode || 'Unknown error'}`,
        now,
      ],
    },
    {
      sql: `UPDATE orders SET updated_at = ? WHERE id = ?;`,
      params: [now, order.id],
    },
  ];

  await orderDbBatch(statements);
}

/**
 * 4. expireOrder
 * Transitions orders older than timeout window to 'expired'.
 */
export async function expireOrder(orderId: string): Promise<boolean> {
  const order = await orderDbQueryFirst<OrderRecord>(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  if (!order) return false;

  if (order.status !== 'pending_payment') {
    return false; // Cannot expire already paid or processed orders
  }

  const now = new Date().toISOString();
  await orderDbBatch([
    {
      sql: `UPDATE orders SET status = 'expired', updated_at = ? WHERE id = ? AND status = 'pending_payment';`,
      params: [now, order.id],
    },
    {
      sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
            VALUES (?, ?, 'expired', 'system', 'Order expired due to payment timeout', ?);`,
      params: [crypto.randomUUID(), order.id, now],
    },
  ]);

  return true;
}

/**
 * 5. recordRefund
 * Records a full or partial refund for an order.
 */
export async function recordRefund(params: RecordRefundInput): Promise<RefundRecord> {
  const order = await orderDbQueryFirst<OrderRecord>(`SELECT * FROM orders WHERE id = ?`, [params.orderId]);
  if (!order) {
    throw new Error(`Order not found for refund: ${params.orderId}`);
  }

  const now = new Date().toISOString();
  const refundId = crypto.randomUUID();

  const refundRecord: RefundRecord = {
    id: refundId,
    order_id: order.id,
    payment_id: params.paymentId || null,
    razorpay_refund_id: params.razorpayRefundId,
    amount: params.amount,
    status: 'processed',
    reason: params.reason || 'Requested refund',
    created_by: params.createdBy || 'system',
    created_at: now,
  };

  const isFullRefund = params.amount >= order.total;

  const statements: SqlStatement[] = [
    {
      sql: `INSERT INTO refunds (
        id, order_id, payment_id, razorpay_refund_id, amount, status, reason, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        refundRecord.id,
        refundRecord.order_id,
        refundRecord.payment_id,
        refundRecord.razorpay_refund_id,
        refundRecord.amount,
        refundRecord.status,
        refundRecord.reason,
        refundRecord.created_by,
        refundRecord.created_at,
      ],
    },
    {
      sql: `INSERT INTO order_events (id, order_id, type, actor, note, created_at)
            VALUES (?, ?, 'refunded', ?, ?, ?);`,
      params: [
        crypto.randomUUID(),
        order.id,
        params.createdBy || 'system',
        `Refund of Rs ${(params.amount / 100).toFixed(2)} processed (${params.razorpayRefundId}): ${params.reason || ''}`,
        now,
      ],
    },
  ];

  if (isFullRefund) {
    statements.push({
      sql: `UPDATE orders SET status = 'refunded', updated_at = ? WHERE id = ?;`,
      params: [now, order.id],
    });
  }

  await orderDbBatch(statements);
  return refundRecord;
}

/**
 * 6. getOrderByToken
 * Retrieves customer-facing order details via unguessable public token.
 */
export async function getOrderByToken(publicToken: string): Promise<PublicOrderDetails | null> {
  const order = await orderDbQueryFirst<OrderRecord>(
    `SELECT * FROM orders WHERE public_token = ?`,
    [publicToken]
  );
  if (!order) return null;

  const items = await orderDbQuery<OrderItemSnapshot>(
    `SELECT * FROM order_items WHERE order_id = ? ORDER BY unit_price DESC`,
    [order.id]
  );

  return {
    id: order.id,
    order_number: order.order_number,
    public_token: order.public_token,
    status: order.status,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    shipping_address: {
      line1: order.shipping_line1,
      line2: order.shipping_line2,
      landmark: order.shipping_landmark,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
    },
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    razorpay_order_id: order.razorpay_order_id,
    paid_at: order.paid_at,
    tracking: {
      courier: order.tracking_courier,
      awb: order.tracking_awb,
      url: order.tracking_url,
    },
    items: items.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      variant_id: i.variant_id,
      product_name: i.product_name,
      pack_label: i.pack_label,
      weight_grams: i.weight_grams,
      unit_price: i.unit_price,
      qty: i.qty,
      line_total: i.line_total,
    })),
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

/**
 * Retrieves full order record by internal primary key ID.
 */
export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  return orderDbQueryFirst<OrderRecord>(`SELECT * FROM orders WHERE id = ?`, [orderId]);
}

/**
 * 7. trackOrder
 * Secure customer lookup by Order Number + 10-digit Phone.
 * Returns null on mismatch (anti-enumeration).
 */
export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<OrderTrackingInfo | null> {
  const cleanOrderNumber = orderNumber.trim().toUpperCase();
  const cleanPhone = normalizePhoneNumber(phone);

  if (!cleanOrderNumber || cleanPhone.length !== 10) {
    return null;
  }

  const order = await orderDbQueryFirst<OrderRecord>(
    `SELECT * FROM orders WHERE UPPER(order_number) = ?`,
    [cleanOrderNumber]
  );

  if (!order) return null;

  // Verify phone matches (anti-enumeration)
  const orderPhone = normalizePhoneNumber(order.customer_phone);
  if (orderPhone !== cleanPhone) {
    return null;
  }

  const items = await orderDbQuery<OrderItemSnapshot>(
    `SELECT * FROM order_items WHERE order_id = ?`,
    [order.id]
  );

  const itemCount = items.reduce((acc, i) => acc + i.qty, 0);
  const itemSummary = items.map((i) => `${i.product_name} (${i.pack_label}) × ${i.qty}`).join(', ');

  // Timeline milestones
  const statusRanks: Record<string, number> = {
    pending_payment: 0,
    confirmed: 1,
    packed: 2,
    shipped: 3,
    delivered: 4,
  };

  const currentRank = statusRanks[order.status] ?? 0;

  const milestones: TrackingMilestone[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      timestamp: order.created_at,
      completed: true,
      current: currentRank === 0,
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      timestamp: order.paid_at,
      completed: currentRank >= 1,
      current: currentRank === 1,
    },
    {
      key: 'packed',
      label: 'Packed & Quality Checked',
      timestamp: null,
      completed: currentRank >= 2,
      current: currentRank === 2,
    },
    {
      key: 'shipped',
      label: 'Shipped via Courier',
      timestamp: null,
      completed: currentRank >= 3,
      current: currentRank === 3,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      timestamp: null,
      completed: currentRank >= 4,
      current: currentRank === 4,
    },
  ];

  return {
    order_number: order.order_number,
    status: order.status,
    customer_name: order.customer_name,
    item_count: itemCount,
    item_summary: itemSummary,
    placed_at: order.created_at,
    paid_at: order.paid_at,
    tracking_courier: order.tracking_courier,
    tracking_awb: order.tracking_awb,
    tracking_url: order.tracking_url,
    milestones,
  };
}

/**
 * 8. recordWebhookEvent
 * Idempotent ledger for Razorpay webhook events.
 */
export async function recordWebhookEvent(
  eventId: string,
  type: string,
  payloadSummary?: string
): Promise<{ isDuplicate: boolean; event: WebhookEventRecord }> {
  const existing = await orderDbQueryFirst<WebhookEventRecord>(
    `SELECT * FROM webhook_events WHERE event_id = ?`,
    [eventId]
  );

  if (existing) {
    return { isDuplicate: true, event: existing };
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await orderDbExecute(
    `INSERT INTO webhook_events (id, event_id, type, received_at, processed_at, status, payload_summary)
     VALUES (?, ?, ?, ?, ?, 'received', ?);`,
    [id, eventId, type, now, null, payloadSummary || null]
  );

  return {
    isDuplicate: false,
    event: {
      id,
      event_id: eventId,
      type,
      received_at: now,
      processed_at: null,
      status: 'received',
      payload_summary: payloadSummary || null,
    },
  };
}

/**
 * 9. markWebhookProcessed
 */
export async function markWebhookProcessed(eventId: string, status: 'processed' | 'ignored' | 'failed' = 'processed'): Promise<void> {
  const now = new Date().toISOString();
  await orderDbExecute(
    `UPDATE webhook_events SET status = ?, processed_at = ? WHERE event_id = ?;`,
    [status, now, eventId]
  );
}

/**
 * 10. listOrders (For Admin / Server Functions)
 */
export async function listOrders(filters: OrderListFilters = {}): Promise<OrderListResult> {
  const { status, search, page = 1, limit = 20 } = filters;
  const conditions: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  if (status) {
    conditions.push(`status = ?`);
    params.push(status);
  }

  if (search) {
    conditions.push(`(
      order_number LIKE ? OR
      customer_name LIKE ? OR
      customer_phone LIKE ? OR
      customer_email LIKE ? OR
      razorpay_order_id LIKE ?
    )`);
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const countRow = await orderDbQueryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders ${whereSql};`,
    params
  );
  const total = Number(countRow?.count || 0);

  const offset = (page - 1) * limit;
  const orders = await orderDbQuery<OrderRecord>(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?;`,
    [...params, limit, offset]
  );

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
