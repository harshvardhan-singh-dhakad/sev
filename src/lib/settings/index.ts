import { execute, query } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export interface AdminStoreSettings {
  store_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  fssai_no: string | null;
  gstin: string | null;
  manufacturer: string | null;
  customer_care: string | null;
  min_cart_value_paise: number;
  free_shipping_above_paise: number | null;
  shipping_charge_paise: number;
  bulk_minimum_kg: number;
  email_sender: string;
}

const DEFAULT_SETTINGS: AdminStoreSettings = {
  store_name: 'Rasvat Authentic Sev',
  contact_email: 'support@rasvat.in',
  contact_phone: '+91 98765 43210',
  address: 'Indore, Madhya Pradesh 452001, India',
  fssai_no: null,
  gstin: null,
  manufacturer: null,
  customer_care: null,
  min_cart_value_paise: 19900,
  free_shipping_above_paise: null,
  shipping_charge_paise: 5000,
  bulk_minimum_kg: 5,
  email_sender: 'orders@rasvat.in',
};

function asNumber(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getAdminStoreSettings(): Promise<AdminStoreSettings> {
  const rows = await query<{ key: string; value: string }>('SELECT key, value FROM settings');
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const nullable = (key: keyof AdminStoreSettings, fallback: string | null) => values.has(key)
    ? values.get(key) || null
    : fallback;

  return {
    store_name: values.get('store_name') || DEFAULT_SETTINGS.store_name,
    contact_email: values.get('contact_email') || DEFAULT_SETTINGS.contact_email,
    contact_phone: values.get('contact_phone') || DEFAULT_SETTINGS.contact_phone,
    address: values.get('address') || DEFAULT_SETTINGS.address,
    fssai_no: nullable('fssai_no', DEFAULT_SETTINGS.fssai_no),
    gstin: nullable('gstin', DEFAULT_SETTINGS.gstin),
    manufacturer: nullable('manufacturer', DEFAULT_SETTINGS.manufacturer),
    customer_care: nullable('customer_care', DEFAULT_SETTINGS.customer_care),
    min_cart_value_paise: asNumber(values.get('min_cart_value_paise'), DEFAULT_SETTINGS.min_cart_value_paise),
    free_shipping_above_paise: values.has('free_shipping_above_paise')
      ? asNumber(values.get('free_shipping_above_paise'), 0) || null
      : DEFAULT_SETTINGS.free_shipping_above_paise,
    shipping_charge_paise: asNumber(values.get('shipping_charge_paise'), DEFAULT_SETTINGS.shipping_charge_paise),
    bulk_minimum_kg: asNumber(values.get('bulk_minimum_kg'), DEFAULT_SETTINGS.bulk_minimum_kg),
    email_sender: values.get('email_sender') || DEFAULT_SETTINGS.email_sender,
  };
}

export async function updateAdminStoreSettings(
  updates: Partial<AdminStoreSettings>,
  userId?: string,
  userName?: string
): Promise<AdminStoreSettings> {
  const current = await getAdminStoreSettings();
  const now = new Date().toISOString();

  for (const [key, value] of Object.entries(updates)) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    await execute(
      `INSERT INTO settings (key, value, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
      [key, value === null || value === undefined ? '' : String(value), now, userId || null]
    );
  }

  await logAuditEvent({
    userId,
    userName,
    userRole: 'owner',
    action: 'settings_change',
    entityType: 'settings',
    entityId: 'store_settings',
    changesBefore: current as unknown as Record<string, unknown>,
    changesAfter: { ...current, ...updates } as unknown as Record<string, unknown>,
  });

  return getAdminStoreSettings();
}
