// src/server/blog/public-posts.service.ts
import 'server-only';
import { BlogPostStatus, type Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export type PublicBlogPost = {
    slug: string;
    title: string;
    summary?: string | null;
    content?: string | null;
    coverPath?: string | null;
    coverAlt?: string | null;
    category?: string | null;
    tags?: string[] | null;
    readingTimeMin?: number | null;
    publishedAt?: string | Date | null;
    updatedAt?: string | Date | null;
    createdAt?: string | Date | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
};

export type PublicBlogNavPost = { slug: string; title?: string } | null;

export type BlogTeaserPost = {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    hero: { src: string; alt: string };
    readingTime?: number;
};

type Query = {
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
    perPage?: string;
};

function stripMarkdown(md: string) {
    return (md || '')
        .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/^>\s+/gm, '')
        .replace(/[*_~`>#]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function excerptFrom(summary?: string | null, content?: string | null, max = 220) {
    const src = (summary && summary.trim()) || stripMarkdown(content || '');
    if (!src) return '';
    if (src.length <= max) return src;
    const cut = src.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function normalizePublicPath(path?: string | null) {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
}

function buildPublishedPostsFilter(params: URLSearchParams): Prisma.BlogPostWhereInput {
    const q = (params.get('q') || '').trim();
    const category = (params.get('category') || '').trim();
    const tag = (params.get('tag') || '').trim();

    const andParts: Prisma.BlogPostWhereInput[] = [{ status: BlogPostStatus.PUBLISHED }, { deletedAt: null }];

    if (q) {
        andParts.push({
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
            ],
        });
    }
    if (category) andParts.push({ category: { is: { slug: category } } });
    if (tag) andParts.push({ tags: { has: tag } });

    return { AND: andParts };
}

function mapPost(doc: {
    slug: string;
    title: string;
    summary: string;
    content?: string;
    coverPath: string;
    coverAlt: string;
    tags: string[];
    readingTimeMin: number;
    publishedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    category?: { slug: string } | null;
}): PublicBlogPost {
    return {
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        content: doc.content,
        coverPath: doc.coverPath,
        coverAlt: doc.coverAlt,
        category: doc.category?.slug ?? null,
        tags: doc.tags,
        readingTimeMin: doc.readingTimeMin,
        publishedAt: doc.publishedAt,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        canonicalUrl: doc.canonicalUrl,
    };
}

export async function listPublishedBlogPosts(searchParams: URLSearchParams) {
    const { page = '1', perPage = '12' } = Object.fromEntries(searchParams) as Query;

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const perPageNum = Math.min(48, Math.max(1, parseInt(perPage || '12', 10)));

    const filter = buildPublishedPostsFilter(searchParams);
    const prisma = getPrismaClient();

    const [items, total, categories, tags] = await Promise.all([
        prisma.blogPost
            .findMany({
                where: filter,
                orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
                skip: (pageNum - 1) * perPageNum,
                take: perPageNum,
                include: { category: { select: { slug: true } } },
            })
            .then((rows) => rows.map(mapPost)),
        prisma.blogPost.count({ where: filter }),
        prisma.category.findMany({
            where: { posts: { some: { status: BlogPostStatus.PUBLISHED, deletedAt: null } } },
            select: { slug: true },
            orderBy: { slug: 'asc' },
        }),
        prisma.blogPost.findMany({ where: { status: BlogPostStatus.PUBLISHED, deletedAt: null }, select: { tags: true } }),
    ]);

    return {
        items,
        total,
        page: pageNum,
        perPage: perPageNum,
        categories: categories.map((category) => category.slug).filter(Boolean),
        tags: Array.from(new Set(tags.flatMap((row) => row.tags))).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
    };
}

export async function listPublishedBlogPagePosts() {
    const rows = await getPrismaClient().blogPost.findMany({
        where: { status: BlogPostStatus.PUBLISHED, deletedAt: null },
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
        include: { category: { select: { slug: true } } },
    });

    return rows.map(mapPost);
}

export async function listBlogTeaserPosts(): Promise<BlogTeaserPost[]> {
    const docs = await getPrismaClient().blogPost.findMany({
        where: { status: BlogPostStatus.PUBLISHED, deletedAt: null },
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
        take: 3,
    });

    return docs.map((doc) => {
        const date = (doc.publishedAt ? new Date(doc.publishedAt) : doc.updatedAt ? new Date(doc.updatedAt) : doc.createdAt ? new Date(doc.createdAt) : new Date()).toISOString();
        const src = normalizePublicPath(doc.coverPath);
        const alt = (doc.coverAlt && doc.coverAlt.trim()) || 'Image de couverture';

        return {
            slug: doc.slug,
            title: (doc.title || '').trim() || 'Sans titre',
            date,
            excerpt: excerptFrom(doc.summary, doc.content),
            hero: { src, alt },
            readingTime: typeof doc.readingTimeMin === 'number' ? doc.readingTimeMin : undefined,
        };
    });
}

export async function listPublishedBlogSlugsForSitemap() {
    const docs = await getPrismaClient().blogPost.findMany({
        where: { status: BlogPostStatus.PUBLISHED, deletedAt: null },
        select: { slug: true },
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return docs.map((doc) => doc.slug);
}

export async function getPublishedBlogPostBySlug(slug: string) {
    const doc = await getPrismaClient().blogPost.findFirst({
        where: { slug, status: BlogPostStatus.PUBLISHED, deletedAt: null },
        include: { category: { select: { slug: true } } },
    });

    return doc ? mapPost(doc) : null;
}

export async function getPublishedBlogPostPrevNext(publishedAt: Date): Promise<{ prev: PublicBlogNavPost; next: PublicBlogNavPost }> {
    const prisma = getPrismaClient();

    const [prev, next] = await Promise.all([
        prisma.blogPost.findFirst({
            where: { status: BlogPostStatus.PUBLISHED, deletedAt: null, publishedAt: { lt: publishedAt } },
            orderBy: { publishedAt: 'desc' },
            select: { slug: true, title: true },
        }),
        prisma.blogPost.findFirst({
            where: { status: BlogPostStatus.PUBLISHED, deletedAt: null, publishedAt: { gt: publishedAt } },
            orderBy: { publishedAt: 'asc' },
            select: { slug: true, title: true },
        }),
    ]);

    return { prev, next };
}
