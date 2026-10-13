'use client';

/**
 * Browser-safe media client. Uploads are authorised by the admin API; no
 * Cloudflare account token or R2 credential is ever exposed to the browser.
 */
export async function uploadImageToR2(
  file: File,
  _folder = 'uploads',
  altText = file.name
): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.set('file', file);
  form.set('altText', altText);
  const response = await fetch('/api/admin/media', { method: 'POST', body: form });
  const payload = await response.json() as { error?: string; media?: { url: string; filename: string } };
  if (!response.ok || !payload.media) throw new Error(payload.error || 'Unable to upload image');
  return { url: payload.media.url, key: payload.media.filename };
}

export async function deleteFromR2(mediaId: string): Promise<void> {
  const response = await fetch(`/api/admin/media?id=${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || 'Unable to delete image');
  }
}
