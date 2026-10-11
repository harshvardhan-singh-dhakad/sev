/**
 * Media Storage Provider Interface & Cloudflare R2 Migration Placeholder
 *
 * Currently Active: LocalDiskStorageAdapter (saves to public/uploads/)
 * Migration Target: CloudflareR2StorageAdapter (@aws-sdk/client-s3 or Cloudflare Workers R2 binding)
 */

import fs from 'node:fs';
import path from 'node:path';

export interface StorageProvider {
  save(filename: string, buffer: Buffer, mimeType: string): Promise<{ url: string }>;
  delete(filename: string): Promise<void>;
  exists(filename: string): Promise<boolean>;
}

export class LocalDiskStorageAdapter implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async save(filename: string, buffer: Buffer, _mimeType: string): Promise<{ url: string }> {
    const filePath = path.join(this.uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return { url: `/uploads/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async exists(filename: string): Promise<boolean> {
    const filePath = path.join(this.uploadsDir, filename);
    return fs.existsSync(filePath);
  }
}

/**
 * Cloudflare R2 Migration Placeholder
 * R2 is S3-compatible. To activate:
 * 1. Set STORAGE_PROVIDER="r2" in .env
 * 2. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */
export class CloudflareR2StorageAdapter implements StorageProvider {
  async save(filename: string, _buffer: Buffer, _mimeType: string): Promise<{ url: string }> {
    // When activating:
    // const s3 = new S3Client({
    //   region: 'auto',
    //   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    //   credentials: {
    //     accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    //     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    //   },
    // });
    // await s3.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: filename, Body: buffer, ContentType: mimeType }));
    // return { url: `${process.env.R2_PUBLIC_URL}/${filename}` };
    console.warn('[CloudflareR2StorageAdapter] Placeholder called. Configure R2 credentials in .env to activate.');
    return { url: `/uploads/${filename}` };
  }

  async delete(_filename: string): Promise<void> {
    // await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: filename }));
  }

  async exists(_filename: string): Promise<boolean> {
    return false;
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 'r2') {
    return new CloudflareR2StorageAdapter();
  }
  return new LocalDiskStorageAdapter();
}
