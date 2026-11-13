import type { MetadataRoute } from 'next';

import { legalRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import { aideArticles } from '@/content/aide-articles';
import { listPublishedBlogSlugsForSitemap } from '@/server/blog/public-posts.service';
import { listPublishedInspirationSlugsForSitemap } from '@/server/inspirations/public-inspirations.service';
import { getProgramSlugs } from '@/server/programmes';

export const dynamic = 'force-dynamic';

const DEFAULT_SITE_URL = 'http://localhost:3000';
const PROGRAM_SLUG_FALLBACK = ['reset-7', 'boussole-10'] as const;
const SITEMAP_DB_TIMEOUT_MS = 2000;

type SitemapEntry = MetadataRoute.Sitemap[number];

function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

function createEntry(
  path: string,
  priority: number,
  changeFrequency: SitemapEntry['changeFrequency'] = 'weekly',
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

function uniqueSlugs(slugs: string[]) {
  return [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
}

async function withTimeout<T>(task: Promise<T>, fallback: T): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      task,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), SITEMAP_DB_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function getPublishedProgramSlugs() {
  try {
    const slugs = await getProgramSlugs();
    return uniqueSlugs(slugs);
  } catch {
    return [...PROGRAM_SLUG_FALLBACK];
  }
}

async function getPublishedBlogSlugs() {
  try {
    const slugs = await listPublishedBlogSlugsForSitemap();
    return uniqueSlugs(slugs);
  } catch {
    return [];
  }
}

async function getPublishedInspirationSlugs() {
  try {
    const slugs = await listPublishedInspirationSlugsForSitemap();
    return uniqueSlugs(slugs);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programSlugs, blogSlugs, inspirationSlugs] = await Promise.all([
    withTimeout(getPublishedProgramSlugs(), [...PROGRAM_SLUG_FALLBACK]),
    withTimeout(getPublishedBlogSlugs(), []),
    withTimeout(getPublishedInspirationSlugs(), []),
  ]);

  const staticPublicRoutes: MetadataRoute.Sitemap = [
    createEntry(publicRoutes.home, 1, 'weekly'),
    createEntry(publicRoutes.programmes, 0.9, 'weekly'),
    createEntry(publicRoutes.methode, 0.8, 'monthly'),
    createEntry(publicRoutes.temoignages, 0.6, 'monthly'),
    createEntry(publicRoutes.blog, 0.7, 'weekly'),
    createEntry(publicRoutes.inspirations, 0.7, 'weekly'),
    createEntry(publicRoutes.aide, 0.6, 'monthly'),
    createEntry(publicRoutes.quizBoussole, 0.6, 'monthly'),
    createEntry(publicRoutes.contact, 0.5, 'yearly'),
    createEntry(legalRoutes.mentionsLegales, 0.3, 'yearly'),
    createEntry(legalRoutes.conditionsGenerales, 0.3, 'yearly'),
    createEntry(legalRoutes.confidentialite, 0.3, 'yearly'),
    createEntry(legalRoutes.cookies, 0.3, 'yearly'),
  ];

  const programRoutes = programSlugs.map((slug) =>
    createEntry(routeBuilders.programme(slug), 0.85, 'weekly'),
  );
  const blogRoutes = blogSlugs.map((slug) => createEntry(routeBuilders.article(slug), 0.65, 'weekly'));
  const inspirationRoutes = inspirationSlugs.map((slug) =>
    createEntry(routeBuilders.inspiration(slug), 0.65, 'weekly'),
  );
  const aideRoutes = aideArticles.map((article) =>
    createEntry(routeBuilders.aideArticle(article.slug), 0.5, 'monthly'),
  );

  return [
    ...staticPublicRoutes,
    ...programRoutes,
    ...blogRoutes,
    ...inspirationRoutes,
    ...aideRoutes,
  ];
}
