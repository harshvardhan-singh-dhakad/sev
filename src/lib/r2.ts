// Cloudflare R2 image upload helper
// Uses Cloudflare R2 API via presigned URLs or direct API

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL; // e.g. https://pub-xxx.r2.dev or custom domain

export function getR2PublicUrl(key: string): string {
  if (!R2_PUBLIC_URL) return '';
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Client-side: Upload a file to R2 via our API route (which generates presigned URL)
 */
export async function uploadImageToR2(
  file: File,
  folder: string = 'products'
): Promise<{ key: string; url: string }> {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Step 1: Get presigned upload URL from our API
  const presignRes = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType: file.type }),
  });

  if (!presignRes.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { uploadUrl } = await presignRes.json();

  // Step 2: Upload directly to R2
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload image');
  }

  return {
    key: filename,
    url: getR2PublicUrl(filename),
  };
}

/**
 * Server-side: Delete an object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(key)}`;

  const res = await fetch(r2ApiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete from R2: ${res.statusText}`);
  }
}

export { CF_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL };