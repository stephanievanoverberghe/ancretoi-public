import type { MetadataRoute } from 'next';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/espace/',
        '/administration/',
        '/paiement/',
        '/reinitialiser-mot-de-passe',
      ],
    },
    sitemap: new URL('/sitemap.xml', getSiteUrl()).toString(),
  };
}
