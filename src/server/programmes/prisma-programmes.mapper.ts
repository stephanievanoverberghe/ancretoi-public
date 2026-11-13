import type {
    LegacyProgramLevel,
    LegacyProgramStatus,
    LegacyUnitStatus,
    PrismaProgramLevelValue,
    PrismaProgramSeedInput,
    PrismaProgramSeedInputBundle,
    PrismaProgramStatusValue,
    PrismaUnitSeedInput,
    PrismaUnitStatusValue,
    ProgramJsonExerciseInput,
    ProgramJsonMigrationInput,
    ProgramJsonSeedMeta,
    ProgramPageMigrationInput,
    UnitMigrationInput,
} from './prisma-programmes.types';

const DEFAULT_PROGRAM_DURATION_DAYS = 7;
const DEFAULT_MINUTES_PER_DAY = 20;

export function mapProgramStatusToPrisma(status?: LegacyProgramStatus | null): PrismaProgramStatusValue {
    switch (status) {
        case 'published':
            return 'PUBLISHED';
        case 'preflight':
            return 'PREFLIGHT';
        case 'archived':
            return 'ARCHIVED';
        case 'draft':
        default:
            return 'DRAFT';
    }
}

export function mapUnitStatusToPrisma(status?: LegacyUnitStatus | null): PrismaUnitStatusValue {
    switch (status) {
        case 'published':
            return 'PUBLISHED';
        case 'archived':
            return 'ARCHIVED';
        case 'draft':
        default:
            return 'DRAFT';
    }
}

export function mapProgramLevelToPrisma(level?: LegacyProgramLevel | null): PrismaProgramLevelValue | null {
    switch (level) {
        case 'Basique':
            return 'BASIQUE';
        case 'Cible':
            return 'CIBLE';
        case 'Premium':
            return 'PREMIUM';
        default:
            return null;
    }
}

export function mapProgramPageToPrismaProgramInput(page: ProgramPageMigrationInput, options?: { unitsCount?: number }): PrismaProgramSeedInput {
    const slug = normalizeSlug(page.programSlug);
    const title = page.hero?.title?.trim() || slug;
    const durationDays = page.meta?.durationDays ?? options?.unitsCount ?? DEFAULT_PROGRAM_DURATION_DAYS;
    const estMinutesPerDay = page.meta?.estMinutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
    const coverUrl = page.card?.image?.url || page.hero?.heroImage?.url || null;

    return {
        slug,
        title,
        subtitle: page.hero?.subtitle?.trim() || null,
        description: page.card?.summary?.trim() || null,
        coverUrl,
        level: mapProgramLevelToPrisma(page.meta?.level),
        status: mapProgramStatusToPrisma(page.status),
        durationDays,
        estMinutesPerDay,
        unitsCount: options?.unitsCount ?? durationDays,
        category: page.meta?.category ?? null,
        tags: page.meta?.tags ?? [],
        language: page.meta?.language ?? 'fr',
        hero: page.hero ?? null,
        card: page.card ?? null,
        meta: page.meta ?? null,
        marketing: {
            compare: page.compare ?? null,
            source: 'ProgramPage',
        },
        highlights: page.highlights ?? [],
        curriculum: page.curriculum ?? [],
        faq: page.faq ?? [],
        seo: page.seo ?? null,
        price: normalizePrice(page.price),
        metadata: {
            source: 'ProgramPage',
            createdAt: page.createdAt ?? null,
            updatedAt: page.updatedAt ?? null,
        },
    };
}

export function mapUnitToPrismaUnitInput(unit: UnitMigrationInput): PrismaUnitSeedInput {
    const contentParagraphs = unit.contentParagraphs ?? [];

    return {
        programSlug: normalizeSlug(unit.programSlug),
        unitType: 'DAY',
        unitIndex: unit.unitIndex,
        title: unit.title,
        durationMin: unit.durationMin ?? DEFAULT_MINUTES_PER_DAY,
        mantra: unit.mantra ?? '',
        videoUrl: unit.videoUrl ?? '',
        contentParagraphs,
        content: {
            contentParagraphs,
            legacyUnitType: unit.unitType ?? 'day',
        },
        journalSchema: unit.journalSchema ?? null,
        validationSchema: unit.validationSchema ?? null,
        status: mapUnitStatusToPrisma(unit.status),
    };
}

