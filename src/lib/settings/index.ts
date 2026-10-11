import { getDb } from '@/lib/db';
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
  min_cart_value_paise: 19900, // 19900 paise = Rs 199
  free_shipping_above_paise: null,
  shipping_charge_paise: 5000, // Rs 50 flat rate
  bulk_minimum_kg: 5,
  email_sender: 'orders@rasvat.in',
};

export function getAdminStoreSettings(): AdminStoreSettings {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];

  const settingsMap = new Map<string, string>();
  rows.forEach((r) => settingsMap.set(r.key, r.value));

  return {
    store_name: settingsMap.get('store_name') || DEFAULT_SETTINGS.store_name,
    contact_email: settingsMap.get('contact_email') || DEFAULT_SETTINGS.contact_email,
    contact_phone: settingsMap.get('contact_phone') || DEFAULT_SETTINGS.contact_phone,
    address: settingsMap.get('address') || DEFAULT_SETTINGS.address,
    fssai_no: settingsMap.get('fssai_no') || DEFAULT_SETTINGS.fssai_no,
    gstin: settingsMap.get('gstin') || DEFAULT_SETTINGS.gstin,
    manufacturer: settingsMap.get('manufacturer') || DEFAULT_SETTINGS.manufacturer,
    customer_care: settingsMap.get('customer_care') || DEFAULT_SETTINGS.customer_care,
    min_cart_value_paise: settingsMap.has('min_cart_value_paise')
      ? parseInt(settingsMap.get('min_cart_value_paise')!, 10)
      : DEFAULT_SETTINGS.min_cart_value_paise,
    free_shipping_above_paise: settingsMap.has('free_shipping_above_paise')
      ? settingsMap.get('free_shipping_above_paise') === ''
        ? null
        : parseInt(settingsMap.get('free_shipping_above_paise')!, 10)
      : DEFAULT_SETTINGS.free_shipping_above_paise,
    shipping_charge_paise: settingsMap.has('shipping_charge_paise')
      ? parseInt(settingsMap.get('shipping_charge_paise')!, 10)
      : DEFAULT_SETTINGS.shipping_charge_paise,
    bulk_minimum_kg: settingsMap.has('bulk_minimum_kg')
      ? parseInt(settingsMap.get('bulk_minimum_kg')!, 10)
      : DEFAULT_SETTINGS.bulk_minimum_kg,
    email_sender: settingsMap.get('email_sender') || DEFAULT_SETTINGS.email_sender,
  };
}

export function updateAdminStoreSettings(
  updates: Partial<AdminStoreSettings>,
  userId?: string,
  userName?: string
): AdminStoreSettings {
  const db = getDb();
  const current = getAdminStoreSettings();
  const now = new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `);

  Object.entries(updates).forEach(([key, val]) => {
    const stringVal = val === null || val === undefined ? '' : String(val);
    insertStmt.run(key, stringVal, now, userId || null);
  });

  // Append to audit log
  logAuditEvent({
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
