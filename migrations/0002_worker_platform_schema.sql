-- Cloudflare Worker platform schema.
-- 0001 created the order engine. This migration adds every table used by the
-- remaining API routes, so a fresh D1 database has no runtime "no such table"
-- failures.

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
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  identifier TEXT UNIQUE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  locked_until TEXT,
  last_attempt_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

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
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  uploaded_by TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  seo_title TEXT,
  seo_description TEXT,
  product_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- The products table is also used by the order engine from 0001. Add the
-- storefront fields without replacing its existing columns.
ALTER TABLE products ADD COLUMN category_id TEXT;
ALTER TABLE products ADD COLUMN long_description TEXT;
ALTER TABLE products ADD COLUMN images TEXT;
ALTER TABLE products ADD COLUMN thumbnail TEXT;
ALTER TABLE products ADD COLUMN taste_profile TEXT;
ALTER TABLE products ADD COLUMN texture TEXT;
ALTER TABLE products ADD COLUMN storage_instructions TEXT;
ALTER TABLE products ADD COLUMN packaging_info TEXT;
ALTER TABLE products ADD COLUMN gst_rate REAL;
ALTER TABLE products ADD COLUMN hsn TEXT;
ALTER TABLE products ADD COLUMN best_seller INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN recommended INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN avg_rating REAL;
ALTER TABLE products ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN seo_keywords TEXT;
ALTER TABLE products ADD COLUMN og_image TEXT;

-- Preserve the order engine's variant columns while adding the admin API's
-- storefront representation.
ALTER TABLE product_variants ADD COLUMN name TEXT;
ALTER TABLE product_variants ADD COLUMN weight TEXT;
ALTER TABLE product_variants ADD COLUMN price INTEGER;
ALTER TABLE product_variants ADD COLUMN compare_at_price INTEGER;
ALTER TABLE product_variants ADD COLUMN stock INTEGER;
ALTER TABLE product_variants ADD COLUMN low_stock_threshold INTEGER;
ALTER TABLE product_variants ADD COLUMN image TEXT;
ALTER TABLE product_variants ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

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
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS samples (
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
  status TEXT NOT NULL DEFAULT 'requested',
  tracking_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  author_id TEXT,
  category_id TEXT,
  category_name TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  published_at TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
