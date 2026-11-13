import 'server-only';

import { z } from 'zod';
import { InspirationStatus } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { requireAdmin } from '@/server/auth/authz';

export type AdminInspirationEditData = {
    _id: string;
    title?: string | null;
    slug: string;
    status: 'draft' | 'published';
    videoUrl?: string | null;
    summary?: string | null;
    tags?: string[] | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
    publishedAt?: string | Date | null;
    curatorEmail?: string | null;
};

const iso = (date?: Date | string | null) => (date ? new Date(date as string | Date).toISOString() : null);

function slugify(input: string) {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

async function findAvailableSlug(baseSlug: string, exceptId?: string) {
    let candidate = baseSlug;
    let i = 2;
    while (
        await getPrismaClient().inspiration.findFirst({
            where: { slug: candidate, deletedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
            select: { id: true },
        })
    ) {
        candidate = `${baseSlug}-${i++}`;
    }
    return candidate;
}

function formString(formData: FormData, key: string) {
    return String(formData.get(key) ?? '').trim();
}

function fromPrismaStatus(status: InspirationStatus): 'draft' | 'published' {
    return status === InspirationStatus.PUBLISHED ? 'published' : 'draft';
}

function toPrismaStatus(status: 'draft' | 'published') {
    return status === 'published' ? InspirationStatus.PUBLISHED : InspirationStatus.DRAFT;
}

function toInspirationEditData(doc: {
    id: string;
    title: string;
    slug: string;
    status: InspirationStatus;
    videoUrl: string;
    summary: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    curatorEmail: string | null;
}): AdminInspirationEditData {
    return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        status: fromPrismaStatus(doc.status),
        videoUrl: doc.videoUrl,
        summary: doc.summary,
        tags: doc.tags,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        publishedAt: doc.publishedAt,
        curatorEmail: doc.curatorEmail,
    };
}

function toRow(doc: {
    id: string;
    title: string;
    slug: string;
    status: InspirationStatus;
    videoUrl: string;
    summary: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}) {
    return {
        id: doc.id,
        slug: doc.slug,
        status: fromPrismaStatus(doc.status),
        title: (doc.title ?? '').trim() || 'Sans titre',
        videoUrl: doc.videoUrl ?? null,
        summary: doc.summary ?? null,
        tags: Array.isArray(doc.tags) ? doc.tags.filter(Boolean) : [],
        timestamps: {
            createdAt: iso(doc.createdAt),
            updatedAt: iso(doc.updatedAt),
            deletedAt: iso(doc.deletedAt),
        },
    };
}

export async function getAdministrationInspirationsData() {
    const [actives, archivedCount] = await Promise.all([
        getPrismaClient().inspiration.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
        getPrismaClient().inspiration.count({ where: { deletedAt: { not: null } } }),
    ]);

    const rows = actives.map(toRow);

    const stats = {
        total: rows.length,
        published: rows.filter((row) => row.status === 'published').length,
        draft: rows.filter((row) => row.status === 'draft').length,
        archived: archivedCount,
    };

    return { rows, stats };
}

export async function getArchivedInspirationsData() {
    const docs = await getPrismaClient().inspiration.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
    });

    return docs.map(toRow);
}

export async function createAdminInspiration(formData: FormData) {
    const me = await requireAdmin();

    const raw = {
        title: formString(formData, 'title'),
        slugWanted: slugify(formString(formData, 'slug') || formString(formData, 'title')),
        videoUrl: formString(formData, 'videoUrl'),
        summary: formString(formData, 'summary') || undefined,
        tagsCsv: formString(formData, 'tags'),
        status: (formString(formData, 'status') || 'draft') as 'draft' | 'published',
    };

    const tags =
        raw.tagsCsv.length > 0
            ? raw.tagsCsv
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];

    const schema = z.object({
        title: z.string().min(1, 'Titre requis'),
        slugWanted: z.string().min(1, 'Slug requis'),
        videoUrl: z.string().trim().url({ message: 'URL invalide' }),
        summary: z.string().optional(),
        tags: z.array(z.string()).default([]),
        status: z.enum(['draft', 'published']).default('draft'),
    });

    const data = schema.parse({ ...raw, tags });
    const slug = await findAvailableSlug(data.slugWanted);
    const now = new Date();

    const created = await getPrismaClient().inspiration.create({
        data: {
            title: data.title,
            slug,
            videoUrl: data.videoUrl,
            summary: data.summary ?? '',
            tags: data.tags,
            status: toPrismaStatus(data.status),
            publishedAt: data.status === 'published' ? now : null,
            curatorEmail: me.email,
            deletedAt: null,
        },
    });

    return { slug: created.slug };
}

