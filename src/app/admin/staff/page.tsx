'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Shield } from 'lucide-react';

interface Staff { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string; }

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function loadStaff() {
    setLoading(true); setError('');
    try { const response = await fetch('/api/admin/staff', { cache: 'no-store' }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Staff list load nahi hui.'); setStaff(data.staff || []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Staff list load nahi hui.'); } finally { setLoading(false); }
  }
  useEffect(() => { void loadStaff(); }, []);
  return <section className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Configuration</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900"><Shield size={23} /> Staff & Roles</h1><p className="mt-1 text-sm text-slate-600">Admin accounts and their current role. Staff changes are not enabled here yet.</p></div><button type="button" onClick={() => void loadStaff()} disabled={loading} className="btn btn-outline"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-8 text-sm text-slate-500">Staff list load ho rahi hai…</p> : staff.length === 0 ? <div className="p-10 text-center"><h2 className="font-bold text-slate-900">Koi admin staff account nahi mila</h2></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Account</th><th className="px-5 py-3">Last login</th></tr></thead><tbody className="divide-y divide-slate-100">{staff.map((member) => <tr key={member.id}><td className="px-5 py-4 font-semibold text-slate-900">{member.name}</td><td className="px-5 py-4 text-slate-600">{member.email}</td><td className="px-5 py-4 capitalize text-slate-700">{member.role}</td><td className="px-5 py-4">{member.isActive ? 'Active' : 'Disabled'}</td><td className="px-5 py-4 text-slate-600">{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never'}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}
