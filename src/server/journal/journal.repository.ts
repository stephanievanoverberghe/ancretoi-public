import 'server-only';

import { getPrismaClient } from '@/server/db/prisma';

export function findJournalUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: { id: true, deletedAt: true },
    });
}

export function findJournalExportUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: { id: true, email: true, deletedAt: true },
    });
}

export function findDayStatesForUser(input: { userId: string; programFilter?: string }) {
    return getPrismaClient().dayState.findMany({
        where: {
            userId: input.userId,
            ...(input.programFilter ? { programSlug: input.programFilter } : {}),
        },
        select: {
            programSlug: true,
            dayIndex: true,
            data: true,
            practiced: true,
            completed: true,
            updatedAt: true,
        },
        orderBy: [{ programSlug: 'asc' }, { dayIndex: 'asc' }],
    });
}
