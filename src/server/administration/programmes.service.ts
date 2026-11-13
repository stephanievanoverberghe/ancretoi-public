import 'server-only';

import { ProgramLevel as PrismaProgramLevel, ProgramStatus as PrismaProgramStatus, UnitType } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

type JsonRecord = Record<string, unknown>;

type AdminProgramStatus = 'draft' | 'preflight' | 'published';
type AdminProgramLevel = 'Basique' | 'Cible' | 'Premium';

function slugify(value: string) {
    return (value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asRecordArray(value: unknown): JsonRecord[] {
    return Array.isArray(value) ? value.filter((item): item is JsonRecord => Boolean(item && typeof item === 'object' && !Array.isArray(item))) : [];
}

function asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : [];
}

function mapStatus(status: PrismaProgramStatus): AdminProgramStatus {
    switch (status) {
        case PrismaProgramStatus.PREFLIGHT:
            return 'preflight';
        case PrismaProgramStatus.PUBLISHED:
            return 'published';
        case PrismaProgramStatus.ARCHIVED:
        case PrismaProgramStatus.DRAFT:
        default:
            return 'draft';
    }
}

function mapLevel(level: PrismaProgramLevel | null): AdminProgramLevel {
    switch (level) {
        case PrismaProgramLevel.CIBLE:
            return 'Cible';
        case PrismaProgramLevel.PREMIUM:
            return 'Premium';
        case PrismaProgramLevel.BASIQUE:
        default:
            return 'Basique';
    }
}

export async function ensureAdminProgramFormReady() {
    await getPrismaClient().$queryRaw`SELECT 1`;
}

export async function getAdministrationProgrammesData() {
    const programs = await getPrismaClient().program.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { units: true } } },
        orderBy: { createdAt: 'desc' },
    });

    const rows = programs.map((program) => {
        const hero = asRecord(program.hero);
        const card = asRecord(program.card);
        const meta = asRecord(program.meta);
        const price = asRecord(program.price);
        const cardImage = asRecord(card.image);

        return {
            programSlug: program.slug,
            status: mapStatus(program.status),
            title: asString(hero.title) || program.title || 'Sans titre',
            coverUrl: asString(cardImage.url) || program.coverUrl || null,
            coverAlt: asString(cardImage.alt) || null,
            price: {
                amountCents: asNumber(price.amountCents),
                currency: (asString(price.currency) || 'EUR').toUpperCase(),
            },
            meta: {
                durationDays: asNumber(meta.durationDays) ?? program.durationDays,
                estMinutesPerDay: asNumber(meta.estMinutesPerDay) ?? program.estMinutesPerDay,
                level: mapLevel(program.level),
                tags: asStringArray(meta.tags).length ? asStringArray(meta.tags) : program.tags,
            },
            stats: { unitsCount: program._count.units },
            timestamps: {
                createdAt: program.createdAt.toISOString(),
                updatedAt: program.updatedAt.toISOString(),
            },
        };
    });

    const stats = {
        total: rows.length,
        published: rows.filter((row) => row.status === 'published').length,
        preflight: rows.filter((row) => row.status === 'preflight').length,
        draft: rows.filter((row) => row.status === 'draft').length,
    };

    return { rows, stats };
}

export async function getAdminProgramEditData(rawSlug: string) {
    const programSlug = slugify(rawSlug);
    const program = await getPrismaClient().program.findUnique({
        where: { slug: programSlug },
        include: {
            units: {
                where: { unitType: UnitType.DAY },
                orderBy: { unitIndex: 'asc' },
            },
        },
    });

    if (!program || program.deletedAt) return null;

    const hero = asRecord(program.hero);
    const heroImage = asRecord(hero.heroImage);
    const card = asRecord(program.card);
    const meta = asRecord(program.meta);
    const price = asRecord(program.price);
    const seo = asRecord(program.seo);
    const highlights = asRecordArray(program.highlights);
    const idealIfFromHighlights = highlights.find((highlight) => asString(highlight.title).toLowerCase().startsWith('idéal si'));
    const benefits = highlights
        .filter((highlight) => !asString(highlight.title).toLowerCase().startsWith('idéal si'))
        .slice(0, 3)
        .map((benefit) => ({ icon: asString(benefit.icon), title: asString(benefit.title), text: asString(benefit.text) }));

    return {
        programSlug,
        initial: {
            slug: programSlug,
            title: asString(hero.title) || program.title || '',
            status: mapStatus(program.status),
            level: mapLevel(program.level),
            durationDays: asNumber(meta.durationDays) ?? program.durationDays,
            estMinutesPerDay: asNumber(meta.estMinutesPerDay) ?? program.estMinutesPerDay,
            priceCents: asNumber(price.amountCents),
            marketing: {
                hero: {
                    title: asString(hero.title) || program.title || '',
                    subtitle: asString(hero.subtitle),
                    ctaHref: asString(hero.ctaHref),
                    heroImage: asString(heroImage.url),
                },
                objective: asString(card.summary),
                durationLabel: asString(card.tagline),
                idealIf: asString(idealIfFromHighlights?.text),
                benefits,
                faq: asRecordArray(program.faq).map((item) => ({ q: asString(item.q), a: asString(item.a) })),
                seo: {
                    title: asString(seo.title),
                    description: asString(seo.description),
                    image: asString(seo.image),
                },
            },
            days: program.units.map((unit) => ({
                title: unit.title || `J${unit.unitIndex}`,
                videoUrl: unit.videoUrl || '',
                mantra: unit.mantra || '',
                description: Array.isArray(unit.contentParagraphs) ? unit.contentParagraphs.join('\n') : '',
                status: unit.status === 'PUBLISHED' ? 'published' : 'draft',
            })),
        },
    };
}
