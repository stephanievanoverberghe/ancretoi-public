export type LegacyProgramStatus = 'draft' | 'preflight' | 'published' | 'archived' | (string & {});
export type LegacyUnitStatus = 'draft' | 'published' | 'archived' | (string & {});
export type LegacyProgramLevel = 'Basique' | 'Cible' | 'Premium' | (string & {});

export type PrismaProgramStatusValue = 'DRAFT' | 'PREFLIGHT' | 'PUBLISHED' | 'ARCHIVED';
export type PrismaUnitStatusValue = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PrismaProgramLevelValue = 'BASIQUE' | 'CIBLE' | 'PREMIUM';

export type ProgramPageMigrationInput = {
    _id?: unknown;
    programSlug: string;
    status?: LegacyProgramStatus | null;
    hero?: {
        eyebrow?: string | null;
        title?: string | null;
        subtitle?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
        heroImage?: { url?: string | null; alt?: string | null } | null;
    } | null;
    card?: {
        image?: { url?: string | null; alt?: string | null } | null;
        tagline?: string | null;
        summary?: string | null;
        accentColor?: string | null;
        badges?: string[] | null;
    } | null;
    meta?: {
        durationDays?: number | null;
        estMinutesPerDay?: number | null;
        level?: LegacyProgramLevel | null;
        category?: string | null;
        tags?: string[] | null;
        language?: string | null;
    } | null;
    highlights?: unknown[] | null;
    curriculum?: unknown[] | null;
    faq?: unknown[] | null;
    seo?: Record<string, unknown> | null;
    price?: {
        amountCents?: number | null;
        currency?: string | null;
        taxIncluded?: boolean | null;
        compareAtCents?: number | null;
        stripePriceId?: string | null;
    } | null;
    compare?: Record<string, unknown> | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
};

export type UnitMigrationInput = {
    _id?: unknown;
    programSlug: string;
    unitType?: 'day' | string | null;
    unitIndex: number;
    title: string;
    durationMin?: number | null;
    mantra?: string | null;
    videoUrl?: string | null;
    contentParagraphs?: string[] | null;
    journalSchema?: unknown;
    validationSchema?: unknown;
    status?: LegacyUnitStatus | null;
};

export type ProgramJsonMigrationInput = {
    product: string;
    version?: string;
    timezone?: string;
    created_at?: string;
    updated_at?: string;
    days: ProgramJsonDayInput[];
};

export type ProgramJsonDayInput = {
    day: number;
    title: string;
    objectives?: string[];
    outcomes?: string[];
    blocks?: Record<string, ProgramJsonDaySectionInput | undefined>;
    daily_check?: unknown;
};

export type ProgramJsonDaySectionInput = {
    duration_min?: number | string;
    exercises?: ProgramJsonExerciseInput[];
};

export type ProgramJsonExerciseInput = {
    key: string;
    title: string;
    type: string;
    description?: string;
    fields?: unknown[];
    media?: {
        video?: string;
        poster?: string;
        captions_vtt?: string;
        chapters_vtt?: string;
        transcript_pdf?: string;
        transcript_txt?: string;
        duration_sec?: number;
        sensitivity?: string;
    };
};

export type ProgramJsonSeedMeta = {
    slug: string;
    title?: string;
    tagline?: string;
    status?: LegacyProgramStatus;
    level?: LegacyProgramLevel;
    durationDays?: number;
    estMinutesPerDay?: number;
    coverUrl?: string;
    price?: ProgramPageMigrationInput['price'];
    cardHighlights?: string[];
    detail?: {
        overview?: unknown;
        inside?: unknown;
        path?: unknown;
        outcomes_section?: unknown;
        faq_section?: unknown;
        final_cta?: unknown;
        who?: string | null;
        goals?: string[] | null;
        includes?: string[] | null;
        prerequisites?: string[] | null;
        outcomes?: string[] | null;
        faq?: { q?: string | null; a?: string | null }[] | null;
    } | null;
    compare?: Record<string, unknown> | null;
};

export type PrismaProgramSeedInput = {
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    coverUrl: string | null;
    level: PrismaProgramLevelValue | null;
    status: PrismaProgramStatusValue;
    durationDays: number;
    estMinutesPerDay: number;
    unitsCount: number;
    category: string | null;
    tags: string[];
    language: string;
    hero: unknown | null;
    card: unknown | null;
    meta: unknown | null;
    marketing: unknown | null;
    highlights: unknown | null;
    curriculum: unknown | null;
    faq: unknown | null;
    seo: unknown | null;
    price: unknown | null;
    metadata: unknown | null;
};

export type PrismaUnitSeedInput = {
    programSlug: string;
    unitType: 'DAY';
    unitIndex: number;
    title: string;
    durationMin: number;
    mantra: string;
    videoUrl: string;
    contentParagraphs: string[];
    content: unknown | null;
    journalSchema: unknown | null;
    validationSchema: unknown | null;
    status: PrismaUnitStatusValue;
};

export type PrismaProgramSeedInputBundle = {
    program: PrismaProgramSeedInput;
    units: PrismaUnitSeedInput[];
};
