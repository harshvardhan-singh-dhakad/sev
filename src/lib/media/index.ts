import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
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

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateMagicBytes(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // WebP: RIFF .... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

export async function uploadMedia(file: {
  buffer: Buffer;
  originalName: string;
  altText: string;
  uploadedBy?: string;
}): Promise<MediaItem> {
  if (file.buffer.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size limit of 5 MB');
  }

  const detectedMime = validateMagicBytes(file.buffer);
  if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    throw new Error('Invalid image format. Only JPG, PNG, and WebP are allowed.');
  }

  if (!file.altText || file.altText.trim() === '') {
    throw new Error('Alt text is required for accessibility.');
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const ext = detectedMime === 'image/jpeg' ? 'jpg' : detectedMime === 'image/png' ? 'png' : 'webp';
  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);

  const url = `/uploads/${filename}`;
  const thumbnailUrl = url; // Thumbnails reuse same optimized local path
  const now = new Date().toISOString();

  const db = getDb();
  db.prepare(`
    INSERT INTO media (
      id, filename, original_name, mime_type, size_bytes,
      url, thumbnail_url, alt_text, uploaded_by, usage_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    filename,
    file.originalName,
    detectedMime,
    file.buffer.length,
    url,
    thumbnailUrl,
    file.altText.trim(),
    file.uploadedBy || null,
    0,
    now
  );

  const mediaItem: MediaItem = {
    id,
    filename,
    original_name: file.originalName,
    mime_type: detectedMime,
    size_bytes: file.buffer.length,
    url,
    thumbnail_url: thumbnailUrl,
    alt_text: file.altText.trim(),
    uploaded_by: file.uploadedBy || null,
    usage_count: 0,
    created_at: now,
  };

  logAuditEvent({
    userId: file.uploadedBy,
    action: 'upload_media',
    entityType: 'media',
    entityId: id,
    changesAfter: { filename, size: file.buffer.length, mime: detectedMime },
  });

  return mediaItem;
}

export function listMedia(limit: number = 50, offset: number = 0): { items: MediaItem[]; total: number } {
  const db = getDb();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number };
  const total = countRow ? countRow.count : 0;

  const rows = db.prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as Record<string, unknown>[];

  const items: MediaItem[] = rows.map((r) => ({
    id: r.id as string,
    filename: r.filename as string,
    original_name: r.original_name as string,
    mime_type: r.mime_type as string,
    size_bytes: r.size_bytes as number,
    url: r.url as string,
    thumbnail_url: r.thumbnail_url as string,
    alt_text: r.alt_text as string,
    uploaded_by: r.uploaded_by as string | null,
    usage_count: r.usage_count as number,
    created_at: r.created_at as string,
  }));

  return { items, total };
}

export function deleteMedia(mediaId: string, userId?: string): void {
  const db = getDb();
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(mediaId) as Record<string, unknown> | undefined;

  if (!media) {
    throw new Error('Media not found');
  }

  if ((media.usage_count as number) > 0) {
    throw new Error('Cannot delete media currently in use by active products or content');
  }

  // Remove file from disk
  const filePath = path.join(UPLOADS_DIR, media.filename as string);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM media WHERE id = ?').run(mediaId);

  logAuditEvent({
    userId,
    action: 'delete_media',
    entityType: 'media',
    entityId: mediaId,
    changesBefore: media,
  });
}
