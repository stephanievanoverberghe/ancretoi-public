import 'server-only';

import { EnrollmentStatus, ResourceType, UnitStatus, UnitType } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export function findLearnerUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: { id: true, name: true, deletedAt: true },
    });
}

export function findLearnerUserIdByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: { id: true, deletedAt: true },
    });
}

export function findLearnerDashboardUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            deletedAt: true,
            enrollments: {
                where: {
                    status: {
                        in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED, EnrollmentStatus.COMPLETED],
                    },
                },
                include: {
                    program: true,
                    dayStates: {
                        where: { completed: true },
                        select: { dayIndex: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
            },
        },
    });
}

export function findLearnerBilanEnrollments(userId: string) {
    return getPrismaClient().enrollment.findMany({
        where: {
            userId,
            status: {
                in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED, EnrollmentStatus.COMPLETED],
            },
        },
        include: {
            program: true,
            dayStates: {
                where: { completed: true },
                select: { dayIndex: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
}

export function countDayUnits(programSlug: string, options: { publishedOnly?: boolean } = {}) {
    return getPrismaClient().unit.count({
        where: {
            programSlug,
            unitType: UnitType.DAY,
            ...(options.publishedOnly ? { status: UnitStatus.PUBLISHED } : {}),
        },
    });
}

export async function countDayUnitsByProgramSlugs(programSlugs: string[]) {
    return new Map<string, number>(
        await Promise.all(programSlugs.map(async (slug) => [slug, await countDayUnits(slug)] as const)),
    );
}

export async function findPublishedDayIndicesByProgramSlugs(programSlugs: string[]) {
    const uniqueSlugs = [...new Set(programSlugs)];
    if (uniqueSlugs.length === 0) return new Map<string, number[]>();

    const rows = await getPrismaClient().unit.findMany({
        where: {
            programSlug: { in: uniqueSlugs },
            unitType: UnitType.DAY,
            status: UnitStatus.PUBLISHED,
        },
        select: { programSlug: true, unitIndex: true },
        orderBy: [{ programSlug: 'asc' }, { unitIndex: 'asc' }],
    });
    const indicesBySlug = new Map(uniqueSlugs.map((slug) => [slug, [] as number[]]));

    for (const row of rows) {
        indicesBySlug.get(row.programSlug)?.push(row.unitIndex);
    }

    return indicesBySlug;
}

export function ensureActiveEnrollment(userId: string, programSlug: string) {
    return getPrismaClient().enrollment.upsert({
        where: { userId_programSlug: { userId, programSlug } },
        create: {
            userId,
            programSlug,
            status: EnrollmentStatus.ACTIVE,
            currentDay: 1,
        },
        update: {},
        select: { id: true, status: true },
    });
}

type LearnerDayStateSnapshot = {
    data: unknown;
    practiced: boolean;
    completed: boolean;
    updatedAt: Date;
};

function isPrismaWriteConflict(error: unknown) {
    return Boolean(
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'P2002' || error.code === 'P2034'),
    );
}

function findDayStateSnapshot(enrollmentId: string, day: number) {
    return getPrismaClient().dayState.findUnique({
        where: { enrollmentId_dayIndex: { enrollmentId, dayIndex: day } },
        select: { data: true, practiced: true, completed: true, updatedAt: true },
    });
}

export async function upsertLearnerDayStateRecord(input: {
    enrollmentId: string;
    userId: string;
    programSlug: string;
    day: number;
    data?: Record<string, string>;
    practiced?: boolean;
    completed?: boolean;
    completedAt?: Date | null;
    expectedVersion?: string | null;
}) {
    const createData = {
        enrollmentId: input.enrollmentId,
        userId: input.userId,
        programSlug: input.programSlug,
        dayIndex: input.day,
        data: input.data ?? {},
        practiced: input.practiced ?? false,
        completed: input.completed ?? false,
        completedAt: input.completed ? new Date() : null,
    };
    const updateData = {
        ...(input.data ? { data: input.data } : {}),
        ...(typeof input.practiced === 'boolean' ? { practiced: input.practiced } : {}),
        ...(typeof input.completed === 'boolean'
            ? { completed: input.completed, completedAt: input.completedAt }
            : {}),
    };

    if (input.expectedVersion === undefined) {
        const state = await getPrismaClient().dayState.upsert({
            where: { enrollmentId_dayIndex: { enrollmentId: input.enrollmentId, dayIndex: input.day } },
            create: createData,
            update: updateData,
            select: { id: true, updatedAt: true },
        });
        return { ok: true as const, id: state.id, version: state.updatedAt.toISOString() };
    }

    if (input.expectedVersion === null) {
        try {
            const state = await getPrismaClient().dayState.create({
                data: createData,
                select: { id: true, updatedAt: true },
            });
            return { ok: true as const, id: state.id, version: state.updatedAt.toISOString() };
        } catch (error) {
            if (!isPrismaWriteConflict(error)) throw error;
            return {
                ok: false as const,
                error: 'STALE_STATE' as const,
                current: await findDayStateSnapshot(input.enrollmentId, input.day),
            };
        }
    }

    const expectedUpdatedAt = new Date(input.expectedVersion);
    const states = await getPrismaClient().dayState.updateManyAndReturn({
        where: {
            enrollmentId: input.enrollmentId,
            dayIndex: input.day,
            updatedAt: expectedUpdatedAt,
        },
        data: updateData,
        select: { id: true, updatedAt: true },
    });

    if (states.length === 0) {
        return {
            ok: false as const,
            error: 'STALE_STATE' as const,
            current: await findDayStateSnapshot(input.enrollmentId, input.day),
        };
    }

    const [state] = states;
    return { ok: true as const, id: state.id, version: state.updatedAt.toISOString() };
}

export function saveLearnerDayStateAndSyncProgress(input: {
    enrollmentId: string;
    userId: string;
    programSlug: string;
    day: number;
    publishedDays: number[];
    data?: Record<string, string>;
    practiced?: boolean;
    completed: boolean;
    expectedVersion?: string | null;
}) {
    return getPrismaClient().$transaction(async (tx) => {
        const existing = await tx.dayState.findUnique({
            where: {
                enrollmentId_dayIndex: {
                    enrollmentId: input.enrollmentId,
                    dayIndex: input.day,
                },
            },
            select: { id: true, data: true, practiced: true, completed: true, updatedAt: true },
        });

        if (
            input.expectedVersion !== undefined &&
            ((input.expectedVersion === null && existing) ||
                (input.expectedVersion !== null &&
                    (!existing || existing.updatedAt.toISOString() !== input.expectedVersion)))
        ) {
            return {
                ok: false as const,
                error: 'STALE_STATE' as const,
                current: existing satisfies LearnerDayStateSnapshot | null,
            };
        }
        const practiced = input.practiced ?? existing?.practiced ?? false;

        if (input.completed && !practiced) {
            return {
                ok: false as const,
                error: 'INCOMPLETE_DAY' as const,
                requirements: { practiced: false },
            };
        }

        const completedAt = input.completed ? new Date() : null;
        const stateData = {
            ...(input.data ? { data: input.data } : {}),
            ...(typeof input.practiced === 'boolean' ? { practiced: input.practiced } : {}),
            completed: input.completed,
            completedAt,
        };
        let stateId: string;

        if (existing) {
            const updated = await tx.dayState.updateMany({
                where: {
                    id: existing.id,
                    ...(input.expectedVersion !== undefined
                        ? { updatedAt: new Date(input.expectedVersion ?? 0) }
                        : {}),
                },
                data: stateData,
            });

            if (updated.count === 0) {
                const current = await tx.dayState.findUnique({
                    where: { id: existing.id },
                    select: { data: true, practiced: true, completed: true, updatedAt: true },
                });
                return { ok: false as const, error: 'STALE_STATE' as const, current };
            }
            stateId = existing.id;
        } else {
            const created = await tx.dayState.create({
                data: {
                    enrollmentId: input.enrollmentId,
                    userId: input.userId,
                    programSlug: input.programSlug,
                    dayIndex: input.day,
                    data: input.data ?? {},
                    practiced,
                    completed: input.completed,
                    completedAt,
                },
                select: { id: true },
            });
            stateId = created.id;
        }

        const completedRows = await tx.dayState.findMany({
            where: {
                enrollmentId: input.enrollmentId,
                completed: true,
                dayIndex: { in: input.publishedDays },
            },
            select: { dayIndex: true },
        });
        const completedSet = new Set(completedRows.map((row) => row.dayIndex));
        const nextDay = input.publishedDays.find((day) => !completedSet.has(day)) ?? null;
        const allCompleted = input.publishedDays.length > 0 && nextDay === null;
        const enrollment = await tx.enrollment.findUnique({
            where: { id: input.enrollmentId },
            select: { status: true },
        });
        const status = allCompleted
            ? EnrollmentStatus.COMPLETED
            : enrollment?.status === EnrollmentStatus.PAUSED
              ? EnrollmentStatus.PAUSED
              : EnrollmentStatus.ACTIVE;
        const currentDay = allCompleted
            ? (input.publishedDays.at(-1) ?? 1)
            : (nextDay ?? input.publishedDays[0] ?? 1);

        await tx.enrollment.update({
            where: { id: input.enrollmentId },
            data: {
                currentDay,
                status,
                ...(status === EnrollmentStatus.COMPLETED
                    ? { completedAt: new Date() }
                    : { completedAt: null }),
            },
        });

        return {
            ok: true as const,
            id: stateId,
            version: (await tx.dayState.findUniqueOrThrow({
                where: { id: stateId },
                select: { updatedAt: true },
            })).updatedAt.toISOString(),
            currentDay,
            completedCount: completedSet.size,
            status,
        };
    }, { isolationLevel: 'Serializable' }).catch(async (error: unknown) => {
        if (!isPrismaWriteConflict(error)) throw error;
        return {
            ok: false as const,
            error: 'STALE_STATE' as const,
            current: await findDayStateSnapshot(input.enrollmentId, input.day),
        };
    });
}

export function deleteDayStatesForEnrollment(enrollmentId: string) {
    return getPrismaClient().dayState.deleteMany({ where: { enrollmentId } });
}

export function deleteDayStateForEnrollmentDay(enrollmentId: string, day: number) {
    return getPrismaClient().dayState.deleteMany({ where: { enrollmentId, dayIndex: day } });
}

export function setEnrollmentActiveDay(enrollmentId: string, currentDay: number) {
    return getPrismaClient().enrollment.update({
        where: { id: enrollmentId },
        data: { currentDay, status: EnrollmentStatus.ACTIVE },
    });
}

export function pauseEnrollment(enrollmentId: string) {
    return getPrismaClient().enrollment.update({
        where: { id: enrollmentId },
        data: { status: EnrollmentStatus.PAUSED },
        select: { id: true, status: true, currentDay: true },
    });
}

export async function findLastPublishedDayIndex(programSlug: string) {
    const last = await getPrismaClient().unit.findFirst({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: { unitIndex: true },
        orderBy: { unitIndex: 'desc' },
    });

    return last?.unitIndex ?? 0;
}

export function resetIntroForProgram(input: { userId: string; programSlug: string }) {
    return getPrismaClient().$transaction(async (tx) => {
        await tx.dayState.deleteMany({ where: { userId: input.userId, programSlug: input.programSlug } });
        await tx.enrollment.upsert({
            where: { userId_programSlug: { userId: input.userId, programSlug: input.programSlug } },
            create: {
                userId: input.userId,
                programSlug: input.programSlug,
                introEngaged: false,
                currentDay: 1,
                status: EnrollmentStatus.ACTIVE,
            },
            update: {
                introEngaged: false,
                currentDay: 1,
                status: EnrollmentStatus.ACTIVE,
                startedAt: null,
                completedAt: null,
            },
        });
    });
}

export function markIntroEngaged(input: {
    userId: string;
    programSlug: string;
    currentDay: number;
    status: EnrollmentStatus;
    startedAtMissing: boolean;
}) {
    return getPrismaClient().enrollment.update({
        where: { userId_programSlug: { userId: input.userId, programSlug: input.programSlug } },
        data: {
            introEngaged: true,
            currentDay: input.currentDay,
            status: input.status,
            ...(input.startedAtMissing ? { startedAt: new Date() } : {}),
            ...(input.status === EnrollmentStatus.COMPLETED
                ? { completedAt: new Date() }
                : { completedAt: null }),
        },
    });
}

export function findEnrollmentProgressRecord(userId: string, programSlug: string) {
    return getPrismaClient().enrollment.findUnique({
        where: { userId_programSlug: { userId, programSlug } },
        select: { id: true, status: true, currentDay: true, startedAt: true },
    });
}

export function createEnrollmentProgressRecord(userId: string, programSlug: string) {
    return getPrismaClient().enrollment.create({
        data: { userId, programSlug, status: EnrollmentStatus.ACTIVE, currentDay: 1 },
        select: { id: true, status: true, currentDay: true, startedAt: true },
    });
}

export function updateEnrollmentSetDay(input: { enrollmentId: string; currentDay: number; status: EnrollmentStatus; startedAtMissing: boolean }) {
    return getPrismaClient().enrollment.update({
        where: { id: input.enrollmentId },
        data: {
            currentDay: input.currentDay,
            status: input.status,
            ...(input.startedAtMissing ? { startedAt: new Date() } : {}),
            ...(input.status === EnrollmentStatus.COMPLETED ? { completedAt: new Date() } : { completedAt: null }),
        },
    });
}

export function findDayPracticeState(enrollmentId: string, day: number) {
    return getPrismaClient().dayState.findUnique({
        where: { enrollmentId_dayIndex: { enrollmentId, dayIndex: day } },
        select: { practiced: true },
    });
}

export function markDayCompleted(enrollmentId: string, day: number) {
    return getPrismaClient().dayState.update({
        where: { enrollmentId_dayIndex: { enrollmentId, dayIndex: day } },
        data: { completed: true, completedAt: new Date() },
    });
}

export function updateEnrollmentAfterCompletion(input: { enrollmentId: string; currentDay: number; status: EnrollmentStatus }) {
    return getPrismaClient().enrollment.update({
        where: { id: input.enrollmentId },
        data: {
            currentDay: input.currentDay,
            status: input.status,
            ...(input.status === EnrollmentStatus.COMPLETED ? { completedAt: new Date() } : { completedAt: null }),
        },
    });
}

export async function findMaxCompletedDay(enrollmentId: string) {
    const maxCompleted = await getPrismaClient().dayState.findFirst({
        where: { enrollmentId, completed: true },
        select: { dayIndex: true },
        orderBy: { dayIndex: 'desc' },
    });

    return maxCompleted?.dayIndex ?? 0;
}

export function findCompletedDayIndices(enrollmentId: string) {
    return getPrismaClient().dayState.findMany({
        where: { enrollmentId, completed: true },
        select: { dayIndex: true },
        orderBy: { dayIndex: 'asc' },
    });
}

export function reopenEnrollmentAtDay(enrollmentId: string, currentDay: number) {
    return getPrismaClient().enrollment.update({
        where: { id: enrollmentId },
        data: { currentDay, status: EnrollmentStatus.ACTIVE, completedAt: null },
    });
}

export async function findLearnerProgramSummaryData(userId: string, slug: string) {
    const [enrollment, units, program] = await Promise.all([
        getPrismaClient().enrollment.findUnique({
            where: { userId_programSlug: { userId, programSlug: slug } },
            select: {
                status: true,
                currentDay: true,
                dayStates: {
                    where: { completed: true },
                    select: { dayIndex: true },
                },
            },
        }),
        getPrismaClient().unit.findMany({
            where: {
                programSlug: slug,
                unitType: UnitType.DAY,
                status: UnitStatus.PUBLISHED,
            },
            select: { unitIndex: true },
            orderBy: { unitIndex: 'asc' },
        }),
        getPrismaClient().program.findUnique({ where: { slug } }),
    ]);

    return {
        enrollment,
        total: units.length,
        publishedDays: units.map((unit) => unit.unitIndex),
        program,
    };
}

export function findPublishedDayUnits(programSlug: string, options: { take?: number; includeDayContent?: boolean } = {}) {
    return getPrismaClient().unit.findMany({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: options.includeDayContent
            ? { unitIndex: true, title: true, mantra: true, durationMin: true, videoUrl: true, contentParagraphs: true }
            : { unitIndex: true, title: true },
        orderBy: { unitIndex: 'asc' },
        ...(options.take ? { take: options.take } : {}),
    });
}

export function findPublishedDayUnitHeadings(programSlug: string, options: { take?: number } = {}) {
    return getPrismaClient().unit.findMany({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: { unitIndex: true, title: true },
        orderBy: { unitIndex: 'asc' },
        ...(options.take ? { take: options.take } : {}),
    });
}

export function findPublishedDayUnitLayoutRecords(programSlug: string) {
    return getPrismaClient().unit.findMany({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: { unitIndex: true, title: true, mantra: true },
        orderBy: { unitIndex: 'asc' },
    });
}

export function findPublishedDayUnitContentRecords(programSlug: string) {
    return getPrismaClient().unit.findMany({
        where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
        select: {
            unitIndex: true,
            title: true,
            mantra: true,
            durationMin: true,
            videoUrl: true,
            contentParagraphs: true,
            content: true,
            journalSchema: true,
            validationSchema: true,
        },
        orderBy: { unitIndex: 'asc' },
    });
}

export function findLearnerResources(input: {
    type?: ResourceType;
    q?: string;
    tags?: string[];
    sort?: string;
}) {
    const q = input.q?.trim() ?? '';
    const tags = input.tags ?? [];
    const orderBy =
        input.sort === 'alpha'
            ? [{ title: 'asc' as const }]
            : input.sort === 'duration'
              ? [{ minutes: 'asc' as const }, { title: 'asc' as const }]
              : [{ createdAt: 'desc' as const }];

    return getPrismaClient().resource.findMany({
        where: {
            ...(input.type ? { type: input.type } : {}),
            ...(q
                ? {
                      OR: [
                          { title: { contains: q, mode: 'insensitive' as const } },
                          { description: { contains: q, mode: 'insensitive' as const } },
                          { tags: { has: q } },
                      ],
                  }
                : {}),
            ...(tags.length > 0 ? { tags: { hasEvery: tags } } : {}),
        },
        orderBy,
    });
}

export function findUserEnrollmentActivityDates(userId: string) {
    return getPrismaClient().dayState.findMany({
        where: {
            userId,
            OR: [{ practiced: true }, { completed: true }],
        },
        select: { createdAt: true, updatedAt: true, completedAt: true },
    });
}

export async function findLatestEnrollmentForNextStep(userId: string) {
    const select = {
        id: true,
        programSlug: true,
        status: true,
        currentDay: true,
        introEngaged: true,
        dayStates: {
            where: { completed: true },
            select: { dayIndex: true },
        },
    } as const;
    const prisma = getPrismaClient();

    return (
        (await prisma.enrollment.findFirst({
            where: { userId, status: EnrollmentStatus.ACTIVE },
            select,
            orderBy: { updatedAt: 'desc' },
        })) ??
        (await prisma.enrollment.findFirst({
            where: { userId, status: EnrollmentStatus.PAUSED },
            select,
            orderBy: { updatedAt: 'desc' },
        })) ??
        (await prisma.enrollment.findFirst({
            where: { userId, status: EnrollmentStatus.COMPLETED },
            select,
            orderBy: { updatedAt: 'desc' },
        }))
    );
}

export function findDayStateId(enrollmentId: string, day: number) {
    return getPrismaClient().dayState.findUnique({
        where: { enrollmentId_dayIndex: { enrollmentId, dayIndex: day } },
        select: { id: true },
    });
}

export function findUserActiveProgramStateByEmail(email: string) {
    return getPrismaClient().user.findFirst({
        where: { email, deletedAt: null },
        select: {
            id: true,
            enrollments: {
                where: { status: EnrollmentStatus.ACTIVE },
                select: { programSlug: true },
                take: 1,
                orderBy: { updatedAt: 'desc' },
            },
        },
    });
}

export function findUserAccessibleProgramStateByEmail(email: string) {
    return getPrismaClient().user.findFirst({
        where: { email, deletedAt: null },
        select: {
            id: true,
            enrollments: {
                where: {
                    status: {
                        in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED, EnrollmentStatus.COMPLETED],
                    },
                },
                select: { programSlug: true },
                take: 1,
                orderBy: { updatedAt: 'desc' },
            },
        },
    });
}

export function findEntitlementUserByEmail(input: { email: string; programSlug: string }) {
    return getPrismaClient().user.findUnique({
        where: { email: input.email },
        select: {
            id: true,
            email: true,
            deletedAt: true,
            enrollments: {
                where: {
                    programSlug: input.programSlug,
                    status: {
                        in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED, EnrollmentStatus.COMPLETED],
                    },
                },
                select: { id: true },
                take: 1,
            },
        },
    });
}

export async function findCourseLayoutRecords(userId: string, programSlug: string) {
    const [enrollment, units, states] = await Promise.all([
        getPrismaClient().enrollment.findUnique({
            where: { userId_programSlug: { userId, programSlug } },
            select: { id: true, status: true, currentDay: true, startedAt: true, introEngaged: true },
        }),
        getPrismaClient().unit.findMany({
            where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
            select: { unitIndex: true, title: true, mantra: true },
            orderBy: { unitIndex: 'asc' },
        }),
        getPrismaClient().dayState.findMany({
            where: { userId, programSlug },
            select: { dayIndex: true, practiced: true, completed: true },
        }),
    ]);

    return { enrollment, units, states };
}

export async function findFormationOverviewRecords(userId: string, programSlug: string) {
    const [program, units, enrollment, progressCount] = await Promise.all([
        getPrismaClient().program.findUnique({ where: { slug: programSlug } }),
        getPrismaClient().unit.findMany({
            where: { programSlug, unitType: UnitType.DAY, status: UnitStatus.PUBLISHED },
            select: { unitIndex: true },
            orderBy: { unitIndex: 'asc' },
        }),
        getPrismaClient().enrollment.findUnique({
            where: { userId_programSlug: { userId, programSlug } },
            select: {
                introEngaged: true,
                startedAt: true,
                status: true,
                currentDay: true,
                dayStates: {
                    where: { completed: true },
                    select: { dayIndex: true },
                },
            },
        }),
        getPrismaClient().dayState.count({
            where: {
                userId,
                programSlug,
                OR: [{ practiced: true }, { completed: true }],
            },
        }),
    ]);

    return { program, units, enrollment, progressCount };
}

export function findEnrollmentForFormationDay(userId: string, programSlug: string) {
    return getPrismaClient().enrollment.findUnique({
        where: { userId_programSlug: { userId, programSlug } },
        select: {
            id: true,
            status: true,
            currentDay: true,
            introEngaged: true,
            dayStates: {
                where: { completed: true },
                select: { dayIndex: true },
            },
        },
    });
}

export async function findFormationDayState(input: { enrollmentId: string; userId: string; programSlug: string; day: number }) {
    const [state, completedCount] = await Promise.all([
        getPrismaClient().dayState.findUnique({
            where: { enrollmentId_dayIndex: { enrollmentId: input.enrollmentId, dayIndex: input.day } },
            select: { data: true, practiced: true, completed: true, updatedAt: true },
        }),
        getPrismaClient().dayState.count({ where: { userId: input.userId, programSlug: input.programSlug, completed: true } }),
    ]);

    return { state, completedCount };
}
