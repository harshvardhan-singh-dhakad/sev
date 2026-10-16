const FALLBACK_SITE_URL = 'https://sev.rasvat.workers.dev';
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
const parsedSiteUrl = new URL(configuredSiteUrl, FALLBACK_SITE_URL);

if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedSiteUrl.hostname)) {
  parsedSiteUrl.href = FALLBACK_SITE_URL;
}

export const SITE_URL = parsedSiteUrl;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
