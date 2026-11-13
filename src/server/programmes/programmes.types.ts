import type { CompareRow, Program, Price, ProgramDetail } from '@/types/programmes.types';

export type { CompareRow, Price, Program, ProgramDetail };

export type ProgramStatus = 'draft' | 'preflight' | 'published';
export type PublicProgramStatus = 'published';
export type ProgramLevel = 'Basique' | 'Cible' | 'Premium' | (string & {});

export type ProgramCardSummary = {
    slug: string;
    title: string;
    duration_days: number;
    status: ProgramStatus | string;
    cover: string | null;
    price: {
        amount_cents: number | null;
        currency: string;
    };
    level?: ProgramLevel;
};
