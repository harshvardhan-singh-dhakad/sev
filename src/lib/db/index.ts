import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'rasvat.sqlite');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = new DatabaseSync(DB_PATH);
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA journal_mode = WAL;');

  initTables(dbInstance);
  return dbInstance;
}

function initTables(db: DatabaseSync) {
  db.exec(`
    -- Admin Users & RBAC
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'editor', 'support')),
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Secure Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Login Rate Limiting
    CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      identifier TEXT UNIQUE NOT NULL, -- IP or email
      attempts INTEGER NOT NULL DEFAULT 1,
      locked_until TEXT,
      last_attempt_at TEXT NOT NULL
    );

    -- Store Settings (Key-Value)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    );

    -- Append-Only Audit Log
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      user_role TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      changes_before TEXT,
      changes_after TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    -- Media Library & Usage Tracking
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      alt_text TEXT NOT NULL,
      uploaded_by TEXT,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_slug TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      spice_level TEXT NOT NULL CHECK(spice_level IN ('mild', 'medium', 'hot')),
      ingredients TEXT,
      allergens TEXT,
      shelf_life_days INTEGER NOT NULL DEFAULT 180,
      storage TEXT NOT NULL,
      veg_mark TEXT NOT NULL DEFAULT 'veg',
      country_of_origin TEXT NOT NULL DEFAULT 'India',
      usage_ideas_json TEXT,
      nutrition_json TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
      featured INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      default_variant_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Product Variants
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      label TEXT NOT NULL,
      weight_grams INTEGER NOT NULL,
      price_paise INTEGER NOT NULL,
      mrp_paise INTEGER,
      sku TEXT UNIQUE NOT NULL,
      stock_qty INTEGER, -- null = untracked
      min_qty INTEGER NOT NULL DEFAULT 1,
      max_qty INTEGER,
      step INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      barcode_ean TEXT,
      hsn_code TEXT,
      gst_rate_percent REAL DEFAULT 5.0,
      pack_dimensions_mm TEXT,
      gross_weight_g INTEGER,
      case_pack_qty INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Product Images (Many-to-Many Variant link)
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      media_id TEXT,
      src TEXT NOT NULL,
      alt TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      variant_ids_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Bulk Enquiries
    CREATE TABLE IF NOT EXISTS bulk_enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      company TEXT,
      city TEXT,
      state TEXT,
      requirements TEXT NOT NULL,
      estimated_quantity TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'quote_sent', 'negotiation', 'won', 'lost')),
      quote_amount_paise INTEGER,
      internal_notes TEXT,
      follow_up_date TEXT,
      assigned_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Sample Requests
    CREATE TABLE IF NOT EXISTS sample_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      business_name TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      product_interests TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'approved', 'dispatched', 'delivered', 'rejected')),
      courier_name TEXT,
      awb_number TEXT,
      internal_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Contact Inquiries
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'replied', 'closed')),
      internal_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Newsletter Subscribers
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
      consent_timestamp TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'footer',
      unsubscribed_at TEXT,
      created_at TEXT NOT NULL
    );

    -- ============================================================
    -- ORDER ENGINE TABLES (Razorpay & D1)
    -- ============================================================

    -- Orders Table
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
      subtotal INTEGER NOT NULL, -- paise
      shipping INTEGER NOT NULL DEFAULT 0, -- paise
      total INTEGER NOT NULL, -- paise
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

    -- Order Items Table (Immutable snapshot)
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      pack_label TEXT NOT NULL,
      weight_grams INTEGER NOT NULL,
      unit_price INTEGER NOT NULL, -- paise
      qty INTEGER NOT NULL CHECK (qty > 0),
      line_total INTEGER NOT NULL, -- paise
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

    -- Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      razorpay_payment_id TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      method TEXT,
      amount INTEGER NOT NULL, -- paise
      error_code TEXT,
      error_description TEXT,
      raw_details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

    -- Refunds Table
    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      payment_id TEXT,
      razorpay_refund_id TEXT UNIQUE NOT NULL,
      amount INTEGER NOT NULL, -- paise
      status TEXT NOT NULL DEFAULT 'processed',
      reason TEXT,
      created_by TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);

    -- Webhook Events Table
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

    -- Order Events Table (Timeline)
    CREATE TABLE IF NOT EXISTS order_events (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL,
      actor TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

    -- Collision-Safe Order Sequence Counter
    CREATE TABLE IF NOT EXISTS order_sequences (
      year_month TEXT PRIMARY KEY,
      last_seq INTEGER NOT NULL DEFAULT 0
    );

    -- Trigger: Prevent Negative Stock
    CREATE TRIGGER IF NOT EXISTS prevent_negative_stock
    BEFORE UPDATE OF stock_qty ON product_variants
    FOR EACH ROW
    WHEN NEW.stock_qty IS NOT NULL AND NEW.stock_qty < 0
    BEGIN
      SELECT RAISE(ABORT, 'CHECK constraint failed: stock_qty cannot be negative');
    END;
  `);
}

/**
 * Migration helper interface for future Cloudflare D1 migration.
 * Allows executing arbitrary parameterized SQL queries on SQLite locally or D1 in cloud.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.all(...params);
  return result as T[];
}

export async function execute(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
  const db = getDb();
  const stmt = db.prepare(sql);
  const info = stmt.run(...params);
  return {
    changes: info.changes,
    lastInsertRowid: info.lastInsertRowid,
  };
}
