-- Migration: 0005_custom_boxes.sql
-- Seed standard custom box builder options into festive_gift_boxes

INSERT OR IGNORE INTO festive_gift_boxes (
  id, festival_id, title, slug, image_url, price_paise, compare_price_paise,
  weight_label, description, items_included, badge, is_active, sort_order, created_at, updated_at
) VALUES
(
  'custom_box_3pack',
  'fest_diwali',
  'Custom Festive Trio Box (3 × 250g)',
  'custom-festive-trio-box-750g',
  '/images/placeholder-sev.svg',
  34900,
  45000,
  '750g (Choose 3 Snacks)',
  'Build your own festive box. Select any 3 authentic 250g namkeen packs of your choice with personalized greeting postcard.',
  '["Choose any 3 fresh snacks (250g each)", "Festive Gift Box Packaging", "Personalized Festive Greeting Card"]',
  'Custom Box',
  1,
  10,
  datetime('now'),
  datetime('now')
),
(
  'custom_box_4pack',
  'fest_diwali',
  'Custom Royal Family Box (4 × 250g - 1kg)',
  'custom-royal-family-box-1kg',
  '/images/placeholder-sev.svg',
  44900,
  60000,
  '1 kg (Choose 4 Snacks)',
  'Our most popular custom festive box! Choose any 4 authentic 250g namkeen packs of your choice with premium packaging and greeting card.',
  '["Choose any 4 fresh snacks (250g each)", "Royal Gold Festive Packaging", "Personalized Greeting Card with Sender Name"]',
  'Most Popular Custom Box',
  1,
  11,
  datetime('now'),
  datetime('now')
),
(
  'custom_box_6pack',
  'fest_diwali',
  'Custom Grand Uphaar Hamper (6 × 250g - 1.5kg)',
  'custom-grand-uphaar-hamper-1500g',
  '/images/placeholder-sev.svg',
  64900,
  90000,
  '1.5 kg (Choose 6 Snacks)',
  'The grandest celebration hamper. Choose any 6 authentic 250g namkeen packs of your choice with luxury festive packaging.',
  '["Choose any 6 fresh snacks (250g each)", "Grand Festive Hamper Packaging", "Personalized Greeting Card with Sender Name"]',
  'Grand Festive Pack',
  1,
  12,
  datetime('now'),
  datetime('now')
);
