import 'server-only';

import { getProgramLoader, loadProgramDetailed, normalizeProgramSlug } from '@/lib/programmes-content';
import type { ProgramJSON } from '@/types/programmes-content.types';

import {
    mapCompareRow,
    mapProgramCardSummary,
    mapProgramChargeLabel,
    mapProgramToProgram,
    PUBLIC_PROGRAM_STATUS,
    sortProgramCardsByDuration,
} from './programmes.mapper';
import {
    findProgramsForComparisonAllStatuses,
    findPublishedProgramBySlug,
    findPublishedProgramDayHeadings,
    findProgramsForCatalogAllStatuses,
    findPublishedProgramsForCatalog,
    findPublishedProgramsForComparison,
    findPublishedProgramsForHome,
    findPublishedProgramPageBySlug,
    findPublishedProgramsForPublic,
    findPublishedProgramSlugs,
} from './programmes.repository';
import type { CompareRow, Program, ProgramCardSummary, PublicProgramStatus } from './programmes.types';

export { PUBLIC_PROGRAM_STATUS };

export function isPublishedProgramStatus(status: unknown): status is PublicProgramStatus {
    return status === PUBLIC_PROGRAM_STATUS;
}

export function isPublicProgram<T extends { status?: unknown }>(program: T | null | undefined): program is T & { status: PublicProgramStatus } {
    return isPublishedProgramStatus(program?.status);
}

export async function getPublicPrograms(): Promise<Program[]> {
    const programs = await findPublishedProgramsForPublic();
    return programs.map(mapProgramToProgram);
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
    const program = await findPublishedProgramBySlug(normalizeProgramSlug(slug));
    return program ? mapProgramToProgram(program) : null;
}

export async function getProgramChargeLabel(slug: string): Promise<string | null> {
    const program = await findPublishedProgramBySlug(normalizeProgramSlug(slug));
    return program ? mapProgramChargeLabel(program) : null;
}

export type ProgramCurriculumDay = { index: number; title: string | null };

export async function getProgramCurriculum(slug: string): Promise<ProgramCurriculumDay[]> {
    const units = await findPublishedProgramDayHeadings(normalizeProgramSlug(slug));
    return units.map((unit) => ({ index: unit.unitIndex, title: unit.title || null }));
}

export async function getProgramsForComparison(): Promise<CompareRow[]> {
    const programs = await findPublishedProgramsForComparison();
    return programs.map(mapCompareRow);
}

export async function getProgramsForComparisonAllStatuses(): Promise<CompareRow[]> {
    const programs = await findProgramsForComparisonAllStatuses();
    return programs.map(mapCompareRow);
}

export async function getProgramsForHome(): Promise<ProgramCardSummary[]> {
    const programs = await findPublishedProgramsForHome();
    return programs.map((program) => mapProgramCardSummary(program));
}

export async function getProgramsForCatalog(): Promise<ProgramCardSummary[]> {
    const programs = await findPublishedProgramsForCatalog();
    return programs.map((program) => mapProgramCardSummary(program, { preferCardImage: true, includeLevel: true })).sort(sortProgramCardsByDuration);
}

export async function getProgramsForCatalogAllStatuses(): Promise<ProgramCardSummary[]> {
    const programs = await findProgramsForCatalogAllStatuses();
    return programs.map((program) => mapProgramCardSummary(program, { preferCardImage: true, includeLevel: true })).sort(sortProgramCardsByDuration);
}

export async function getProgramSlugs(): Promise<string[]> {
    const programs = await findPublishedProgramSlugs();
    return programs.map((program) => normalizeProgramSlug(program.slug));
}

export async function getPublishedProgramPagePayload(slug: string) {
    const program = await findPublishedProgramPageBySlug(normalizeProgramSlug(slug));
    if (!program) return null;

    return {
        page: {
            programSlug: program.slug,
            status: 'published',
            hero: program.hero,
            card: program.card,
            meta: program.meta,
            highlights: program.highlights,
            curriculum: program.curriculum,
            faq: program.faq,
            seo: program.seo,
            price: program.price,
        },
    };
}

export function getProgramJsonLoader(slug: string) {
    return getProgramLoader(slug);
}

export async function getProgramJsonBySlug(slug: string): Promise<ProgramJSON | null> {
    return loadProgramDetailed(slug);
}
