'use client';

import { useState, useEffect } from 'react';
import { History, Shield, Filter, RefreshCw, ChevronDown, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLogItem {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes_before: Record<string, unknown> | null;
  changes_after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/audit-log?limit=50';
      if (entityFilter) url += `&entityType=${encodeURIComponent(entityFilter)}`;
      if (actionFilter) url += `&action=${encodeURIComponent(actionFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } else {
        toast.error('Failed to load audit logs (requires Owner/Manager permission)');
      }
    } catch {
      toast.error('Network error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 mb-2">
            <Shield size={12} />
            <span>Append-Only Immutable Records</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Security Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tracking all administrative mutations, logins, price updates, stock changes, and configuration edits.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-border hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-border shadow-sm">
        <Filter size={16} className="text-gray-400" />
        <div className="flex items-center gap-2">
          <label htmlFor="entity-select" className="text-xs font-semibold text-gray-600">
            Entity:
          </label>
          <select
            id="entity-select"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-border bg-gray-50 text-ink focus:ring-primary focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="user">User / Auth</option>
            <option value="settings">Settings</option>
            <option value="media">Media</option>
            <option value="product">Products</option>
            <option value="variant">Variants</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="action-select" className="text-xs font-semibold text-gray-600">
            Action:
          </label>
          <select
            id="action-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-border bg-gray-50 text-ink focus:ring-primary focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="login_success">Login</option>
            <option value="settings_change">Settings Change</option>
            <option value="upload_media">Upload Media</option>
            <option value="delete_media">Delete Media</option>
          </select>
        </div>

        <div className="ml-auto text-xs font-semibold text-gray-500">
          Showing <strong>{logs.length}</strong> of <strong>{total}</strong> logged events
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto text-primary mb-2" />
            Loading audit events...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History size={36} className="mx-auto text-gray-300 mb-2" />
            <div className="text-sm font-bold text-ink">No audit logs found</div>
            <p className="text-xs text-gray-500 mt-1">Actions performed by staff will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-border text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const dateStr = new Date(log.created_at).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          <span>{log.user_name || 'System / CLI'}</span>
                        </div>
                        {log.user_role && (
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {log.user_role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">
                        <span className="capitalize">{log.entity_type}</span>{' '}
                        <span className="text-gray-400 font-mono text-[11px]">#{log.entity_id.slice(0, 8)}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(log.changes_before || log.changes_after) ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-primary font-bold hover:bg-red-50 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide' : 'Diff'}</span>
                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Diff Drawer / View if expanded */}
        {expandedId && (
          <div className="p-4 bg-gray-900 text-gray-100 border-t border-border font-mono text-xs overflow-x-auto">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-800">
              <span className="font-bold text-secondary">Mutation Diff Payload (#{expandedId.slice(0, 8)})</span>
              <button
                type="button"
                onClick={() => setExpandedId(null)}
                className="text-gray-400 hover:text-white"
              >
                Close Diff
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-bold text-red-400 mb-1">State Before:</div>
                <pre className="p-2.5 rounded bg-black/50 text-[11px] overflow-x-auto text-gray-300">
                  {JSON.stringify(
                    logs.find((l) => l.id === expandedId)?.changes_before || {},
                    null,
                    2
                  )}
                </pre>
              </div>
              <div>
                <div className="text-[11px] font-bold text-green-400 mb-1">State After:</div>
                <pre className="p-2.5 rounded bg-black/50 text-[11px] overflow-x-auto text-gray-300">
                  {JSON.stringify(
                    logs.find((l) => l.id === expandedId)?.changes_after || {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
