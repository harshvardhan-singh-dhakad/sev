// ============================================================
// RASVAT - Core Types
// ============================================================

// ---- Product Types ----
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  weight: string; // e.g. "250g", "500g", "1KG"
  weightGrams: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  image?: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  thumbnail: string;
  ingredients?: string;
  tasteProfile?: string;
  texture?: string;
  shelfLife?: string;
  storageInstructions?: string;
  packagingInfo?: string;
  gstRate?: number;
  hsn?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  recommended: boolean;
  avgRating?: number;
  reviewCount?: number;
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  seoTitle?: string;
  seoDescription?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Planned Final Schema Types (Paise & Grams) ----
export type SpiceLevel = 'mild' | 'medium' | 'hot';

export interface CatalogCategory {
  slug: string;
  name: string;
  description: string;
  display_order: number;
  status: 'active' | 'inactive';
  image?: string;
}

export interface CatalogImage {
  src: string;
  alt: string;
  sort: number;
  is_primary: boolean;
  variant_ids: string[];
}

export interface CatalogVariant {
  id: string;
  label: string;
  weight_grams: number;
  price: number; // in integer paise
  mrp?: number | null; // in integer paise, optional
  sku: string;
  stock_qty: number | null; // null = untracked
  min_qty: number; // default 1
  max_qty: number | null;
  step: number; // default 1
  is_active: boolean;
  sort_order: number;
  badge: string | null;
}

export interface NutritionPer100g {
  energy_kcal?: number;
  protein_g?: number;
  carbohydrates_g?: number;
  fat_g?: number;
  sodium_mg?: number;
  dietary_fiber_g?: number;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  category: string; // slug of category
  short_description: string;
  description: string;
  spice_level: SpiceLevel;
  ingredients: string | null;
  allergens: string | null;
  shelf_life_days: number;
  storage: string;
  veg_mark: 'veg' | 'non-veg';
  country_of_origin: string;
  usage_ideas: string[];
  nutrition_per_100g?: NutritionPer100g | null;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  badge: string | null;
  default_variant_id: string;
  images: CatalogImage[];
  variants: CatalogVariant[];
}

export interface StoreSettings {
  min_cart_value: number; // 19900 paise (Rs 199)
  free_shipping_above: number | null;
  fssai_no: string | null;
  manufacturer: string | null;
  customer_care: string | null;
  bulk_minimum_kg: number;
}

// ---- Order Types ----
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  thumbnail: string;
}

export interface Order {
  id: string;
  orderNumber: string; // ORD-2026-000001
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  taxRate: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingAddress: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ---- Cart Types ----
export interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  weight: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
}

// ---- Bulk Order Types ----
export type BulkEnquiryStatus =
  | 'new'
  | 'contacted'
  | 'quote_sent'
  | 'negotiation'
  | 'approved'
  | 'payment_pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export interface BulkEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  businessName?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  productId?: string;
  productName?: string;
  quantityKg: number;
  customQuantity?: string;
  packagingPreference?: string;
  deliveryLocation: string;
  deliveryCity?: string;
  deliveryState?: string;
  expectedDeliveryDate?: string;
  specialRequirements?: string;
  status: BulkEnquiryStatus;
  internalNotes?: string;
  quotations?: Quotation[];
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  enquiryId: string;
  productName: string;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  validUntil: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface BulkPricingTier {
  id: string;
  name: string;
  minQuantityKg: number;
  maxQuantityKg?: number;
  pricePerKg?: number;
  fixedPrice?: number;
  discountPercent?: number;
  isCustomQuote: boolean;
  displayOrder: number;
  status: 'active' | 'inactive';
}

// ---- Sample Types ----
export type SampleStatus =
  | 'new'
  | 'approved'
  | 'payment_pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'converted_to_bulk'
  | 'cancelled';

export type FollowUpStatus =
  | 'pending'
  | 'interested'
  | 'not_interested'
  | 'follow_up_required'
  | 'quotation_sent'
  | 'bulk_order_created'
  | 'converted';

export interface SampleRequest {
  id: string;
  sampleNumber: string;
  customerName: string;
  businessName?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sampleQuantity: number;
  expectedBulkQuantityKg: number;
  customExpectedBulk?: string;
  address: Address;
  additionalRequirements?: string;
  status: SampleStatus;
  followUpStatus: FollowUpStatus;
  internalNotes?: string;
  bulkEnquiryId?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Customer Types ----
export interface Customer {
  id: string;
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  defaultAddressIndex?: number;
  wishlist: string[]; // product IDs
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Review Types ----
export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  customerCity?: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Blog Types ----
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  author: string;
  authorId: string;
  categoryId: string;
  categoryName?: string;
  tags: string[];
  excerpt: string;
  content: string; // HTML content from TipTap
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  publishedAt?: string;
  status: BlogStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- CMS / Settings Types ----
export interface HeroContent {
  headline: string;
  subtext: string;
  primaryCTA: string;
  primaryCTAUrl: string;
  secondaryCTA: string;
  secondaryCTAUrl: string;
  tertiaryCTA: string;
  tertiaryCTAUrl: string;
  backgroundImage?: string;
  active: boolean;
}

export interface WhyChooseUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  displayOrder: number;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaUrl?: string;
  displayOrder: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  page?: string; // 'home', 'shop', 'bulk', etc.
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessHours?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage?: string;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingCost: number;
  };
  tax: {
    defaultGstRate: number;
    showPricesWithTax: boolean;
  };
}

// ---- Coupon Types ----
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Lead Types ----
export type LeadSource = 'contact_form' | 'bulk_enquiry' | 'sample_enquiry' | 'newsletter' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Admin / Auth Types ----
export type AdminRole = 'super_admin' | 'admin' | 'content_manager' | 'order_manager' | 'inventory_manager';

export interface AdminUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Audit Log Types ----
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  timestamp: string;
}

// ---- Notification Types ----
export interface Notification {
  id: string;
  type: 'new_order' | 'new_bulk_enquiry' | 'new_sample' | 'low_stock' | 'new_customer' | 'new_lead' | 'new_review';
  title: string;
  message: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

// ---- Inventory Log Types ----
export interface InventoryLog {
  id: string;
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  changeType: 'manual_adjustment' | 'order_placed' | 'order_cancelled' | 'order_refunded' | 'import';
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  reason?: string;
  adminId?: string;
  orderId?: string;
  createdAt: string;
}