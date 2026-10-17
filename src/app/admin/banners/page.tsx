'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Plus, Save, Trash2, UploadCloud, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { BANNER_PLACEMENTS, type HomepageBanner } from '@/lib/homepage-banner-types';

function newBanner(): HomepageBanner {
  return {
    id: crypto.randomUUID(),
    title: '', imageUrl: '', imageAlt: '', linkUrl: '',
    placement: 'before_hero', displayOrder: 0, enabled: true, startsAt: '', endsAt: '',
  };
}

function toDateTimeInput(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string): string {
  return value ? new Date(value).toISOString() : '';
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/banners');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load banners');
      setBanners(data.banners || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const update = (id: string, changes: Partial<HomepageBanner>) => {
    setBanners((current) => current.map((banner) => banner.id === id ? { ...banner, ...changes } : banner));
  };

  const uploadPoster = async (id: string, file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Poster must be 5 MB or smaller');
      return;
    }
    setUploadingId(id);
    const banner = banners.find((item) => item.id === id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', banner?.imageAlt.trim() || banner?.title.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Poster upload failed');
      update(id, { imageUrl: data.media.url, imageAlt: banner?.imageAlt.trim() || banner?.title.trim() || data.media.alt_text });
      toast.success('Poster uploaded and preview updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Poster upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save banners');
      setBanners(data.banners || []);
      toast.success('Homepage banners saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save banners');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Content & media</p>
          <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Homepage banners</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Add up to 10 offer posters or announcements, choose where they appear, and set optional start and end times.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setBanners((current) => current.length < 10 ? [...current, newBanner()] : current)} disabled={banners.length >= 10} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} /> Add banner
          </button>
          <button type="button" onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-50">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Save banners
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        {banners.length} of 10 banners configured. Enabled banners at the same placement rotate automatically every 5 seconds. Leave dates empty to show a banner right away; set dates to schedule an offer.
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white p-12 text-sm text-gray-500"><RefreshCw size={18} className="animate-spin" />Loading banners…</div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <ImagePlus size={32} className="mx-auto text-gray-400" />
          <h2 className="mt-3 font-bold text-ink">No homepage banners yet</h2>
          <p className="mt-1 text-sm text-gray-500">Add a banner to promote an offer, product, or announcement.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {banners.map((banner, index) => (
            <section key={banner.id} className="grid gap-5 rounded-2xl border border-border bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="font-bold text-ink">Banner {index + 1}</h2>
                  <button type="button" onClick={() => setBanners((current) => current.filter((item) => item.id !== banner.id))} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} />Remove</button>
                </div>
                <label className="block text-xs font-bold text-gray-600">Internal name
                  <input value={banner.title} maxLength={120} onChange={(event) => update(banner.id, { title: event.target.value })} placeholder="Summer offer" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-gray-600">Homepage placement
                    <select value={banner.placement} onChange={(event) => update(banner.id, { placement: event.target.value as HomepageBanner['placement'] })} className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary">
                      {BANNER_PLACEMENTS.map((placement) => <option key={placement.value} value={placement.value}>{placement.label}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-bold text-gray-600">Order (within placement)
                    <input type="number" min="0" max="999" value={banner.displayOrder} onChange={(event) => update(banner.id, { displayOrder: Number(event.target.value) })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                  </label>
                </div>
                <label className="block text-xs font-bold text-gray-600">Poster image URL
                  <input value={banner.imageUrl} onChange={(event) => update(banner.id, { imageUrl: event.target.value })} placeholder="Upload a poster or paste an HTTPS image URL" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="block text-xs font-bold text-gray-600">Poster description (alt text)
                  <input value={banner.imageAlt} maxLength={200} onChange={(event) => update(banner.id, { imageAlt: event.target.value })} placeholder="Describe the poster for screen readers" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="block text-xs font-bold text-gray-600">Click-through link (optional)
                  <input value={banner.linkUrl} onChange={(event) => update(banner.id, { linkUrl: event.target.value })} placeholder="/shop or https://example.com" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-gray-600">Starts at (optional)
                    <input type="datetime-local" value={toDateTimeInput(banner.startsAt)} onChange={(event) => update(banner.id, { startsAt: fromDateTimeInput(event.target.value) })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                  </label>
                  <label className="block text-xs font-bold text-gray-600">Ends at (optional)
                    <input type="datetime-local" value={toDateTimeInput(banner.endsAt)} onChange={(event) => update(banner.id, { endsAt: fromDateTimeInput(event.target.value) })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm font-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary" />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <input type="checkbox" checked={banner.enabled} onChange={(event) => update(banner.id, { enabled: event.target.checked })} className="h-4 w-4 accent-primary" />
                  Banner is enabled
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-ink"><Eye size={16} className="text-primary" />Poster preview</div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-gray-50">
                  {banner.imageUrl ? <Image src={banner.imageUrl} alt={banner.imageAlt || banner.title || 'Banner poster preview'} fill unoptimized sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-400"><ImagePlus size={28} />Upload or paste a poster URL</div>}
                </div>
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-gray-50">
                  {uploadingId === banner.id ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {uploadingId === banner.id ? 'Uploading poster…' : 'Upload poster (JPG, PNG, WebP)'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingId !== null} onChange={(event) => { void uploadPoster(banner.id, event.target.files?.[0]); event.currentTarget.value = ''; }} className="sr-only" />
                </label>
                <p className="text-xs leading-5 text-gray-500">Use a wide poster for best results. Maximum upload size is 5 MB. The uploaded image is stored in Media Library.</p>
              </div>
            </section>
          ))}
        </div>
      )}

      {banners.length > 0 && (
        <div className="flex justify-end border-t border-border pt-5">
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50">{saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}Save banners</button>
        </div>
      )}
    </div>
  );
}
