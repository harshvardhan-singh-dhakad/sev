import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const origin = SITE_URL.origin;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'cohere-ai',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/shop',
          '/about',
          '/bulk-orders',
          '/samples',
          '/contact',
          '/blog',
          '/shipping-policy',
          '/refund-policy',
          '/privacy-policy',
          '/terms',
        ],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
