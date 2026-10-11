'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Trash2, Image as ImageIcon, Check, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url: string;
  alt_text: string;
  usage_count: number;
  created_at: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        toast.error('Failed to load media');
      }
    } catch {
      toast.error('Network error loading media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5 MB limit');
      return;
    }

    setSelectedFile(file);
    if (!altText) {
      // Pre-fill alt text with cleaned filename
      setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }
    if (!altText.trim()) {
      toast.error('Alt text is required for accessibility');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('altText', altText.trim());

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Media uploaded successfully');
        setSelectedFile(null);
        setAltText('');
        fetchMedia();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Network error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Media deleted successfully');
        setDeleteConfirmId(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Failed to delete media');
      }
    } catch {
      toast.error('Network error deleting media');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Media Library & Assets
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Upload, optimize, and manage imagery for products, categories, and articles with usage protection.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMedia}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-border hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Upload Dropzone Form */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
          <UploadCloud size={16} className="text-primary" />
          Upload New Image (JPG, PNG, WebP ≤ 5 MB)
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* File Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-faint file:text-primary-dark hover:file:bg-red-100 cursor-pointer"
              />
              {selectedFile && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Alt Text Input (Required) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Alt Text <span className="text-red-500">*</span> (Required for Accessibility)
              </label>
              <input
                type="text"
                required
                placeholder="Descriptive label e.g. Indori Sev in brass bowl"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-gray-50 text-xs sm:text-sm text-ink focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile || !altText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Validating & Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Upload & Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <ImageIcon size={18} className="text-primary" />
            Media Assets Repository ({items.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto text-primary mb-2" />
            Loading media assets...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon size={36} className="mx-auto text-gray-300 mb-2" />
            <div className="text-sm font-bold text-ink">No media assets uploaded yet</div>
            <p className="text-xs text-gray-500 mt-1">Upload photography above to use across the catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border overflow-hidden bg-gray-50 flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-white">
                  <Image
                    src={item.url}
                    alt={item.alt_text}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />

                  {/* Usage Badge */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      item.usage_count > 0
                        ? 'bg-blue-600/90 text-white'
                        : 'bg-gray-800/80 text-white'
                    }`}
                  >
                    {item.usage_count > 0 ? `Used (${item.usage_count})` : 'Unused'}
                  </span>
                </div>

                <div className="p-3 bg-white border-t border-border space-y-1">
                  <div className="text-xs font-bold text-ink truncate" title={item.original_name}>
                    {item.original_name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate" title={item.alt_text}>
                    Alt: {item.alt_text}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {(item.size_bytes / 1024).toFixed(0)} KB
                    </span>

                    {/* Delete button with confirmation */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 rounded text-[10px] text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        disabled={item.usage_count > 0}
                        title={item.usage_count > 0 ? 'Cannot delete media currently in use' : 'Delete image'}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
