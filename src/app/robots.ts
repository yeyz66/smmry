import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/*', '/auth/*'],
    },
    sitemap: 'https://aismmry.com/sitemap.xml',
  };
} 