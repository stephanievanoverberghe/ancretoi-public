import type { ProgramJSON } from '@/types/programmes-content.types';

/**
 * Normalise un slug programme venant d'une route, d'un contenu statique ou d'un seed.
 * Les JSON programmes restent une source de contenu canonique/seed, pas une couche DB active.
 */
export function normalizeProgramSlug(s: string): string {
    return s
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, '-');
}

/**
 * Catalogue des contenus programmes importables statiquement.
 * Les slugs doivent rester alignes avec les slugs publics et les seeds Prisma.
 */
export const PROGRAM_CATALOG = {
    'reset-7': { slug: 'reset-7', file: () => import('@/data/programs/reset7.json') },
    'boussole-10': { slug: 'boussole-10', file: () => import('@/data/programs/boussole10.json') },
    'ancrage-30': { slug: 'ancrage-30', file: () => import('@/data/programs/ancrage30.json') },
    'alchimie-90': { slug: 'alchimie-90', file: () => import('@/data/programs/alchimie90.json') },
} as const;

export type ProgramSlug = keyof typeof PROGRAM_CATALOG;

export type ProgramCatalogEntry = {
    slug: ProgramSlug;
    file: () => Promise<{ default: ProgramJSON }>;
};

export function getProgramLoader(slugLike: string): ProgramCatalogEntry['file'] | null {
    const slug = normalizeProgramSlug(slugLike);
    const entry = (PROGRAM_CATALOG as Record<string, ProgramCatalogEntry>)[slug];
    return entry?.file ?? null;
}

/**
 * Charge le JSON detaille d'un programme connu.
 * Retourne `null` pour un slug absent afin de laisser l'appelant choisir son fallback UX.
 */
export async function loadProgramDetailed(slugLike: string): Promise<ProgramJSON | null> {
    const loader = getProgramLoader(slugLike);
    if (!loader) return null;
    const mod = await loader();
    return mod.default as ProgramJSON;
}
