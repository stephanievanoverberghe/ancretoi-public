import type { CompareRow, ProgramCardSummary } from '@/server/programmes';

export type ProgrammesCatalogProgram = ProgramCardSummary & {
    isPublished: boolean;
    href: string;
    durationLabel: string;
    statusLabel: string;
    ctaLabel: string;
    priceLabel: string | null;
    summary: string;
    idealFor: string;
    coverSrc: string;
};

export type ProgrammesCatalogSource = {
    programs: ProgramCardSummary[];
    comparisonRows: CompareRow[];
};
