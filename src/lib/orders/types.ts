/**
 * Razorpay & D1 Orders Engine Types
 * Canonical types for Aron Bites orders, items, payments, refunds, and events.
 */

export type OrderEngineStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'expired'
  | 'needs_attention';

export type PaymentEngineStatus = 'captured' | 'failed' | 'refunded';

export type RefundEngineStatus = 'processed' | 'pending' | 'failed';

export type WebhookEventStatus = 'received' | 'processed' | 'ignored' | 'failed';

export interface ShippingAddressInput {
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemSnapshot {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  pack_label: string;
  weight_grams: number;
  unit_price: number; // in integer paise
  qty: number;
  line_total: number; // in integer paise (snapshot = unit_price * qty)
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  public_token: string;
  status: OrderEngineStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_landmark: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number; // in integer paise
  shipping: number; // in integer paise
  total: number; // in integer paise
  razorpay_order_id: string | null;
  paid_at: string | null;
  tracking_courier: string | null;
  tracking_awb: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  razorpay_payment_id: string;
  status: PaymentEngineStatus;
  method: string | null;
  amount: number; // in integer paise
  error_code: string | null;
  error_description: string | null;
  raw_details_json: string | null;
  created_at: string;
}

export interface RefundRecord {
  id: string;
  order_id: string;
  payment_id: string | null;
  razorpay_refund_id: string;
  amount: number; // in integer paise
  status: RefundEngineStatus;
  reason: string | null;
  created_by: string;
  created_at: string;
}

export interface OrderEventRecord {
  id: string;
  order_id: string;
  type: string;
  actor: string;
  note: string | null;
  created_at: string;
}

export interface WebhookEventRecord {
  id: string;
  event_id: string;
  type: string;
  received_at: string;
  processed_at: string | null;
  status: WebhookEventStatus;
  payload_summary: string | null;
}

export interface OrderItemInput {
  productId?: string;
  variantId: string;
  qty: number;
}

export interface CreatePendingOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddressInput;
  items: OrderItemInput[];
  notes?: string | null;
  customId?: string; // For testing idempotency
}

export interface MarkOrderPaidInput {
  orderId?: string;
  razorpayOrderId?: string;
  payment: {
    razorpayPaymentId: string;
    method?: string | null;
    amount: number; // in integer paise
    rawDetailsJson?: string | null;
  };
  actor?: 'webhook' | 'verify' | 'system' | 'admin';
}

export interface MarkOrderPaidResult {
  success: boolean;
  status: OrderEngineStatus;
  order: OrderRecord;
  alreadyPaid?: boolean;
  oversell?: boolean;
  reason?: string;
}

export interface MarkPaymentFailedInput {
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string | null;
  errorCode?: string | null;
  errorDescription?: string | null;
  amount?: number | null;
  actor?: 'webhook' | 'verify' | 'customer' | 'system';
}

export interface RecordRefundInput {
  orderId?: string;
  razorpayOrderId?: string;
  paymentId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayRefundId: string;
  amount: number; // in integer paise
  reason?: string | null;
  createdBy?: string;
  actor?: 'webhook' | 'system' | 'admin';
}

export interface PublicOrderDetails {
  id: string;
  order_number: string;
  public_token: string;
  status: OrderEngineStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: {
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  razorpay_order_id: string | null;
  paid_at: string | null;
  tracking: {
    courier: string | null;
    awb: string | null;
    url: string | null;
  };
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    product_name: string;
    pack_label: string;
    weight_grams: number;
    unit_price: number;
    qty: number;
    line_total: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface TrackingMilestone {
  key: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered';
  label: string;
  timestamp: string | null;
  completed: boolean;
  current: boolean;
}

export interface OrderTrackingInfo {
  order_number: string;
  status: OrderEngineStatus;
  customer_name: string;
  item_count: number;
  item_summary: string;
  placed_at: string;
  paid_at: string | null;
  tracking_courier: string | null;
  tracking_awb: string | null;
  tracking_url: string | null;
  milestones: TrackingMilestone[];
}

export interface OrderListFilters {
  status?: OrderEngineStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderListResult {
  orders: OrderRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
