import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/cloud', '/profile'],
      },
    ],
    sitemap: 'https://smart-read-rouge.vercel.app/sitemap.xml',
    host: 'https://smart-read-rouge.vercel.app',
  };
}
