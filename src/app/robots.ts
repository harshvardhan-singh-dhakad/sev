import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

// Comprehensive registry of modern AI crawlers, LLM search agents, and training bots
const AI_USER_AGENTS = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  // Google AI & Search
  'Google-Extended',
  'GoogleOther',
  'GoogleOther-Image',
  'GoogleOther-Video',
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-News',
  // Perplexity AI
  'PerplexityBot',
  // Apple AI & Siri
  'Applebot',
  'Applebot-Extended',
  // Meta AI
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  // Microsoft & Bing AI
  'bingbot',
  'BingPreview',
  'msnbot',
  // Amazon AI
  'Amazonbot',
  // ByteDance / Doubao / TikTok AI
  'Bytespider',
  // Cohere AI
  'cohere-ai',
  'cohere-training-data-crawler',
  // Mistral AI
  'MistralBot',
  // Common Crawl (Llama and open foundation models training dataset)
  'CCBot',
  // Web & Knowledge AI Crawlers
  'Diffbot',
  'DuckAssistBot',
  'YouBot',
  'Timpibot',
  'ia_archiver',
];

export default function robots(): MetadataRoute.Robots {
  const origin = SITE_URL.origin;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/checkout/',
          '/api/orders/',
          '/api/webhooks/',
          '/api/admin/',
          '/api/cron/',
        ],
      },
      {
        userAgent: AI_USER_AGENTS,
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml',
          '/shop',
          '/about',
          '/bulk-orders',
          '/samples',
          '/contact',
          '/blog',
          '/track-order',
          '/shipping-policy',
          '/refund-policy',
          '/privacy-policy',
          '/terms',
          '/api/products',
          '/api/categories',
          '/api/blogs',
        ],
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/checkout/',
          '/api/orders/',
          '/api/webhooks/',
          '/api/admin/',
          '/api/cron/',
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

