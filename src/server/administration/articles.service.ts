import 'server-only';

import { BlogPostStatus, type Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { requireAdmin } from '@/server/auth/authz';

export type AdminArticleCategoryOption = { name: string; slug: string };

export type AdminArticleEditData = {
    _id: string;
    title?: string | null;
    slug: string;
    status: 'draft' | 'published';
    summary?: string | null;
    content?: string | null;
    coverPath?: string | null;
    coverAlt?: string | null;
    category?: string | null;
    tags?: string[] | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    isFeatured?: boolean | null;
    readingTimeMin?: number | null;
    publishedAt?: string | Date | null;
    authorEmail?: string | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
};

const iso = (date?: Date | string | null) => (date ? new Date(date).toISOString() : null);

function slugify(s: string) {
    return (s || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 80);
}

function computeReadingTimeMin(text: string) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function parseTags(raw: string) {
    return Array.from(
        new Set(
            (raw || '')
                .split(/[,\n]/)
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean)
        )
    );
}

function sanitizeCoverPath(p: string) {
    const s = (p || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) throw new Error('La couverture doit etre un chemin local (ex: /images/blog/mon-article/cover.jpg).');
    if (!s.startsWith('/')) return `/${s}`;
    return s;
}

function formString(formData: FormData, key: string) {
    return String(formData.get(key) ?? '').trim();
}

function fromPrismaStatus(status: BlogPostStatus): 'draft' | 'published' {
    return status === BlogPostStatus.PUBLISHED ? 'published' : 'draft';
}

function toPrismaStatus(status: 'draft' | 'published') {
    return status === 'published' ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT;
}

type ArticleWithCategory = Prisma.BlogPostGetPayload<{ include: { category: { select: { slug: true } } } }>;

function toArticleEditData(doc: ArticleWithCategory): AdminArticleEditData {
    if (!doc) throw new Error('Article introuvable.');
    return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        status: fromPrismaStatus(doc.status),
        summary: doc.summary,
        content: doc.content,
        coverPath: doc.coverPath,
        coverAlt: doc.coverAlt,
        category: doc.category?.slug ?? null,
        tags: doc.tags,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        canonicalUrl: doc.canonicalUrl,
        isFeatured: doc.isFeatured,
        readingTimeMin: doc.readingTimeMin,
        publishedAt: doc.publishedAt,
        authorEmail: doc.authorEmail,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

async function categorySlugToId(slug: string) {
    if (!slug) return null;
    const category = await getPrismaClient().category.findUnique({ where: { slug }, select: { id: true } });
    return category?.id ?? null;
}

export async function getAdministrationArticlesData() {
    const prisma = getPrismaClient();
    const [actives, archivedCount, cats] = await Promise.all([
        prisma.blogPost.findMany({
            where: { deletedAt: null },
            include: { category: { select: { slug: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.blogPost.count({ where: { deletedAt: { not: null } } }),
        prisma.category.findMany({ select: { name: true, slug: true, color: true, icon: true }, orderBy: { name: 'asc' } }),
    ]);

    const rows = actives.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        status: fromPrismaStatus(doc.status),
        title: (doc.title ?? '').trim() || 'Sans titre',
        coverPath: doc.coverPath ?? null,
        coverAlt: doc.coverAlt ?? null,
        summary: doc.summary ?? null,
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        category: doc.category?.slug ?? null,
        timestamps: {
            createdAt: iso(doc.createdAt),
            updatedAt: iso(doc.updatedAt),
            publishedAt: iso(doc.publishedAt),
        },
        seo: { title: doc.seoTitle ?? '', description: doc.seoDescription ?? '' },
        featured: !!doc.isFeatured,
    }));

    const categories = cats.map((cat) => ({
        slug: cat.slug,
        name: cat.name,
        color: cat.color || null,
        icon: cat.icon || null,
    }));

    const stats = {
        total: rows.length,
        published: rows.filter((row) => row.status === 'published').length,
        draft: rows.filter((row) => row.status === 'draft').length,
        archived: archivedCount,
    };

    return { rows, categories, stats, archivedCount };
}

export async function getArchivedArticlesData() {
    const docs = await getPrismaClient().blogPost.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
    });

    return docs.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        status: fromPrismaStatus(doc.status),
        title: (doc.title ?? '').trim() || 'Sans titre',
        coverPath: doc.coverPath ?? null,
        summary: doc.summary ?? null,
        timestamps: {
            createdAt: iso(doc.createdAt),
            updatedAt: iso(doc.updatedAt),
            deletedAt: iso(doc.deletedAt),
        },
    }));
}

