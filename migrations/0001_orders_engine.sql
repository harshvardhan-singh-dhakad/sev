-- ============================================================
-- Migration: 0001_orders_engine.sql
-- Description: Razorpay Orders Engine Schema for Cloudflare D1
-- ============================================================

-- Catalog tables are required by the order-engine foreign keys and stock
-- trigger below. Keep these minimal columns in the first migration; 0002 adds
-- the richer storefront/admin fields.
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_slug TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  spice_level TEXT NOT NULL DEFAULT 'mild',
  storage TEXT NOT NULL DEFAULT '',
  veg_mark TEXT NOT NULL DEFAULT 'veg',
  country_of_origin TEXT NOT NULL DEFAULT 'India',
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  label TEXT NOT NULL,
  weight_grams INTEGER NOT NULL,
  price_paise INTEGER NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  stock_qty INTEGER,
  min_qty INTEGER NOT NULL DEFAULT 1,
  max_qty INTEGER,
  step INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  public_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK(status IN (
    'pending_payment',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'expired',
    'needs_attention'
  )) DEFAULT 'pending_payment',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_line1 TEXT NOT NULL,
  shipping_line2 TEXT,
  shipping_landmark TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  subtotal INTEGER NOT NULL, -- in integer paise
  shipping INTEGER NOT NULL DEFAULT 0, -- in integer paise
  total INTEGER NOT NULL, -- in integer paise
  razorpay_order_id TEXT UNIQUE,
  paid_at TEXT,
  tracking_courier TEXT,
  tracking_awb TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_public_token ON orders(public_token);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 2. Order Items Table (Snapshot of product/variant details at checkout)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  pack_label TEXT NOT NULL,
  weight_grams INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- integer paise
  qty INTEGER NOT NULL CHECK (qty > 0),
  line_total INTEGER NOT NULL, -- integer paise (unit_price * qty)
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'captured', 'failed', etc.
  method TEXT, -- 'upi', 'card', 'netbanking', 'wallet'
  amount INTEGER NOT NULL, -- integer paise
  error_code TEXT,
  error_description TEXT,
  raw_details_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- 4. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  razorpay_refund_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- integer paise
  status TEXT NOT NULL DEFAULT 'processed',
  reason TEXT,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_razorpay_refund_id ON refunds(razorpay_refund_id);

-- 5. Webhook Events Table (For idempotency and auditing)
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  status TEXT NOT NULL CHECK(status IN ('received', 'processed', 'ignored', 'failed')) DEFAULT 'received',
  payload_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- 6. Order Events Table (Timeline and state change audit log)
CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'created', 'paid', 'stock_decremented', 'payment_failed', 'status_changed', 'refunded', 'oversell_detected', etc.
  actor TEXT NOT NULL, -- 'customer', 'system', 'webhook', 'admin'
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

-- 7. Collision-Safe Order Sequence Counter
CREATE TABLE IF NOT EXISTS order_sequences (
  year_month TEXT PRIMARY KEY, -- e.g. '2610'
  last_seq INTEGER NOT NULL DEFAULT 0
);

-- 8. Negative Stock Prevention Trigger
-- Ensures any batch decrement that would take stock_qty < 0 fails immediately and rolls back the batch
CREATE TRIGGER IF NOT EXISTS prevent_negative_stock
BEFORE UPDATE OF stock_qty ON product_variants
FOR EACH ROW
WHEN NEW.stock_qty IS NOT NULL AND NEW.stock_qty < 0
BEGIN
  SELECT RAISE(ABORT, 'CHECK constraint failed: stock_qty cannot be negative');
END;
