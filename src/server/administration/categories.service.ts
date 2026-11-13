import 'server-only';

import { getPrismaClient } from '@/server/db/prisma';
import { requireAdmin } from '@/server/auth/authz';

export type AdminCategoryEditData = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    color: string | null;
    icon: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
};

function slugify(input: string): string {
    return (input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function sanitizeLocalPath(p: string): string {
    const s = (p || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) throw new Error('Utilise un chemin local situe dans /public (ex: /images/blog/categories/cover.jpg).');
    return s.startsWith('/') ? s : `/${s}`;
}

function sanitizeCategoryLocalPath(path?: string | null): string | null {
    const value = (path ?? '').trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) {
        throw new Error("L'image doit Ãªtre un chemin local sous /public (ex: /images/blog/categories/cover.jpg).");
    }
    const normalized = value.startsWith('/') ? value : `/${value}`;
    if (normalized.includes('..')) throw new Error('Chemin image invalide.');
    return normalized;
}

function normalizeHexColor(color?: string | null): string | null {
    const value = (color ?? '').trim();
    if (!value) return null;
    const m3 = /^#([0-9a-f]{3})$/i.exec(value);
    const m6 = /^#([0-9a-f]{6})$/i.exec(value);
    if (m6) return `#${m6[1].toLowerCase()}`;
    if (m3) {
        const [a, b, d] = m3[1].toLowerCase().split('');
        return `#${a}${a}${b}${b}${d}${d}`;
    }
    throw new Error('Couleur invalide. Utilise #RRGGBB ou #RGB.');
}

function formString(formData: FormData, key: string) {
    return String(formData.get(key) ?? '').trim();
}

function toCategoryEditData(doc: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string | null;
    icon: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}): AdminCategoryEditData {
    return {
        _id: doc.id,
        name: doc.name,
        slug: doc.slug,
        description: doc.description ?? '',
        color: doc.color ?? null,
        icon: doc.icon ?? null,
        imagePath: doc.imagePath ?? null,
        imageAlt: doc.imageAlt ?? null,
        createdAt: doc.createdAt ?? null,
        updatedAt: doc.updatedAt ?? null,
    };
}

export async function ensureAdminCategoriesReady() {
    await getPrismaClient().$queryRaw`SELECT 1`;
}

export async function getAdministrationCategoriesData() {
    const cats = await getPrismaClient().category.findMany({
        include: {
            _count: {
                select: { posts: true },
            },
        },
        orderBy: { name: 'asc' },
    });

    const rows = cats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? '',
        color: cat.color ?? null,
        icon: cat.icon ?? null,
        imagePath: cat.imagePath ?? null,
        imageAlt: cat.imageAlt ?? null,
        usage: { posts: cat._count.posts },
        timestamps: {
            createdAt: cat.createdAt ? cat.createdAt.toISOString() : null,
            updatedAt: cat.updatedAt ? cat.updatedAt.toISOString() : null,
        },
    }));

    const stats = {
        total: rows.length,
        used: rows.filter((row) => row.usage.posts > 0).length,
        unused: rows.filter((row) => row.usage.posts === 0).length,
    };

    return { rows, stats };
}

export async function getAdminCategoryEditData(slug: string) {
    await requireAdmin();

    const doc = await getPrismaClient().category.findUnique({ where: { slug } });
    return doc ? toCategoryEditData(doc) : null;
}

export async function updateAdminCategory(formData: FormData) {
    await requireAdmin();

    const id = formString(formData, 'id');
    if (!id) throw new Error('ID manquant.');

    const name = formString(formData, 'name');
    if (!name) throw new Error('Nom requis.');

    const nextSlug = formString(formData, 'slug') ? slugify(formString(formData, 'slug')) : slugify(name);

    const owner = await getPrismaClient().category.findUnique({ where: { slug: nextSlug }, select: { id: true } });
    if (owner && owner.id !== id) {
        throw new Error('Ce slug est deja utilise par une autre categorie.');
    }

    const updated = await getPrismaClient().category.update({
        where: { id },
        data: {
            name,
            slug: nextSlug,
            description: formString(formData, 'description'),
            color: formString(formData, 'color') || null,
            icon: formString(formData, 'icon') || null,
            imagePath: formString(formData, 'imagePath') ? sanitizeLocalPath(formString(formData, 'imagePath')) : null,
            imageAlt: formString(formData, 'imageAlt') || null,
        },
    });

    const origSlug = formString(formData, 'origSlug');
    return { slug: updated.slug, renamed: !!origSlug && origSlug !== updated.slug };
}