export async function getAdminInspirationEditData(slug: string) {
    await requireAdmin();

    const doc = await getPrismaClient().inspiration.findFirst({ where: { slug, deletedAt: null } });
    return doc ? toInspirationEditData(doc) : null;
}

export async function updateAdminInspiration(formData: FormData) {
    await requireAdmin();

    const id = formString(formData, 'id');
    const title = formString(formData, 'title');
    const nextSlug = formString(formData, 'slug') ? slugify(formString(formData, 'slug')) : slugify(title);
    const status = (formString(formData, 'status') || 'draft') as 'draft' | 'published';
    const videoUrl = formString(formData, 'videoUrl');
    const summary = formString(formData, 'summary');
    const tagsCsv = formString(formData, 'tags');

    if (!id) throw new Error('ID manquant.');
    if (!title) throw new Error('Titre requis.');
    if (!videoUrl) throw new Error('URL video requise.');

    const slugOwner = await getPrismaClient().inspiration.findFirst({ where: { slug: nextSlug, deletedAt: null }, select: { id: true } });
    if (slugOwner && slugOwner.id !== id) throw new Error('Ce slug est deja utilise par une autre inspiration.');

    const tags = tagsCsv
        ? tagsCsv
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const updated = await getPrismaClient().inspiration.update({
        where: { id },
        data: {
            title,
            slug: nextSlug,
            videoUrl,
            summary: summary || '',
            tags,
            status: toPrismaStatus(status),
            publishedAt: status === 'published' ? new Date() : null,
        },
    });

    const origSlug = formString(formData, 'origSlug');
    return { slug: updated.slug, renamed: !!origSlug && origSlug !== updated.slug };
}

export async function archiveAdminInspirationBySlug(input: { slug: string; dryRun: boolean }) {
    if (!input.slug) {
        return { ok: false as const, error: 'missing_slug' as const, status: 400 };
    }

    const doc = await getPrismaClient().inspiration.findFirst({
        where: { slug: input.slug, deletedAt: null },
        select: { id: true, slug: true, title: true, status: true, videoUrl: true, deletedAt: true },
    });

    if (!doc) {
        return { ok: true as const, dryRun: input.dryRun, deleted: { inspiration: 0 } };
    }

    if (input.dryRun) {
        return {
            ok: true as const,
            dryRun: true,
            deleted: { inspiration: 1 },
            doc: {
                _id: doc.id,
                slug: doc.slug,
                title: doc.title ?? '',
                status: fromPrismaStatus(doc.status),
                videoUrl: doc.videoUrl ?? null,
            },
        };
    }

    await getPrismaClient().inspiration.update({ where: { id: doc.id }, data: { deletedAt: new Date() } });

    return { ok: true as const, dryRun: false, deleted: { inspiration: 1 }, slug: doc.slug };
}

export async function restoreAdminInspirationBySlug(input: { slug: string; action: string }) {
    if (!input.slug || input.action !== 'restore') {
        return { ok: false as const, error: 'missing_or_invalid_params' as const, status: 400 };
    }

    const doc = await getPrismaClient().inspiration.findFirst({
        where: { slug: input.slug, deletedAt: { not: null } },
        select: { id: true, slug: true, title: true },
    });

    if (!doc) {
        return { ok: false as const, error: 'not_found_or_not_archived' as const, status: 404 };
    }

    const exists = await getPrismaClient().inspiration.findFirst({ where: { slug: input.slug, deletedAt: null }, select: { id: true } });
    const base = slugify(input.slug || doc.title || 'inspiration');
    const nextSlug = exists ? await findAvailableSlug(base) : input.slug;

    await getPrismaClient().inspiration.update({ where: { id: doc.id }, data: { deletedAt: null, slug: nextSlug } });

    return { ok: true as const, restored: true, slug: nextSlug };
}
