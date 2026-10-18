'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Gift,
  RefreshCw,
  Search,
  Copy,
  Check,
  Truck,
  ExternalLink,
  Phone,
  MessageCircle,
  MapPin,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Sample {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  businessName: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  productInterests: string;
  message: string | null;
  status: string;
  trackingUrl: string;
  notes: string;
  createdAt: string;
}

const SAMPLE_STATUS_OPTIONS = [
  { value: 'requested', label: 'Requested (Pending Review)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'approved', label: 'Approved & Packing', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'dispatched', label: 'Dispatched (In Transit)', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 'delivered', label: 'Delivered to Buyer', color: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'rejected', label: 'Declined / Ineligible', color: 'bg-red-50 text-red-800 border-red-200' },
];

export default function AdminSamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [formStatus, setFormStatus] = useState('approved');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadSamples() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/samples', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sample requests load nahi hui.');
      setSamples(data.samples || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sample requests load nahi hui.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSamples();
  }, []);

  function openModal(sample: Sample) {
    setSelectedSample(sample);
    setFormStatus(sample.status || 'approved');
    setFormUrl(sample.trackingUrl || '');
    setFormNotes(sample.notes || '');
    setSaveSuccess(false);
    setSaveError('');
  }

  function closeModal() {
    setSelectedSample(null);
    setSaveSuccess(false);
    setSaveError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSample) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/samples', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSample.id,
          status: formStatus,
          trackingUrl: formUrl,
          notes: formNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update sample');

      setSaveSuccess(true);
      setSamples((prev) =>
        prev.map((s) =>
          s.id === selectedSample.id
            ? { ...s, status: formStatus, trackingUrl: formUrl, notes: formNotes }
            : s
        )
      );

      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error updating sample');
    } finally {
      setSaving(false);
    }
  }

  function copyAddress(sample: Sample, idKey: string) {
    const text = [
      `Recipient: ${sample.name}`,
      sample.businessName ? `Business: ${sample.businessName}` : '',
      `Phone: +91 ${sample.phone}`,
      `Address: ${sample.address}`,
      `City: ${sample.city}, State: ${sample.state}`,
      `PIN Code: ${sample.pincode}`,
      `Sample Items (50g): ${sample.productInterests}`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredSamples = useMemo(() => {
    return samples.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        (item.businessName && item.businessName.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        item.productInterests.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [samples, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: samples.length,
      requested: samples.filter((s) => s.status === 'requested').length,
      approved: samples.filter((s) => s.status === 'approved').length,
      dispatched: samples.filter((s) => s.status === 'dispatched').length,
      delivered: samples.filter((s) => s.status === 'delivered').length,
    };
  }, [samples]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Enquiries & Trials</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
            <Gift size={24} className="text-primary" /> Sample Requests & Kits (50g Packs)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            B2B test sample kits (50g per variety). Review requests, copy parcel labels, and enter courier tracking links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSamples()}
          disabled={loading}
          className="btn btn-outline inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {/* Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'all'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-slate-500 uppercase">Total Requests</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{counts.all}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('requested')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'requested'
              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-amber-700 uppercase">Pending Review</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{counts.requested}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'approved'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-blue-700 uppercase">Approved / Packing</p>
          <p className="mt-1 text-2xl font-black text-blue-900">{counts.approved}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('dispatched')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'dispatched'
              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-purple-700 uppercase">Dispatched</p>
          <p className="mt-1 text-2xl font-black text-purple-900">{counts.dispatched}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'delivered'
              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-bold text-green-700 uppercase">Delivered</p>
          <p className="mt-1 text-2xl font-black text-green-900">{counts.delivered}</p>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Buyer Name, Business, Phone, City, Product..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-primary" />
            Loading sample requests…
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="p-12 text-center">
            <Gift size={32} className="mx-auto mb-3 text-slate-300" />
            <h2 className="font-bold text-slate-900">Abhi koi sample request nahi mili</h2>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try changing your search keywords or filter tab.'
                : 'Sample requests submitted on website will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Buyer & Business</th>
                  <th className="px-5 py-3.5">Delivery Address</th>
                  <th className="px-5 py-3.5">Varieties Requested (50g)</th>
                  <th className="px-5 py-3.5">Status & Tracking</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-slate-50/70 transition">
                    {/* Buyer */}
                    <td className="px-5 py-4 align-top">
                      <p className="font-bold text-slate-900">{sample.name}</p>
                      {sample.businessName && (
                        <p className="text-xs font-semibold text-primary">{sample.businessName}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <a
                          href={`tel:+91${sample.phone}`}
                          className="font-medium text-slate-700 hover:text-primary inline-flex items-center gap-1"
                        >
                          <Phone size={11} /> +91 {sample.phone}
                        </a>
                        <a
                          href={`https://wa.me/91${sample.phone}?text=Hi%20${encodeURIComponent(
                            sample.name
                          )},%20this%20is%20Aron%20Bites%20regarding%20your%20sample%20request`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp"
                        >
                          <MessageCircle size={13} />
                        </a>
                      </div>
                      {sample.email && <p className="text-[11px] text-slate-400 mt-0.5">{sample.email}</p>}
                    </td>

                    {/* Delivery Address */}
                    <td className="px-5 py-4 align-top max-w-[260px]">
                      <div className="text-xs text-slate-700 leading-snug bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p>{sample.address}</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {[sample.city, sample.state].filter(Boolean).join(', ')} - {sample.pincode}
                        </p>
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-5 py-4 align-top max-w-[240px]">
                      <span className="inline-block text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mb-1">
                        50g Sealed Packs
                      </span>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {sample.productInterests}
                      </p>
                      {sample.message && (
                        <p className="mt-1 text-[11px] text-slate-500 italic bg-white p-1 rounded border border-slate-100">
                          &quot;{sample.message}&quot;
                        </p>
                      )}
                    </td>

                    {/* Status & Tracking */}
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                          sample.status === 'requested'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : sample.status === 'approved'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : sample.status === 'dispatched'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : sample.status === 'delivered'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {sample.status}
                      </span>

                      {sample.trackingUrl && (
                        <a
                          href={sample.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <ExternalLink size={12} /> Courier Tracking Link
                        </a>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 align-top text-xs text-slate-500">
                      {new Date(sample.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openModal(sample)}
                          className="btn btn-primary btn-sm h-[34px] px-3 text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Truck size={13} /> Update Status
                        </button>

                        <button
                          type="button"
                          onClick={() => copyAddress(sample, sample.id)}
                          className="btn btn-outline btn-sm h-[30px] px-2.5 text-[11px] font-semibold inline-flex items-center gap-1 bg-white"
                          title="Copy shipping label"
                        >
                          {copiedId === sample.id ? (
                            <>
                              <Check size={12} className="text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy Label
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAMPLE STATUS / DISPATCH MODAL */}
      {selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Gift size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Sample Request: {selectedSample.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedSample.businessName ? `${selectedSample.businessName} · ` : ''}+91 {selectedSample.phone}
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

            {/* Body */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
              {/* Shipping Address Label */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-700" />
                    Parcel Delivery Label
                  </span>
                  <button
                    type="button"
                    onClick={() => copyAddress(selectedSample, 'modal-sample-label')}
                    className="btn btn-outline btn-sm h-[30px] px-3 text-xs font-bold bg-white text-amber-900 border-amber-300 hover:bg-amber-100 inline-flex items-center gap-1.5"
                  >
                    {copiedId === 'modal-sample-label' ? (
                      <>
                        <Check size={13} className="text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy Label
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-amber-200/80">
                  <p className="font-bold text-slate-900">{selectedSample.name} (+91 {selectedSample.phone})</p>
                  {selectedSample.businessName && <p className="font-semibold text-primary">{selectedSample.businessName}</p>}
                  <p>{selectedSample.address}</p>
                  <p className="font-bold mt-1">
                    {selectedSample.city}, {selectedSample.state} - {selectedSample.pincode}
                  </p>
                  <p className="mt-2 text-purple-900 font-semibold border-t border-slate-100 pt-1.5">
                    Items: {selectedSample.productInterests} (50g packs)
                  </p>
                </div>
              </div>

              {/* Status Radio Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Update Request Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SAMPLE_STATUS_OPTIONS.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setFormStatus(st.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition ${
                        formStatus === st.value
                          ? `${st.color} ring-2 ring-primary/20 shadow-xs font-black`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Courier Tracking Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Courier Tracking Link (Shiprocket / Delhivery URL)
                </label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="e.g. https://shiprocket.co/tracking/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Enter the direct link so the buyer can track their 50g sample box.
                </p>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Internal Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Express air shipment, customer verified on call"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Alerts */}
              {saveError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <XCircle size={16} /> {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Sample request updated successfully!
                </div>
              )}

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
                      <Send size={15} /> Save Changes
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
