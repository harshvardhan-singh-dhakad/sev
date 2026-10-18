'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Edit,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  Send,
  Eye,
  Palette,
  MessageSquare,
  AlertCircle,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FestivalRecord } from '@/lib/festivals';

const PRESET_COLORS = [
  { label: 'Diwali Gold', hex: '#b45309' },
  { label: 'Deep Royal Crimson', hex: '#991b1b' },
  { label: 'Eid Emerald Green', hex: '#047857' },
  { label: 'Rakhi Magenta / Rose', hex: '#be185d' },
  { label: 'Holi Vibrant Orange', hex: '#ea580c' },
  { label: 'New Year Midnight Slate', hex: '#1e293b' },
];

export default function AdminFestivalsPage() {
  const [festivals, setFestivals] = useState<FestivalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedFestival, setSelectedFestival] = useState<FestivalRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState<'universal' | 'hindu' | 'muslim' | 'sikh' | 'christian'>('universal');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formThemeColor, setFormThemeColor] = useState('#b45309');
  const [formGreetingText, setFormGreetingText] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadFestivals() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/festivals', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load festivals');
      setFestivals(data.festivals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load festivals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFestivals();
  }, []);

  function openEditModal(fest: FestivalRecord) {
    setIsCreating(false);
    setSelectedFestival(fest);
    setFormName(fest.name);
    setFormSlug(fest.slug);
    setFormCategory(fest.religionCategory);
    setFormTagline(fest.tagline);
    setFormDescription(fest.description || '');
    setFormBannerUrl(fest.bannerUrl || '');
    setFormThemeColor(fest.themeColor || '#b45309');
    setFormGreetingText((fest.greetingTemplates || []).join('\n'));
    setFormIsActive(fest.isActive);
  }

  function openCreateModal() {
    setIsCreating(true);
    setSelectedFestival(null);
    setFormName('');
    setFormSlug('');
    setFormCategory('universal');
    setFormTagline('');
    setFormDescription('');
    setFormBannerUrl('');
    setFormThemeColor('#b45309');
    setFormGreetingText('Wishing you and your family happiness and prosperity!\nAuthentic flavors with warm greetings from our home to yours.');
    setFormIsActive(true);
  }

  function closeModal() {
    setSelectedFestival(null);
    setIsCreating(false);
  }

  async function handleToggleActive(fest: FestivalRecord) {
    const newStatus = !fest.isActive;
    try {
      const res = await fetch('/api/admin/festivals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fest.id, isActive: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setFestivals((prev) =>
        prev.map((f) => (f.id === fest.id ? { ...f, isActive: newStatus } : f))
      );
      toast.success(`${fest.name} ${newStatus ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to change status');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const greetingTemplates = formGreetingText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isCreating) {
        const res = await fetch('/api/admin/festivals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug: formSlug,
            religionCategory: formCategory,
            tagline: formTagline,
            description: formDescription,
            bannerUrl: formBannerUrl,
            themeColor: formThemeColor,
            greetingTemplates,
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create festival');
        toast.success('Festival campaign created successfully!');
      } else if (selectedFestival) {
        const res = await fetch('/api/admin/festivals', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedFestival.id,
            name: formName,
            tagline: formTagline,
            description: formDescription,
            bannerUrl: formBannerUrl,
            themeColor: formThemeColor,
            greetingTemplates,
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update festival');
        toast.success('Festival campaign updated!');
      }

      await loadFestivals();
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving festival');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Marketing & Campaigns</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
            <Sparkles size={24} className="text-amber-500" /> Festive Gifting Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage festival landing pages (Diwali, Eid, Rakhi, Holi, etc.), upload banners, and edit greeting card presets.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadFestivals()}
            disabled={loading}
            className="btn btn-outline inline-flex items-center gap-2"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add New Festival
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Festival Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
          <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-primary" />
          Loading festive campaigns from database…
        </div>
      ) : festivals.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Sparkles size={32} className="mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-900">Koi festival campaign nahi hai</h3>
          <p className="text-sm text-slate-500 mt-1">Upar diye button se naya festival add karein.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {festivals.map((fest) => (
            <div
              key={fest.id}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Card Top / Header Bar with theme color */}
              <div>
                <div
                  className="h-3 w-full"
                  style={{ backgroundColor: fest.themeColor || '#d97706' }}
                />
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {fest.religionCategory}
                      </span>
                      <h2 className="text-lg font-black text-slate-900 mt-1">{fest.name}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(fest)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition border ${
                        fest.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {fest.isActive ? '● Active' : '○ Disabled'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                    &quot;{fest.tagline}&quot;
                  </p>

                  {fest.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {fest.description}
                    </p>
                  )}

                  {/* Greetings Preview */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <MessageSquare size={12} /> Greeting Wishes Presets ({fest.greetingTemplates?.length || 0})
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {fest.greetingTemplates?.[0] || 'No greeting template configured'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer / Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/festive/${fest.slug}`}
                  target="_blank"
                  className="btn btn-outline btn-sm h-[34px] px-3 text-xs font-bold inline-flex items-center gap-1.5 bg-white text-slate-700"
                >
                  <Eye size={13} /> View Page
                  <ExternalLink size={11} className="text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => openEditModal(fest)}
                  className="btn btn-primary btn-sm h-[34px] px-4 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Edit size={13} /> Edit Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT FESTIVAL MODAL */}
      {(selectedFestival || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
                  style={{ backgroundColor: formThemeColor }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {isCreating ? 'Create Festive Campaign' : `Edit: ${selectedFestival?.name}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dynamic storefront landing page: <span className="font-mono font-bold">/festive/{formSlug || 'slug'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Festival Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (isCreating) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Diwali Shahi Uphaar, Eid Mubarak Box, Rakhi Prem Kit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200">
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-2 flex items-center border-r border-slate-200 select-none">
                      /festive/
                    </span>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      disabled={!isCreating}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="diwali"
                      className="w-full px-2.5 py-2 text-xs font-mono focus:outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tradition / Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="universal">Universal / Cultural</option>
                    <option value="hindu">Hindu (Diwali, Holi, Rakhi, etc.)</option>
                    <option value="muslim">Muslim (Eid, Ramadan)</option>
                    <option value="sikh">Sikh (Lohri, Baisakhi)</option>
                    <option value="christian">Christian (Christmas, New Year)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Festive Slogan / Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Deepawali ki Shubhkaamnayein, Indore ki Mithas aur Sev ke Saath"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Theme Color Accent
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFormThemeColor(col.hex)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 transition ${
                          formThemeColor === col.hex ? 'ring-2 ring-slate-900 ring-offset-2 scale-105' : 'opacity-85'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formThemeColor}
                    onChange={(e) => setFormThemeColor(e.target.value)}
                    placeholder="#b45309"
                    className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Banner Artwork Image URL
                  </label>
                  <input
                    type="text"
                    value={formBannerUrl}
                    onChange={(e) => setFormBannerUrl(e.target.value)}
                    placeholder="https://... or /images/festivals/diwali-banner.webp"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Upload your festive poster design in Media Library and paste the link here.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Greeting Card Presets (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formGreetingText}
                    onChange={(e) => setFormGreetingText(e.target.value)}
                    placeholder="Enter wishes that customers can click to insert in their greeting card..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                  ></textarea>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ye messages customer checkout page par &quot;Send as Gift&quot; me 1-click select kar sakenge.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Festival Description / Story
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description of this festive hamper collection..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Active Campaign (Visible on website navigation & /festive/{formSlug || 'slug'})
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="btn btn-outline h-[42px] px-5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary h-[42px] px-6 text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Save Festive Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
