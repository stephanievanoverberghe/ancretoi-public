// src/server/blog/posts.service.ts
import 'server-only';

import { BlogPostStatus, type BlogPost } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export type CreatePostInput = {
    title: string;
    slugWanted?: string;
    status: 'draft' | 'published';
    summary?: string;
    content?: string;
    coverPath?: string;
    coverAlt?: string;
    categorySlug?: string;
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    isFeatured?: boolean;
    publishedAt?: Date | null;
    authorEmail: string;
};

export type UpdatePostInput = Partial<CreatePostInput> & {
    slug: string;
};

export function slugify(s: string) {
    return (s || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

export function parseTags(raw?: string | string[]) {
    const base = Array.isArray(raw) ? raw.join(',') : raw || '';
    return Array.from(
        new Set(
            base
                .split(/[,\n]/)
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean)
        )
    );
}

export function sanitizeCoverPath(p?: string) {
    const s = (p || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) {
        throw new Error('La couverture doit etre un chemin local (ex: /images/blog/mon-article/cover.jpg).');
    }
    return s.startsWith('/') ? s : `/${s}`;
}

export function readingTimeMin(text?: string) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function toPrismaStatus(status?: 'draft' | 'published') {
    return status === 'published' ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT;
}

async function findAvailableSlug(base: string, exceptId?: string) {
    let candidate = base;
    let i = 2;
    while (
        await getPrismaClient().blogPost.findFirst({
            where: {
                slug: candidate,
                deletedAt: null,
                ...(exceptId ? { id: { not: exceptId } } : {}),
            },
            select: { id: true },
        })
    ) {
        candidate = `${base}-${i++}`;
    }
    return candidate;
}

async function categorySlugToId(categorySlug?: string) {
    if (!categorySlug) return null;
    const cat = await getPrismaClient().category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
    });
    return cat?.id ?? null;
}

export async function createPost(input: CreatePostInput) {
    if (!input.title) throw new Error('Titre requis.');

    const baseSlug = slugify(input.slugWanted || input.title);
    const slug = await findAvailableSlug(baseSlug);
    const categoryId = await categorySlugToId(input.categorySlug || undefined);
    const status = toPrismaStatus(input.status);

    return await getPrismaClient().blogPost.create({
        data: {
            title: input.title,
            slug,
            status,
            summary: input.summary || '',
            content: input.content || '',
            coverPath: sanitizeCoverPath(input.coverPath),
            coverAlt: input.coverAlt || '',
            categoryId,
            tags: parseTags(input.tags),
            seoTitle: input.seoTitle || input.title,
            seoDescription: input.seoDescription || input.summary || '',
            canonicalUrl: input.canonicalUrl || '',
            isFeatured: !!input.isFeatured,
            readingTimeMin: readingTimeMin(input.content),
            publishedAt: status === BlogPostStatus.PUBLISHED ? input.publishedAt || new Date() : null,
            authorEmail: input.authorEmail,
            deletedAt: null,
        },
    });
}

export async function updatePost(input: UpdatePostInput) {
    const cur = await getPrismaClient().blogPost.findFirst({ where: { slug: input.slug, deletedAt: null } });
    if (!cur) throw new Error('Article introuvable.');

    let nextSlug = cur.slug;
    if (input.slugWanted || input.title) {
        const base = slugify(input.slugWanted || input.title || cur.title);
        if (base !== cur.slug) nextSlug = await findAvailableSlug(base, cur.id);
    }

    const categoryId = typeof input.categorySlug !== 'undefined' ? await categorySlugToId(input.categorySlug || undefined) : cur.categoryId;
    const nextStatus = input.status ? toPrismaStatus(input.status) : cur.status;

    return await getPrismaClient().blogPost.update({
        where: { id: cur.id },
        data: {
            title: input.title ?? cur.title,
            slug: nextSlug,
            status: nextStatus,
            summary: input.summary ?? cur.summary,
            content: input.content ?? cur.content,
            coverPath: typeof input.coverPath !== 'undefined' ? sanitizeCoverPath(input.coverPath) : cur.coverPath,
            coverAlt: input.coverAlt ?? cur.coverAlt,
            categoryId,
            ...(typeof input.tags !== 'undefined' ? { tags: parseTags(input.tags) } : {}),
            seoTitle: input.seoTitle ?? (cur.seoTitle || cur.title),
            seoDescription: input.seoDescription ?? (cur.seoDescription || cur.summary || ''),
            canonicalUrl: input.canonicalUrl ?? cur.canonicalUrl,
            ...(typeof input.isFeatured !== 'undefined' ? { isFeatured: !!input.isFeatured } : {}),
            ...(typeof input.content !== 'undefined' ? { readingTimeMin: readingTimeMin(input.content) } : {}),
            publishedAt: nextStatus === BlogPostStatus.PUBLISHED ? cur.publishedAt ?? input.publishedAt ?? new Date() : null,
        },
    });
}

export async function softDeletePost(slug: string) {
    const doc = await getPrismaClient().blogPost.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
    if (!doc) return { deleted: 0 };
    await getPrismaClient().blogPost.update({ where: { id: doc.id }, data: { deletedAt: new Date() } });
    return { deleted: 1 };
}

export async function restorePost(idOrSlug: string) {
    const raw = (idOrSlug || '').trim();
    if (!raw) throw new Error('Parametre vide.');

    const cur = await getPrismaClient().blogPost.findFirst({
        where: { OR: [{ id: raw }, { slug: slugify(raw) }, { slug: raw }], deletedAt: { not: null } },
    });
    if (!cur) throw new Error('Introuvable (ou pas archive).');

    const desired = cur.slug || slugify(cur.title || 'article');
    const nextSlug = await findAvailableSlug(desired, cur.id);
    await getPrismaClient().blogPost.update({ where: { id: cur.id }, data: { deletedAt: null, slug: nextSlug } });
    return { restored: true, slug: nextSlug };
}

export async function getPost(slug: string) {
    return await getPrismaClient().blogPost.findFirst({ where: { slug, deletedAt: null } });
}

export async function listPosts() {
    return await getPrismaClient().blogPost.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
    });
}

export async function suggestSlug(base: string) {
    return await findAvailableSlug(slugify(base));
}

export async function getArchivedPost(idOrSlug: string): Promise<BlogPost | null> {
    const raw = (idOrSlug || '').trim();
    if (!raw) return null;

    return await getPrismaClient().blogPost.findFirst({
        where: { OR: [{ id: raw }, { slug: raw }], deletedAt: { not: null } },
    });
}

export async function hardDeletePost(idOrSlug: string) {
    const raw = (idOrSlug || '').trim();
    if (!raw) return { deleted: 0 };

    const doc = await getPrismaClient().blogPost.findFirst({
        where: { OR: [{ id: raw }, { slug: raw }], deletedAt: { not: null } },
        select: { id: true },
    });
    if (!doc) return { deleted: 0 };

    await getPrismaClient().blogPost.delete({ where: { id: doc.id } });
    return { deleted: 1 };
}
