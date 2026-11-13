export type AdminProgramRow = {
    programSlug: string;
    status: 'draft' | 'preflight' | 'published';
    title: string;
    coverUrl: string | null;
    coverAlt: string | null;
    price: { amountCents: number | null; currency: 'EUR' | string };
    meta: {
        durationDays: number | null;
        estMinutesPerDay: number | null;
        level: 'Basique' | 'Cible' | 'Premium' | null;
        tags: string[];
    };
    stats: { unitsCount: number };
    timestamps: { createdAt: string | null; updatedAt: string | null };
};

export type StatusFilter = 'all' | 'draft' | 'preflight' | 'published';
export type LevelFilter = '' | 'Basique' | 'Cible' | 'Premium';
export type SortKey = 'recent' | 'alphaAsc' | 'alphaDesc';
export type ViewMode = 'cards' | 'table';

export type PersistedState = {
    q: string;
    status: StatusFilter;
    level: LevelFilter;
    tag: string;
    sort: SortKey;
    view: ViewMode;
};

export type ProgramStats = {
    total: number;
    draft: number;
    preflight: number;
    published: number;
};