export async function getNewArticleCategories() {
    await requireAdmin();
    return getPrismaClient().category.findMany({ select: { name: true, slug: true }, orderBy: { name: 'asc' } });
}

export async function createAdminArticle(formData: FormData) {
    const me = await requireAdmin();
    const title = formString(formData, 'title');
    const slugWanted = slugify(formString(formData, 'slug') || title);
    const categorySlug = formString(formData, 'category');
    const tags = parseTags(formString(formData, 'tags'));
    const coverPath = sanitizeCoverPath(formString(formData, 'coverPath'));
    const coverAlt = formString(formData, 'coverAlt');
    const summary = formString(formData, 'summary');
    const content = formString(formData, 'content');
    const isFeatured = formString(formData, 'isFeatured') === 'on';
    const seoTitle = formString(formData, 'seoTitle') || title;
    const seoDescription = formString(formData, 'seoDescription') || summary;
    const canonicalUrl = formString(formData, 'canonicalUrl');
    const status = (formString(formData, 'status') || 'draft') as 'draft' | 'published';
    const publishedAtRaw = formString(formData, 'publishedAt');
    const publishedAt = status === 'published' ? (publishedAtRaw ? new Date(publishedAtRaw) : new Date()) : null;

    if (!title || !slugWanted) throw new Error('Titre et slug requis.');

    let slug = slugWanted;
    let i = 2;
    while (await getPrismaClient().blogPost.findFirst({ where: { slug, deletedAt: null }, select: { id: true } })) {
        slug = `${slugWanted}-${i++}`;
    }

    const created = await getPrismaClient().blogPost.create({
        data: {
            title,
            slug,
            status: toPrismaStatus(status),
            publishedAt,
            summary,
            content,
            coverPath,
            coverAlt,
            categoryId: await categorySlugToId(categorySlug),
            tags,
            seoTitle,
            seoDescription,
            canonicalUrl,
            isFeatured,
            readingTimeMin: computeReadingTimeMin(content),
            authorEmail: me.email,
            deletedAt: null,
        },
    });

    return { slug: created.slug };
}

export async function getAdminArticleEditData(slug: string) {
    await requireAdmin();
    const [doc, categories] = await Promise.all([
        getPrismaClient().blogPost.findFirst({ where: { slug, deletedAt: null }, include: { category: { select: { slug: true } } } }),
        getPrismaClient().category.findMany({ select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
    ]);

    if (!doc) return null;

    return {
        doc: toArticleEditData(doc),
        categories,
    };
}

export async function updateAdminArticle(formData: FormData) {
    await requireAdmin();

    const id = formString(formData, 'id');
    if (!id) throw new Error('ID manquant.');

    const title = formString(formData, 'title');
    if (!title) throw new Error('Titre requis.');

    const nextSlug = formString(formData, 'slug') ? slugify(formString(formData, 'slug')) : slugify(title);
    const status = (formString(formData, 'status') || 'draft') as 'draft' | 'published';
    const publishedAtInput = formString(formData, 'publishedAt');
    const publishedAt = status === 'published' ? (publishedAtInput ? new Date(publishedAtInput) : new Date()) : null;
    const categorySlug = formString(formData, 'category');

    const slugOwner = await getPrismaClient().blogPost.findFirst({ where: { slug: nextSlug }, select: { id: true } });
    if (slugOwner && slugOwner.id !== id) {
        throw new Error('Ce slug est deja utilise par un autre article.');
    }

    const updated = await getPrismaClient().blogPost.update({
        where: { id },
        data: {
            title,
            slug: nextSlug,
            status: toPrismaStatus(status),
            publishedAt,
            summary: formString(formData, 'summary'),
            content: formString(formData, 'content'),
            coverPath: sanitizeCoverPath(formString(formData, 'coverPath')),
            coverAlt: formString(formData, 'coverAlt'),
            categoryId: await categorySlugToId(categorySlug),
            tags: parseTags(formString(formData, 'tags')),
            seoTitle: formString(formData, 'seoTitle') || title,
            seoDescription: formString(formData, 'seoDescription') || formString(formData, 'summary'),
            canonicalUrl: formString(formData, 'canonicalUrl'),
            isFeatured: formString(formData, 'isFeatured') === 'on',
            readingTimeMin: computeReadingTimeMin(formString(formData, 'content')),
        },
    });

    const origSlug = formString(formData, 'origSlug');
    return { slug: updated.slug, renamed: !!origSlug && origSlug !== updated.slug };
}
