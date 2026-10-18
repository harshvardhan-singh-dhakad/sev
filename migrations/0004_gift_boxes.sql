-- Migration: 0004_gift_boxes.sql
-- Create festive_gift_boxes table for customizable gift boxes / hampers per festival

CREATE TABLE IF NOT EXISTS festive_gift_boxes (
  id TEXT PRIMARY KEY,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  image_url TEXT,
  price_paise INTEGER NOT NULL,
  compare_price_paise INTEGER,
  weight_label TEXT,
  description TEXT,
  items_included TEXT, -- JSON array of strings
  badge TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gift_boxes_fest ON festive_gift_boxes(festival_id);
CREATE INDEX IF NOT EXISTS idx_gift_boxes_active ON festive_gift_boxes(is_active);

-- Seed default curated gift boxes for festivals
INSERT OR IGNORE INTO festive_gift_boxes (
  id, festival_id, title, slug, image_url, price_paise, compare_price_paise,
  weight_label, description, items_included, badge, is_active, sort_order, created_at, updated_at
) VALUES
(
  'gbox_diwali_royal',
  'fest_diwali',
  'Shahi Diwali Gold Hamper (1 kg)',
  'shahi-diwali-gold-hamper',
  '/images/placeholder-sev.svg',
  69900,
  89900,
  '1 kg (4 × 250g Packs)',
  'A luxurious gold-finish festive box loaded with authentic stone-ground Malwa namkeen, paired with your personalized greeting card.',
  '["Ujjaini Hing Sev 250g", "Ratlami Laung Sev 250g", "Teekha Indori Mixture 250g", "Khatta Meetha Mixture 250g", "Festive Greeting Postcard", "Royal Gift Box Packaging"]',
  'Bestseller',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'gbox_diwali_deluxe',
  'fest_diwali',
  'Diwali Deluxe Family Celebration Box',
  'diwali-deluxe-family-celebration-box',
  '/images/placeholder-sev.svg',
  49900,
  64900,
  '750g (3 × 250g Packs)',
  'The quintessential trio of Indore: Ratlami, Indori, and Laung sev in a vibrant festive package with personal wishes.',
  '["Ratlami Sev 250g", "Indori Ujjaini Sev 250g", "Laung Sev 250g", "Personalized Festive Greeting Card"]',
  'Festive Special',
  1,
  2,
  datetime('now'),
  datetime('now')
),
(
  'gbox_eid_dawat',
  'fest_eid',
  'Eid Mubarak Dawat Hamper',
  'eid-mubarak-dawat-hamper',
  '/images/placeholder-sev.svg',
  59900,
  74900,
  '900g Assorted',
  'Specially curated for Eid celebrations with fine nylon sev for creamy sheer khurma and rich clove-infused savory snacks.',
  '["Special Thin Nylon Sev 300g (For Sheer Khurma)", "Ratlami Laung Sev 300g", "Special Indori Mixture 300g", "Eid Mubarak Greeting Card"]',
  'Dawat Special',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'gbox_rakhi_prem',
  'fest_rakhi',
  'Rakshabandhan Prem Bandhan Box',
  'rakshabandhan-prem-bandhan-box',
  '/images/placeholder-sev.svg',
  49900,
  64900,
  '800g (3 Packs + Roli Chawal)',
  'Send heartfelt love to your brother or sister across any city in India, complete with traditional roli, chawal and fresh crispy snacks.',
  '["Indori Ujjaini Sev 250g", "Ratlami Sev 250g", "Sweet & Sour Mixture 300g", "Complimentary Roli & Akshat", "Printed Rakhi Greeting Card"]',
  'Bhai-Behen Special',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'gbox_holi_rang',
  'fest_holi',
  'Holi Rangotsav Crunch Combo',
  'holi-rangotsav-crunch-combo',
  '/images/placeholder-sev.svg',
  54900,
  69900,
  '1 kg (4 Packs)',
  'The ultimate Holi party snack combo for homemade chaat garnishing, thandai pairings, and festive hospitality.',
  '["Crispy Nylon Chaat Sev 250g", "Teekha Ratlami Sev 250g", "Indori Poha Sev 250g", "Spicy Mixture 250g", "Holi Greeting Card"]',
  'Rangotsav Special',
  1,
  1,
  datetime('now'),
  datetime('now')
);
