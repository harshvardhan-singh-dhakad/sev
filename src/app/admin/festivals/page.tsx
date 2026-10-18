'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
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
  Gift,
  Package,
  Tag,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FestivalRecord, GiftBoxRecord } from '@/lib/festivals';

const PRESET_COLORS = [
  { label: 'Diwali Gold', hex: '#b45309' },
  { label: 'Deep Royal Crimson', hex: '#991b1b' },
  { label: 'Eid Emerald Green', hex: '#047857' },
  { label: 'Rakhi Magenta / Rose', hex: '#be185d' },
  { label: 'Holi Vibrant Orange', hex: '#ea580c' },
  { label: 'New Year Midnight Slate', hex: '#1e293b' },
];

export default function AdminFestivalsPage() {
  const [activeTab, setActiveTab] = useState<'festivals' | 'boxes'>('festivals');

  // FESTIVALS STATE
  const [festivals, setFestivals] = useState<FestivalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // FESTIVAL MODAL STATE
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

  // GIFT BOXES STATE
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxRecord[]>([]);
  const [loadingBoxes, setLoadingBoxes] = useState(false);
  const [boxFestivalFilter, setBoxFestivalFilter] = useState('all');

  // GIFT BOX MODAL STATE
  const [selectedBox, setSelectedBox] = useState<GiftBoxRecord | null>(null);
  const [isCreatingBox, setIsCreatingBox] = useState(false);
  const [boxTitle, setBoxTitle] = useState('');
  const [boxFestivalId, setBoxFestivalId] = useState('');
  const [boxPrice, setBoxPrice] = useState('');
  const [boxComparePrice, setBoxComparePrice] = useState('');
  const [boxWeightLabel, setBoxWeightLabel] = useState('');
  const [boxImageUrl, setBoxImageUrl] = useState('');
  const [boxDescription, setBoxDescription] = useState('');
  const [boxItemsText, setBoxItemsText] = useState('');
  const [boxBadge, setBoxBadge] = useState('Bestseller');
  const [boxIsActive, setBoxIsActive] = useState(true);
  const [savingBox, setSavingBox] = useState(false);

  // Load Festivals
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

  // Load Gift Boxes
  async function loadGiftBoxes() {
    setLoadingBoxes(true);
    try {
      const res = await fetch('/api/admin/festivals/gift-boxes', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load gift boxes');
      setGiftBoxes(data.boxes || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load gift boxes');
    } finally {
      setLoadingBoxes(false);
    }
  }

  useEffect(() => {
    void loadFestivals();
    void loadGiftBoxes();
  }, []);

  // Festival Actions
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
    setFormGreetingText(
      'Wishing you and your family happiness and prosperity!\nAuthentic flavors with warm greetings from our home to yours.'
    );
    setFormIsActive(true);
  }

  function closeModal() {
    setSelectedFestival(null);
    setIsCreating(false);
  }

  async function handleToggleFestivalActive(fest: FestivalRecord) {
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
      toast.success(`${fest.name} ${newStatus ? 'activated (Live)' : 'deactivated (Hidden)'}`);
    } catch {
      toast.error('Failed to change status');
    }
  }

  async function handleSaveFestival(e: React.FormEvent) {
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

  // Gift Box Actions
  function openCreateBoxModal() {
    setIsCreatingBox(true);
    setSelectedBox(null);
    setBoxTitle('');
    setBoxFestivalId(festivals[0]?.id || 'fest_diwali');
    setBoxPrice('');
    setBoxComparePrice('');
    setBoxWeightLabel('1 kg (4 × 250g Packs)');
    setBoxImageUrl('/images/placeholder-sev.svg');
    setBoxDescription('Curated festive box filled with freshly made Malwa snacks and sweets.');
    setBoxItemsText('Ujjaini Hing Sev 250g\nRatlami Laung Sev 250g\nTeekha Mixture 250g\nFestive Greeting Postcard');
    setBoxBadge('Bestseller');
    setBoxIsActive(true);
  }

  function openEditBoxModal(box: GiftBoxRecord) {
    setIsCreatingBox(false);
    setSelectedBox(box);
    setBoxTitle(box.title);
    setBoxFestivalId(box.festivalId);
    setBoxPrice(String(box.pricePaise / 100));
    setBoxComparePrice(box.comparePricePaise ? String(box.comparePricePaise / 100) : '');
    setBoxWeightLabel(box.weightLabel || '');
    setBoxImageUrl(box.imageUrl || '');
    setBoxDescription(box.description || '');
    setBoxItemsText((box.itemsIncluded || []).join('\n'));
    setBoxBadge(box.badge || '');
    setBoxIsActive(box.isActive);
  }

  function closeBoxModal() {
    setSelectedBox(null);
    setIsCreatingBox(false);
  }

  async function handleToggleBoxActive(box: GiftBoxRecord) {
    const newStatus = !box.isActive;
    try {
      const res = await fetch('/api/admin/festivals/gift-boxes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: box.id, isActive: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setGiftBoxes((prev) =>
        prev.map((b) => (b.id === box.id ? { ...b, isActive: newStatus } : b))
      );
      toast.success(`${box.title} ${newStatus ? 'activated (Live)' : 'deactivated (Hidden)'}`);
    } catch {
      toast.error('Failed to change gift box status');
    }
  }

  async function handleDeleteBox(box: GiftBoxRecord) {
    if (!confirm(`Are you sure you want to delete "${box.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/festivals/gift-boxes?id=${encodeURIComponent(box.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setGiftBoxes((prev) => prev.filter((b) => b.id !== box.id));
      toast.success('Gift box removed');
    } catch {
      toast.error('Failed to delete gift box');
    }
  }

  async function handleSaveBox(e: React.FormEvent) {
    e.preventDefault();
    setSavingBox(true);

    const priceNum = parseFloat(boxPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid selling price in ₹');
      setSavingBox(false);
      return;
    }

    const pricePaise = Math.round(priceNum * 100);
    const comparePriceNum = parseFloat(boxComparePrice);
    const comparePricePaise = !isNaN(comparePriceNum) && comparePriceNum > 0 ? Math.round(comparePriceNum * 100) : null;

    const itemsIncluded = boxItemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isCreatingBox) {
        const res = await fetch('/api/admin/festivals/gift-boxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            festivalId: boxFestivalId,
            title: boxTitle,
            pricePaise,
            comparePricePaise,
            weightLabel: boxWeightLabel,
            imageUrl: boxImageUrl,
            description: boxDescription,
            itemsIncluded,
            badge: boxBadge,
            isActive: boxIsActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create gift box');
        toast.success('Gift box created successfully!');
      } else if (selectedBox) {
        const res = await fetch('/api/admin/festivals/gift-boxes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedBox.id,
            festivalId: boxFestivalId,
            title: boxTitle,
            pricePaise,
            comparePricePaise,
            weightLabel: boxWeightLabel,
            imageUrl: boxImageUrl,
            description: boxDescription,
            itemsIncluded,
            badge: boxBadge,
            isActive: boxIsActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update gift box');
        toast.success('Gift box updated successfully!');
      }

      await loadGiftBoxes();
      closeBoxModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving gift box');
    } finally {
      setSavingBox(false);
    }
  }

  // Filtered Festivals
  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      if (statusFilter === 'active') return f.isActive;
      if (statusFilter === 'inactive') return !f.isActive;
      return true;
    });
  }, [festivals, statusFilter]);

  // Filtered Gift Boxes
  const filteredGiftBoxes = useMemo(() => {
    return giftBoxes.filter((b) => {
      if (boxFestivalFilter !== 'all' && b.festivalId !== boxFestivalFilter) return false;
      return true;
    });
  }, [giftBoxes, boxFestivalFilter]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Marketing & Gifting</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
            <Sparkles size={24} className="text-amber-500" /> Festive Gifting & Boxes Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage festival campaigns (Diwali, Eid, Rakhi, Holi), toggle active/deactive status, and add custom gift hampers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              void loadFestivals();
              void loadGiftBoxes();
            }}
            disabled={loading || loadingBoxes}
            className="btn btn-outline inline-flex items-center gap-2"
          >
            <RefreshCw size={15} className={loading || loadingBoxes ? 'animate-spin' : ''} /> Refresh
          </button>

          {activeTab === 'festivals' ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} /> Add Festival
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateBoxModal}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} /> Add Gift Box
            </button>
          )}
        </div>
      </header>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('festivals')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'festivals'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles size={16} /> Festive Campaigns ({festivals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('boxes')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'boxes'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Gift size={16} /> Gift Boxes & Hampers ({giftBoxes.length})
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: FESTIVALS MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeTab === 'festivals' && (
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              All ({festivals.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              ● Active Live ({festivals.filter((f) => f.isActive).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                statusFilter === 'inactive'
                  ? 'bg-slate-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ○ Disabled ({festivals.filter((f) => !f.isActive).length})
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
              <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-primary" />
              Loading festive campaigns from database…
            </div>
          ) : filteredFestivals.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <Sparkles size={32} className="mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-900">Koi festival match nahi hua</h3>
              <p className="text-sm text-slate-500 mt-1">Status filter tab change karein ya naya festival banayein.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFestivals.map((fest) => (
                <div
                  key={fest.id}
                  className={`rounded-3xl border transition-all duration-200 bg-white overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    fest.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
                  }`}
                >
                  {/* Top Bar with theme color */}
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

                        {/* Interactive Toggle Switch */}
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleFestivalActive(fest)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              fest.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                            role="switch"
                            aria-checked={fest.isActive}
                            title={fest.isActive ? 'Click to Disable festival' : 'Click to Activate festival'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                fest.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider ${
                              fest.isActive ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {fest.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GIFT BOXES & HAMPERS MANAGEMENT                   */}
      {/* ======================================================== */}
      {activeTab === 'boxes' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Filter by Festival:
              </label>
              <select
                value={boxFestivalFilter}
                onChange={(e) => setBoxFestivalFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Festivals ({giftBoxes.length})</option>
                {festivals.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateBoxModal}
              className="btn btn-primary btn-sm h-[36px] px-4 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add New Gift Box
            </button>
          </div>

          {loadingBoxes ? (
            <div className="p-16 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
              <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-primary" />
              Loading gift boxes from database…
            </div>
          ) : filteredGiftBoxes.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <Gift size={32} className="mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-900">Koi gift box nahi mila</h3>
              <p className="text-sm text-slate-500 mt-1">
                Upar diye button se naya gift box ya hamper add karein.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGiftBoxes.map((box) => (
                <div
                  key={box.id}
                  className={`rounded-3xl border transition-all duration-200 bg-white overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    box.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {box.badge && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {box.badge}
                          </span>
                        )}
                        <h3 className="text-base font-black text-slate-900 mt-1.5 leading-tight">
                          {box.title}
                        </h3>
                        <p className="text-xs text-primary font-bold mt-0.5">
                          {box.festivalName || 'Festive Gifting'}
                        </p>
                      </div>

                      {/* Interactive Toggle Switch for Gift Box */}
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleBoxActive(box)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            box.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          role="switch"
                          aria-checked={box.isActive}
                          title={box.isActive ? 'Click to Disable Gift Box' : 'Click to Activate Gift Box'}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              box.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            box.isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {box.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Price and Weight */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-slate-900">
                        ₹{(box.pricePaise / 100).toFixed(0)}
                      </span>
                      {box.comparePricePaise && box.comparePricePaise > box.pricePaise && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{(box.comparePricePaise / 100).toFixed(0)}
                        </span>
                      )}
                      {box.weightLabel && (
                        <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg ml-auto">
                          {box.weightLabel}
                        </span>
                      )}
                    </div>

                    {box.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {box.description}
                      </p>
                    )}

                    {/* Included Items Checklist */}
                    {box.itemsIncluded && box.itemsIncluded.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Inside the Box ({box.itemsIncluded.length} items):
                        </p>
                        <div className="space-y-1">
                          {box.itemsIncluded.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <Check size={12} className="text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{item}</span>
                            </div>
                          ))}
                          {box.itemsIncluded.length > 3 && (
                            <p className="text-[11px] text-slate-400 italic">
                              +{box.itemsIncluded.length - 3} more items included
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteBox(box)}
                      className="text-xs text-red-600 hover:text-red-700 font-bold p-1.5 inline-flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditBoxModal(box)}
                      className="btn btn-outline btn-sm h-[32px] px-3.5 text-xs font-bold inline-flex items-center gap-1.5 bg-white text-slate-800"
                    >
                      <Edit size={13} /> Edit Box
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT FESTIVAL                          */}
      {/* ======================================================== */}
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
                    Landing page: <span className="font-mono font-bold">/festive/{formSlug || 'slug'}</span>
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
            <form onSubmit={handleSaveFestival} className="p-5 sm:p-6 space-y-5">
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
                      if (isCreating && !formSlug) {
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                        );
                      }
                    }}
                    placeholder="e.g. Diwali Shahi Uphaar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="e.g. diwali"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Occasion / Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="hindu">Hindu (Diwali, Rakhi, Holi)</option>
                    <option value="muslim">Muslim (Eid Mubarak, Ramadan)</option>
                    <option value="universal">Universal / Corporate (New Year, Celebrations)</option>
                    <option value="sikh">Sikh (Gurpurab, Baisakhi)</option>
                    <option value="christian">Christian (Christmas, Easter)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tagline (Hindi / Hinglish Punchline) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Deepawali ki Shubhkaamnayein, Indore ki Mithas aur Sev ke Saath"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tell your customers about this festive collection..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Festive Theme Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormThemeColor(c.hex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                          formThemeColor === c.hex ? 'ring-2 ring-primary border-primary' : 'border-slate-200'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Banner Design / Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formBannerUrl}
                    onChange={(e) => setFormBannerUrl(e.target.value)}
                    placeholder="https://... or upload from Media Library"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Greeting Card Message Templates (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formGreetingText}
                    onChange={(e) => setFormGreetingText(e.target.value)}
                    placeholder="Enter greeting wishes, one per line..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                {/* Status Toggle Switch inside Modal */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                      Festival Campaign Status
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formIsActive
                        ? 'Active — visible on website storefront and checkout occasion list'
                        : 'Disabled — hidden from public store'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={formIsActive}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

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
                  {saving ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {isCreating ? 'Create Festival' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT GIFT BOX                          */}
      {/* ======================================================== */}
      {(selectedBox || isCreatingBox) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                  <Gift size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {isCreatingBox ? 'Add New Festive Gift Box' : `Edit: ${selectedBox?.title}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Gift box design, contents, and price specification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeBoxModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBox} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gift Box Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={boxTitle}
                    onChange={(e) => setBoxTitle(e.target.value)}
                    placeholder="e.g. Shahi Diwali Gold Hamper (1 kg)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assigned Festival *
                  </label>
                  <select
                    value={boxFestivalId}
                    onChange={(e) => setBoxFestivalId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {festivals.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.religionCategory})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Packaging / Weight Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={boxWeightLabel}
                    onChange={(e) => setBoxWeightLabel(e.target.value)}
                    placeholder="e.g. 1 kg (4 × 250g Packs)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={boxPrice}
                      onChange={(e) => setBoxPrice(e.target.value)}
                      placeholder="699"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Original MRP (Strike ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={boxComparePrice}
                      onChange={(e) => setBoxComparePrice(e.target.value)}
                      placeholder="899"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={boxBadge}
                    onChange={(e) => setBoxBadge(e.target.value)}
                    placeholder="e.g. Bestseller, Royal Box, Festive Special"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Image / Box Design URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={boxImageUrl}
                    onChange={(e) => setBoxImageUrl(e.target.value)}
                    placeholder="https://... or /images/placeholder-sev.svg"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Box Description
                  </label>
                  <textarea
                    rows={2}
                    value={boxDescription}
                    onChange={(e) => setBoxDescription(e.target.value)}
                    placeholder="Short description highlighting the festive packaging..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Items Included Inside the Box (1 per line) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={boxItemsText}
                    onChange={(e) => setBoxItemsText(e.target.value)}
                    placeholder="Ujjaini Hing Sev 250g&#10;Ratlami Laung Sev 250g&#10;Teekha Indori Mixture 250g&#10;Festive Greeting Postcard"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Status Toggle Switch inside Box Modal */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                      Gift Box Status
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {boxIsActive ? 'Active — Live and purchasable by customers' : 'Disabled — Hidden from storefront'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBoxIsActive(!boxIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      boxIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={boxIsActive}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        boxIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeBoxModal}
                  disabled={savingBox}
                  className="btn btn-outline h-[42px] px-5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBox}
                  className="btn btn-primary h-[42px] px-6 text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {savingBox ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {isCreatingBox ? 'Create Gift Box' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
