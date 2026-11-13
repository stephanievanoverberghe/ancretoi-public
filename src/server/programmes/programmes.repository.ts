import 'server-only';

import { ProgramStatus as PrismaProgramStatus, UnitStatus, UnitType } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

const PRISMA_PUBLIC_PROGRAM_QUERY = {
    status: PrismaProgramStatus.PUBLISHED,
    deletedAt: null,
} as const;

export async function findPublishedProgramsForPublic() {
    return getPrismaClient().program.findMany({
        where: PRISMA_PUBLIC_PROGRAM_QUERY,
        orderBy: [{ durationDays: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function findPublishedProgramBySlug(slug: string) {
    return getPrismaClient().program.findFirst({
        where: {
            ...PRISMA_PUBLIC_PROGRAM_QUERY,
            slug,
        },
    });
}

export async function findPublishedProgramDayHeadings(programSlug: string) {
    return getPrismaClient().unit.findMany({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: { unitIndex: true, title: true },
        orderBy: { unitIndex: 'asc' },
    });
}

export async function findPublishedProgramsForComparison() {
    return getPrismaClient().program.findMany({
        where: PRISMA_PUBLIC_PROGRAM_QUERY,
        orderBy: [{ durationDays: 'asc' }, { createdAt: 'asc' }],
    });
}

export async function findProgramsForComparisonAllStatuses() {
    return getPrismaClient().program.findMany({
        where: { deletedAt: null },
        orderBy: [{ durationDays: 'asc' }, { createdAt: 'asc' }],
    });
}

export async function findPublishedProgramsForHome() {
    return getPrismaClient().program.findMany({
        where: PRISMA_PUBLIC_PROGRAM_QUERY,
        orderBy: [{ createdAt: 'asc' }],
    });
}

export async function findPublishedProgramsForCatalog() {
    return getPrismaClient().program.findMany({
        where: PRISMA_PUBLIC_PROGRAM_QUERY,
        orderBy: [{ durationDays: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function findProgramsForCatalogAllStatuses() {
    return getPrismaClient().program.findMany({
        where: { deletedAt: null },
        orderBy: [{ durationDays: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function findPublishedProgramSlugs() {
    return getPrismaClient().program.findMany({
        where: PRISMA_PUBLIC_PROGRAM_QUERY,
        select: { slug: true },
        orderBy: [{ slug: 'asc' }],
    });
}

export async function findPublishedProgramPageBySlug(slug: string) {
    return getPrismaClient().program.findFirst({
        where: {
            ...PRISMA_PUBLIC_PROGRAM_QUERY,
            slug,
        },
    });
}
