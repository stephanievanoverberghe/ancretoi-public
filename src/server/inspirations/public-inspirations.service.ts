import 'server-only';

import { InspirationStatus } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export type PublicInspiration = {
    title: string;
    slug: string;
    videoUrl: string;
    summary?: string | null;
    tags?: string[] | null;
    createdAt?: Date | string;
};

export async function listPublishedInspirations() {
    return await getPrismaClient().inspiration.findMany({
        where: { status: InspirationStatus.PUBLISHED, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { title: true, slug: true, videoUrl: true, summary: true, tags: true, createdAt: true },
    });
}

export async function listPublishedInspirationSlugsForSitemap() {
    const docs = await getPrismaClient().inspiration.findMany({
        where: { status: InspirationStatus.PUBLISHED, deletedAt: null },
        select: { slug: true },
        orderBy: { createdAt: 'desc' },
    });

    return docs.map((doc) => doc.slug);
}

export async function getPublishedInspirationDetail(slug: string) {
    const doc = await getPrismaClient().inspiration.findFirst({
        where: { slug, status: InspirationStatus.PUBLISHED, deletedAt: null },
        select: { title: true, slug: true, videoUrl: true, summary: true, tags: true, createdAt: true },
    });

    if (!doc) return { doc: null, related: [] as PublicInspiration[] };

    const related = await getPrismaClient().inspiration.findMany({
        where: {
            status: InspirationStatus.PUBLISHED,
            deletedAt: null,
            slug: { not: slug },
            ...(doc.tags?.length ? { tags: { hasSome: doc.tags.slice(0, 3) } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { title: true, slug: true, videoUrl: true, summary: true, tags: true, createdAt: true },
    });

    return { doc, related };
}
