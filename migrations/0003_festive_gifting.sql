-- ============================================================
-- Migration: 0003_festive_gifting.sql
-- Description: Dynamic Festive Gifting Engine & Direct Shipping
-- ============================================================

-- 1. Festivals & Occasions Campaign Table
CREATE TABLE IF NOT EXISTS festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  religion_category TEXT NOT NULL DEFAULT 'universal',
  tagline TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  thumbnail_url TEXT,
  theme_color TEXT DEFAULT '#d97706',
  greeting_templates TEXT, -- JSON array of preset warm wishes
  featured_product_ids TEXT, -- JSON array of product IDs
  is_active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_festivals_slug ON festivals(slug);
CREATE INDEX IF NOT EXISTS idx_festivals_active ON festivals(is_active);

-- Seed default initial cultural & universal festivals
INSERT OR IGNORE INTO festivals (
  id, name, slug, religion_category, tagline, description,
  theme_color, greeting_templates, is_active, sort_order, created_at, updated_at
) VALUES 
(
  'fest_diwali',
  'Diwali Shahi Uphaar',
  'diwali',
  'hindu',
  'Deepawali ki Shubhkaamnayein, Indore ki Mithas aur Sev ke Saath',
  'Send authentic handcrafted Indori Sev, Ratlami Laung Sev, and festive sweets directly to your family and business associates.',
  '#b45309',
  '["Aapko aur aapke poore parivar ko Deepawali ki hardik shubhkaamnayein! Fresh Malwa crunch with love.", "May the divine lights of Diwali bring prosperity, good health, and sweet memories. Sent with lots of love!", "Wishing you a sparkling and crunchy Diwali! Enjoy authentic Indore flavors from our home to yours."]',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'fest_eid',
  'Eid Mubarak Dawat Hamper',
  'eid',
  'muslim',
  'Eid ki Khushiyan, Sheer Khurma Sev aur Lazeez Namkeen ke Saath',
  'Traditional thin nylon vermicelli for sweet sheer khurma and savory clove-infused Ratlami sev for family dawat gatherings.',
  '#047857',
  '["Eid Mubarak! May this joyous day bring peace, happiness, and prosperity to your family.", "Dawat ki mithaas aur khushiyan aapke darwaaze par. Warmest Eid greetings from all of us!", "Sending you heartfelt prayers and traditional festive treats on this blessed Eid."]',
  1,
  2,
  datetime('now'),
  datetime('now')
),
(
  'fest_rakhi',
  'Rakshabandhan Prem Bandhan Box',
  'rakshabandhan',
  'universal',
  'Bhai-Behen ke Atoot Rishte ka Swadisht Uphaar',
  'Send festive love across cities! Pre-packaged gifting box with complimentary roli, chawal, and fresh authentic sev.',
  '#be185d',
  '["Happy Raksha Bandhan! Distance cannot weaken our bond. Enjoy these fresh Indore snacks packed with love.", "Dearest Bhaiya, sending you your favorite crunchy Sev for Rakhi! Miss you lots.", "To the best sister in the world: a special festive treat from Indore just for you. Happy Rakhi!"]',
  1,
  3,
  datetime('now'),
  datetime('now')
),
(
  'fest_holi',
  'Holi Rangotsav Combo',
  'holi',
  'universal',
  'Rang, Gulaal aur Asli Indori Sev ka Mazedar Sangam',
  'Crispy nylon sev for homemade chaat, spicy ratlami sev for gujiya pairings, and authentic festive namkeen snacks.',
  '#dc2626',
  '["Bura na maano Holi hai! Wishing you and your family a vibrant, colorful, and joyful Holi.", "Rang, umang aur Indori crunch ke saath Holi ki dher saari shubhkaamnayein!", "Enjoy the festive spirit with mouth-watering authentic snacks. Happy Holi!"]',
  1,
  4,
  datetime('now'),
  datetime('now')
),
(
  'fest_newyear',
  'New Year & Corporate Celebration Hamper',
  'new-year',
  'universal',
  'Celebrate Fresh Beginnings with Heritage Taste',
  'Executive festive gift sets designed for corporate partners, employees, friends, and clients across India.',
  '#1e293b',
  '["Wishing you and your organization a prosperous and rewarding New Year ahead!", "Thank you for being a valued partner. Warm wishes and delectable treats for the festive season.", "Cheers to fresh beginnings, great health, and continued success!"]',
  1,
  5,
  datetime('now'),
  datetime('now')
);