export function mapProgramJsonToPrismaSeedInput(programJson: ProgramJsonMigrationInput, meta: ProgramJsonSeedMeta): PrismaProgramSeedInputBundle {
    const slug = normalizeSlug(meta.slug);
    const days = programJson.days ?? [];
    const title = meta.title ?? programJson.product;
    const cardImage = meta.coverUrl ? { url: meta.coverUrl, alt: title } : null;
    const units = days.map((day): PrismaUnitSeedInput => {
        const exercises = collectDayExercises(day.blocks);
        const firstVideo = exercises.find((exercise) => exercise.media?.video)?.media?.video ?? '';
        const journalExercises = exercises.filter((exercise) => exercise.type === 'journal');

        return {
            programSlug: slug,
            unitType: 'DAY',
            unitIndex: day.day,
            title: day.title,
            durationMin: meta.estMinutesPerDay ?? DEFAULT_MINUTES_PER_DAY,
            mantra: '',
            videoUrl: firstVideo,
            contentParagraphs: [],
            content: {
                objectives: day.objectives ?? [],
                outcomes: day.outcomes ?? [],
                exercises,
                sourceBlocks: Object.keys(day.blocks ?? {}),
            },
            journalSchema: journalExercises.length ? { exercises: journalExercises } : null,
            validationSchema: day.daily_check ?? null,
            status: mapUnitStatusToPrisma(meta.status === 'published' ? 'published' : 'draft'),
        };
    });

    return {
        program: {
            slug,
            title,
            subtitle: null,
            description: meta.tagline ?? meta.detail?.who ?? null,
            coverUrl: meta.coverUrl ?? null,
            level: mapProgramLevelToPrisma(meta.level),
            status: mapProgramStatusToPrisma(meta.status),
            durationDays: meta.durationDays ?? days.length,
            estMinutesPerDay: meta.estMinutesPerDay ?? DEFAULT_MINUTES_PER_DAY,
            unitsCount: units.length,
            category: null,
            tags: [],
            language: 'fr',
            hero: {
                title,
                subtitle: meta.tagline ?? null,
                heroImage: cardImage,
            },
            card: {
                image: cardImage,
                tagline: meta.tagline ?? null,
                summary: meta.detail?.who ?? meta.tagline ?? null,
                badges: meta.cardHighlights ?? [],
            },
            meta: {
                durationDays: meta.durationDays ?? days.length,
                estMinutesPerDay: meta.estMinutesPerDay ?? DEFAULT_MINUTES_PER_DAY,
                level: meta.level ?? null,
                version: programJson.version ?? null,
                timezone: programJson.timezone ?? null,
            },
            marketing: {
                compare: normalizeCompare(meta.compare),
                detail: meta.detail ?? null,
                source: 'ProgramJSON',
            },
            highlights: meta.cardHighlights ?? [],
            curriculum: days.map((day) => ({ label: day.title, summary: '' })),
            faq: meta.detail?.faq ?? null,
            seo: null,
            price: normalizePrice(meta.price),
            metadata: {
                source: 'ProgramJSON',
                createdAt: programJson.created_at ?? null,
                updatedAt: programJson.updated_at ?? null,
            },
        },
        units,
    };
}

function normalizeCompare(compare: ProgramJsonSeedMeta['compare']) {
    if (!compare) return null;

    return {
        objectif: textOrNull(compare['objectif']),
        charge: textOrNull(compare['charge']),
        idealSi: textOrNull(compare['idealSi'] ?? compare['ideal_si']),
        ctaLabel: textOrNull(compare['ctaLabel'] ?? compare['cta']),
    };
}

function textOrNull(value: unknown) {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || null;
}

function normalizePrice(price: ProgramPageMigrationInput['price']) {
    if (!price) return null;

    return {
        amountCents: price.amountCents ?? null,
        currency: price.currency ?? 'EUR',
        taxIncluded: price.taxIncluded ?? true,
        compareAtCents: price.compareAtCents ?? null,
        stripePriceId: price.stripePriceId ?? null,
    };
}

function collectDayExercises(blocks: ProgramJsonMigrationInput['days'][number]['blocks']): ProgramJsonExerciseInput[] {
    return Object.values(blocks ?? {}).flatMap((section) => section?.exercises ?? []);
}

function normalizeSlug(slug: string) {
    return slug.trim().toLowerCase();
}
