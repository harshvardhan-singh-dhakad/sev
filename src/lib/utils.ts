import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(sequence).padStart(6, '0')}`;
}

export function generateSampleNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `SMP-${year}-${String(sequence).padStart(6, '0')}`;
}

export function generateEnquiryNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `BLK-${year}-${String(sequence).padStart(6, '0')}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getDiscountPercent(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

export const BULK_QUANTITY_OPTIONS = [
  { label: '10 KG', value: 10 },
  { label: '25 KG', value: 25 },
  { label: '50 KG', value: 50 },
  { label: '100 KG (1 Quintal)', value: 100 },
  { label: '250 KG', value: 250 },
  { label: '500 KG (5 Quintal)', value: 500 },
  { label: '1000 KG+', value: 1000 },
  { label: 'Custom Quantity', value: -1 },
];

export const EXPECTED_BULK_QUANTITY_OPTIONS = [
  { label: '10 KG', value: 10 },
  { label: '25 KG', value: 25 },
  { label: '50 KG', value: 50 },
  { label: '1 Quintal (100 KG)', value: 100 },
  { label: '5 Quintal (500 KG)', value: 500 },
  { label: 'Custom', value: -1 },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry',
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-red-100 text-red-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-violet-100 text-violet-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export const BULK_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quote_sent: 'Quote Sent',
  negotiation: 'Negotiation',
  approved: 'Approved',
  payment_pending: 'Payment Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SAMPLE_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  approved: 'Approved',
  payment_pending: 'Payment Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  converted_to_bulk: 'Converted to Bulk',
  cancelled: 'Cancelled',
};