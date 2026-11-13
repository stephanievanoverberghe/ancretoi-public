export type AdminInspirationRow = {
    id: string;
    slug: string;
    status: 'draft' | 'published';
    title: string;
    videoUrl: string | null;
    summary: string | null;
    tags: string[];
    timestamps: { createdAt: string | null; updatedAt: string | null };
};

export type InspirationStatusFilter = 'all' | 'draft' | 'published';
export type InspirationSortKey = 'recent' | 'alphaAsc' | 'alphaDesc';
export type InspirationViewMode = 'cards' | 'table';

export type AdminInspirationsPersistedState = {
    q: string;
    status: InspirationStatusFilter;
    sort: InspirationSortKey;
    tag: string;
    view: InspirationViewMode;
};

export type AdminInspirationsStats = {
    total: number;
    draft: number;
    published: number;
};

export type InspirationVideoThumb = {
    src: string | null;
    alt: string;
};