export async function deleteAdminCategory(formData: FormData) {
    await requireAdmin();

    const id = formString(formData, 'id');
    if (!id) throw new Error('ID manquant.');

    await getPrismaClient().category.delete({ where: { id } });
}

export type CreateAdminCategoryBody = {
    name: string;
    slug?: string;
    description?: string;
    color?: string | null;
    icon?: string | null;
    imagePath?: string | null;
    imageAlt?: string | null;
};

export async function createAdminCategoryFromBody(body: CreateAdminCategoryBody) {
    const name = (body.name || '').trim();
    if (!name) return { ok: false as const, error: 'missing_name' as const, status: 400 };

    const providedSlug = (body.slug || '').trim();
    const slug = providedSlug ? slugify(providedSlug) : slugify(name);
    const description = (body.description || '').trim();
    const icon = (body.icon || '').trim() || null;

    let color: string | null = null;
    try {
        color = body.color == null ? null : normalizeHexColor(body.color);
    } catch (error) {
        return { ok: false as const, error: error instanceof Error ? error.message : 'invalid_color', status: 400 };
    }

    let imagePath: string | null = null;
    try {
        imagePath = sanitizeCategoryLocalPath(body.imagePath);
    } catch (error) {
        return { ok: false as const, error: error instanceof Error ? error.message : 'invalid_image_path', status: 400 };
    }

    const imageAlt = (body.imageAlt || '').trim() || null;
    const exists = await getPrismaClient().category.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
        return { ok: false as const, error: 'slug_already_exists' as const, status: 409 };
    }

    const category = await getPrismaClient().category.create({
        data: { name, slug, description, color, icon, imagePath, imageAlt },
        select: { id: true },
    });

    return { ok: true as const, id: category.id, slug };
}

export async function previewOrDeleteAdminCategory(input: { slug: string; dryRun: boolean; dryRunOnly?: boolean; force: boolean }) {
    if (!input.slug) {
        return { kind: 'response' as const, body: { ok: false, error: 'ParamÃ¨tre "slug" requis.' }, status: 400 };
    }

    const category = await getPrismaClient().category.findUnique({
        where: { slug: input.slug },
        select: { id: true, slug: true, name: true, description: true, color: true, icon: true, imagePath: true, imageAlt: true },
    });

    if (!category) {
        return { kind: 'response' as const, body: { ok: false, error: 'CatÃ©gorie introuvable.' }, status: 404 };
    }

    const postsUsing = await getPrismaClient().blogPost.count({ where: { deletedAt: null, categoryId: category.id } });

    if (input.dryRun || input.dryRunOnly) {
        return {
            kind: 'response' as const,
            body: {
                ok: true,
                doc: {
                    _id: category.id,
                    slug: category.slug,
                    name: category.name,
                    description: category.description ?? '',
                    color: category.color ?? null,
                    icon: category.icon ?? null,
                    imagePath: category.imagePath ?? null,
                    imageAlt: category.imageAlt ?? null,
                    postsUsing,
                },
            },
        };
    }

    if (postsUsing > 0 && !input.force) {
        return {
            kind: 'response' as const,
            body: {
                ok: false,
                error: 'Cette catÃ©gorie est encore utilisÃ©e par des articles. Ajoute `?force=true` pour la supprimer et dÃ©tacher les articles (categoryId â†’ null).',
                postsUsing,
            },
            status: 409,
        };
    }

    if (postsUsing > 0 && input.force) {
        await getPrismaClient().blogPost.updateMany({ where: { deletedAt: null, categoryId: category.id }, data: { categoryId: null } });
    }

    await getPrismaClient().category.delete({ where: { id: category.id } });

    return { kind: 'deleted' as const, body: { ok: true, detachedPosts: input.force ? postsUsing : 0 } };
}
