'use client';

import { useState, useEffect } from 'react';
import { Save, Building, ShieldCheck, Truck, Mail, Info, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreSettingsData {
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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        } else {
          toast.error('Failed to load settings');
        }
      } catch {
        toast.error('Network error loading settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (key: keyof StoreSettingsData, value: string | number | null) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Store settings saved & audit logged');
        setIsDirty(false);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Store Configuration & Rules
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Global parameters for Aron Bites storefront, compliance, cart rules, and B2B orders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {saving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Store Identity & Contact */}
        <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">Store Identity & Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Brand / Store Name
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                required
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Registered Factory / Store Address
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Regulatory & Legal Compliance */}
        <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">Regulatory Compliance (FSSAI & GSTIN)</h2>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Hard Rule:</strong> Fields set to empty/null will be strictly hidden on the public storefront.
              Do not enter mock license numbers.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                FSSAI License Number
              </label>
              <input
                type="text"
                value={settings.fssai_no || ''}
                placeholder="Leave blank if unassigned"
                onChange={(e) => handleChange('fssai_no', e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                GSTIN
              </label>
              <input
                type="text"
                value={settings.gstin || ''}
                placeholder="Leave blank if unassigned"
                onChange={(e) => handleChange('gstin', e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Manufacturer Details
              </label>
              <input
                type="text"
                value={settings.manufacturer || ''}
                placeholder="Leave blank if unassigned"
                onChange={(e) => handleChange('manufacturer', e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Customer Care Info
              </label>
              <input
                type="text"
                value={settings.customer_care || ''}
                placeholder="Leave blank if unassigned"
                onChange={(e) => handleChange('customer_care', e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Cart, Shipping & Bulk Threshold Rules */}
        <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Truck size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">Cart, Shipping & B2B Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Minimum Cart Value (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={settings.min_cart_value_paise / 100}
                  onChange={(e) =>
                    handleChange('min_cart_value_paise', Math.round(parseFloat(e.target.value || '0') * 100))
                  }
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Stored in server as {settings.min_cart_value_paise} paise. Default is ₹199.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Free Shipping Above (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional (leave empty for none)"
                  value={settings.free_shipping_above_paise ? settings.free_shipping_above_paise / 100 : ''}
                  onChange={(e) =>
                    handleChange(
                      'free_shipping_above_paise',
                      e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null
                    )
                  }
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Standard Shipping Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={settings.shipping_charge_paise / 100}
                  onChange={(e) =>
                    handleChange('shipping_charge_paise', Math.round(parseFloat(e.target.value || '0') * 100))
                  }
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Bulk Minimum Order (KG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.bulk_minimum_kg}
                  onChange={(e) => handleChange('bulk_minimum_kg', parseInt(e.target.value || '1', 10))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Single authoritative value. Public copies read from this.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Email Communications */}
        <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Mail size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">Email Communications</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Outbound Email Sender
            </label>
            <input
              type="email"
              required
              value={settings.email_sender}
              onChange={(e) => handleChange('email_sender', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none max-w-md"
            />
          </div>
        </section>
      </form>
    </div>
  );
}
