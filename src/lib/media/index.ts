import { getCloudflareContext } from '@opennextjs/cloudflare';
import { execute, query, queryFirst } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url: string;
  alt_text: string;
  uploaded_by: string | null;
  usage_count: number;
  created_at: string;
}

interface R2Object {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

interface R2Bucket {
  put(key: string, value: Uint8Array, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function getMediaBucket(): Promise<R2Bucket> {
  const context = await getCloudflareContext({ async: true });
  const bucket = (context.env as Record<string, unknown>).MEDIA as R2Bucket | undefined;
  if (!bucket || typeof bucket.put !== 'function') {
    throw new Error('Cloudflare R2 binding "MEDIA" is not configured for this Worker.');
  }
  return bucket;
}

function validateMagicBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  return riff === 'RIFF' && webp === 'WEBP' ? 'image/webp' : null;
}

function getExtension(mimeType: string): string {
  return mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
}

function publicMediaUrl(filename: string): string {
  return `/api/media/${encodeURIComponent(filename)}`;
}

export async function uploadMedia(file: {
  bytes: Uint8Array;
  originalName: string;
  altText: string;
  uploadedBy?: string;
}): Promise<MediaItem> {
  if (file.bytes.byteLength > MAX_FILE_SIZE) throw new Error('File exceeds maximum size limit of 5 MB');
  const mimeType = validateMagicBytes(file.bytes);
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Invalid image format. Only JPG, PNG, and WebP are allowed.');
  }
  if (!file.altText.trim()) throw new Error('Alt text is required for accessibility.');

  const id = crypto.randomUUID();
  const filename = `${id}.${getExtension(mimeType)}`;
  const url = publicMediaUrl(filename);
  const now = new Date().toISOString();
  await (await getMediaBucket()).put(`uploads/${filename}`, file.bytes, {
    httpMetadata: { contentType: mimeType },
  });

  try {
    await execute(
      `INSERT INTO media (
        id, filename, original_name, mime_type, size_bytes, url, thumbnail_url,
        alt_text, uploaded_by, usage_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, filename, file.originalName, mimeType, file.bytes.byteLength, url, url, file.altText.trim(), file.uploadedBy || null, 0, now]
    );
  } catch (error) {
    // Avoid an orphan object if the database write fails after R2 accepts the upload.
    await (await getMediaBucket()).delete(`uploads/${filename}`);
    throw error;
  }

  const media: MediaItem = {
    id,
    filename,
    original_name: file.originalName,
    mime_type: mimeType,
    size_bytes: file.bytes.byteLength,
    url,
    thumbnail_url: url,
    alt_text: file.altText.trim(),
    uploaded_by: file.uploadedBy || null,
    usage_count: 0,
    created_at: now,
  };
  await logAuditEvent({
    userId: file.uploadedBy,
    action: 'upload_media',
    entityType: 'media',
    entityId: id,
    changesAfter: { filename, size: file.bytes.byteLength, mime: mimeType },
  });
  return media;
}

export async function listMedia(limit = 50, offset = 0): Promise<{ items: MediaItem[]; total: number }> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);
  const count = await queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM media');
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [safeLimit, safeOffset]
  );
  return {
    total: Number(count?.count || 0),
    items: rows as unknown as MediaItem[],
  };
}

export async function deleteMedia(mediaId: string, userId?: string): Promise<void> {
  const media = await queryFirst<Record<string, unknown>>('SELECT * FROM media WHERE id = ?', [mediaId]);
  if (!media) throw new Error('Media not found');
  if (Number(media.usage_count || 0) > 0) {
    throw new Error('Cannot delete media currently in use by active products or content');
  }
  await (await getMediaBucket()).delete(`uploads/${media.filename as string}`);
  await execute('DELETE FROM media WHERE id = ?', [mediaId]);
  await logAuditEvent({
    userId,
    action: 'delete_media',
    entityType: 'media',
    entityId: mediaId,
    changesBefore: media,
  });
}

export async function getMediaObject(filename: string): Promise<R2Object | null> {
  return (await getMediaBucket()).get(`uploads/${filename}`);
}
