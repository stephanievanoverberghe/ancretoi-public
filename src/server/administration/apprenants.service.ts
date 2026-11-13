import 'server-only';

import { EnrollmentStatus, Prisma, UserRole, UserTheme, UnitType } from '@/generated/prisma/client';
import { requireAdmin } from '@/server/auth/authz';
import { getPrismaClient } from '@/server/db/prisma';

type AdminRole = 'user' | 'admin';
type AdminTheme = 'system' | 'light' | 'dark';
type AdminEnrollmentStatus = 'active' | 'completed' | 'paused' | 'canceled';
type AdminProgramLevel = 'Basique' | 'Cible' | 'Premium' | null;

export type AdminLearnerEnrollmentRow = {
    _id: string;
    programTitle: string;
    programSlug: string;
    coverUrl?: string | null;
    level?: AdminProgramLevel;
    status: AdminEnrollmentStatus;
    unitsCount: number;
    unitsDone: number;
    progressPct: number;
    currentDay?: number | null;
    updatedAt?: Date | string | null;
};

export type AdminLearnerDetailData = {
    user: {
        _id: string;
        name?: string | null;
        email: string;
        role: AdminRole;
        avatarUrl?: string | null;
        theme?: AdminTheme;
        marketing?: boolean;
        productUpdates?: boolean;
        createdAt?: Date | string | null;
        lastLoginAt?: Date | string | null;
        passwordChangedAt?: Date | string | null;
        deletedAt?: Date | string | null;
        suspendedAt?: Date | string | null;
    };
    enrollsClient: AdminLearnerEnrollmentRow[];
    stats: {
        enrollCount: number;
        avgPercent: number;
        totalUnitsDone: number;
        practicedDays: number;
        firstStartAt?: Date | string | null;
        dailyPace: number;
        status: { active: number; completed: number; paused: number; canceled: number };
    };
    lastLearningActivityAt: Date | null;
};

export type AdminLegacyUiEnrollment = {
    programSlug: string;
    programTitle: string;
    coverUrl: string | null;
    level: AdminProgramLevel;
    status: AdminEnrollmentStatus;
    startedAtIso: string | null;
    updatedAtIso: string | null;
    progressPct: number | null;
    currentDay: number | null;
    unitsCount: number | null;
    _id?: string;
    programId?: string;
    finishedAtIso?: string | null;
};

export type AdminLegacyUiUserDetail = {
    _id: string;
    name: string | null;
    email: string;
    role: AdminRole;
    createdAtIso: string;
    avatarUrl: string | null;
    isSelf: boolean;
    isArchived: boolean;
    isSuspended: boolean;
    enrollments: AdminLegacyUiEnrollment[];
    theme?: AdminTheme;
    marketing?: boolean;
    productUpdates?: boolean;
    passwordChangedAtIso?: string | null;
    limits?: {
        maxConcurrentPrograms: number | null;
        features: string[];
    };
};

type JsonRecord = Record<string, unknown>;

function getFormUserId(formData: FormData) {
    return String(formData.get('id') ?? formData.get('userId') ?? '');
}

function getFormRole(formData: FormData) {
    return String(formData.get('role') ?? 'user') === 'admin' ? UserRole.ADMIN : UserRole.USER;
}

function mapRole(role: UserRole): AdminRole {
    return role === UserRole.ADMIN ? 'admin' : 'user';
}

function mapTheme(theme: UserTheme): AdminTheme {
    if (theme === UserTheme.LIGHT) return 'light';
    if (theme === UserTheme.DARK) return 'dark';
    return 'system';
}

function mapEnrollmentStatus(status: EnrollmentStatus): AdminEnrollmentStatus {
    if (status === EnrollmentStatus.COMPLETED) return 'completed';
    if (status === EnrollmentStatus.PAUSED) return 'paused';
    if (status === EnrollmentStatus.CANCELED) return 'canceled';
    return 'active';
}

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function clampPct(value?: number | null) {
    return typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;
}

function mapLevel(value: unknown): AdminProgramLevel {
    if (value === 'Basique' || value === 'Cible' || value === 'Premium') return value;
    return null;
}

const ADMIN_MUTATION_RETRIES = 3;

function isSerializableConflict(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}

async function runSerializableAdminMutation<T>(mutation: (tx: Prisma.TransactionClient) => Promise<T>) {
    const prisma = getPrismaClient();

    for (let attempt = 1; attempt <= ADMIN_MUTATION_RETRIES; attempt += 1) {
        try {
            return await prisma.$transaction(mutation, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            });
        } catch (error) {
            if (!isSerializableConflict(error) || attempt === ADMIN_MUTATION_RETRIES) throw error;
        }
    }

    throw new Error('Mutation administrateur indisponible.');
}

async function getAdminMutationTarget(tx: Prisma.TransactionClient, id: string) {
    const target = await tx.user.findUnique({
        where: { id },
        select: { id: true, role: true },
    });
    if (!target) throw new Error('Utilisateur introuvable');
    return target;
}

function assertNotSelf(targetId: string, adminId: string) {
    if (targetId === adminId) {
        throw new Error('Tu ne peux pas neutraliser ton propre compte administrateur.');
    }
}

async function guardLastAdmin(tx: Prisma.TransactionClient, targetId: string, targetRole: UserRole) {
    if (targetRole !== UserRole.ADMIN) return;

    const adminCount = await tx.user.count({
        where: {
            id: { not: targetId },
            role: UserRole.ADMIN,
            deletedAt: null,
            suspendedAt: null,
        },
    });
    if (adminCount === 0) {
        throw new Error('Un autre administrateur actif est requis pour cette action.');
    }
}

async function buildEnrollmentRows(userId: string) {
    const prisma = getPrismaClient();
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        select: {
            id: true,
            programSlug: true,
            status: true,
            currentDay: true,
            updatedAt: true,
            startedAt: true,
            completedAt: true,
            program: {
                select: { title: true, card: true, hero: true, coverUrl: true, meta: true },
            },
            _count: {
                select: { dayStates: { where: { completed: true } } },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
    const programSlugs = [...new Set(enrollments.map((enrollment) => enrollment.programSlug))];
    const unitCounts = programSlugs.length
        ? await prisma.unit.groupBy({
              by: ['programSlug'],
              where: { programSlug: { in: programSlugs }, unitType: UnitType.DAY },
              _count: { _all: true },
          })
        : [];
    const unitCountByProgram = new Map(unitCounts.map((row) => [row.programSlug, row._count._all]));

    return enrollments.map((enrollment) => {
        const program = enrollment.program;
        const card = asRecord(program.card);
        const cardImage = asRecord(card.image);
        const hero = asRecord(program.hero);
        const heroImage = asRecord(hero.heroImage);
        const meta = asRecord(program.meta);
        const unitsCount = unitCountByProgram.get(enrollment.programSlug) ?? 0;
        const unitsDone = enrollment._count.dayStates;
        const progressPct = unitsCount > 0 ? Math.round((Math.min(unitsDone, unitsCount) / unitsCount) * 100) : 0;

        return {
            _id: enrollment.id,
            programTitle: program.title || enrollment.programSlug,
            programSlug: enrollment.programSlug,
            coverUrl: asString(cardImage.url) ?? asString(heroImage.url) ?? program.coverUrl ?? null,
            level: mapLevel(meta.level),
            status: mapEnrollmentStatus(enrollment.status),
            unitsCount,
            unitsDone: Math.min(unitsDone, unitsCount),
            progressPct: clampPct(progressPct),
            currentDay: typeof enrollment.currentDay === 'number' ? enrollment.currentDay : null,
            updatedAt: enrollment.updatedAt,
            startedAt: enrollment.startedAt,
            completedAt: enrollment.completedAt,
        };
    });
}

export type AdministrationApprenantsFilters = {
    q?: string;
    role?: 'all' | AdminRole;
    status?: 'all' | 'active' | 'archived' | 'suspended';
    sort?: 'recent' | 'alpha' | 'lastLogin' | 'progress';
    page?: number;
};

export const ADMINISTRATION_APPRENANTS_PAGE_SIZE = 24;

const adminLearnerListSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    avatarUrl: true,
    deletedAt: true,
    suspendedAt: true,
    lastLoginAt: true,
    enrollments: {
        select: {
            status: true,
            program: {
                select: {
                    _count: {
                        select: { units: { where: { unitType: UnitType.DAY } } },
                    },
                },
            },
            _count: {
                select: { dayStates: { where: { completed: true } } },
            },
            dayStates: {
                orderBy: { updatedAt: 'desc' as const },
                take: 1,
                select: { updatedAt: true },
            },
        },
    },
} satisfies Prisma.UserSelect;

type AdminLearnerListRecord = Prisma.UserGetPayload<{ select: typeof adminLearnerListSelect }>;

function buildAdminLearnerWhere(filters: AdministrationApprenantsFilters): Prisma.UserWhereInput {
    const q = filters.q?.trim();
    return {
        ...(q
            ? {
                  OR: [
                      { name: { contains: q, mode: 'insensitive' as const } },
                      { email: { contains: q, mode: 'insensitive' as const } },
                  ],
              }
            : {}),
        ...(filters.role && filters.role !== 'all'
            ? { role: filters.role === 'admin' ? UserRole.ADMIN : UserRole.USER }
            : {}),
        ...(filters.status === 'active'
            ? { deletedAt: null, suspendedAt: null }
            : filters.status === 'archived'
              ? { deletedAt: { not: null } }
              : filters.status === 'suspended'
                ? { suspendedAt: { not: null } }
                : {}),
    };
}

function buildAdminLearnerOrderBy(sort: AdministrationApprenantsFilters['sort']): Prisma.UserOrderByWithRelationInput[] {
    if (sort === 'alpha') {
        return [{ name: { sort: 'asc', nulls: 'last' } }, { email: 'asc' }, { id: 'asc' }];
    }
    if (sort === 'lastLogin') {
        return [{ lastLoginAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }, { id: 'asc' }];
    }
    return [{ createdAt: 'desc' }, { id: 'asc' }];
}

function buildAdminLearnerSqlConditions(filters: AdministrationApprenantsFilters) {
    const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];
    const q = filters.q?.trim().toLowerCase();
    if (q) {
        const pattern = `%${q}%`;
        conditions.push(Prisma.sql`(LOWER(COALESCE(u."name", '')) LIKE ${pattern} OR LOWER(u."email") LIKE ${pattern})`);
    }
    if (filters.role && filters.role !== 'all') {
        const role = filters.role === 'admin' ? UserRole.ADMIN : UserRole.USER;
        conditions.push(Prisma.sql`u."role" = CAST(${role} AS "UserRole")`);
    }
    if (filters.status === 'active') {
        conditions.push(Prisma.sql`u."deletedAt" IS NULL AND u."suspendedAt" IS NULL`);
    } else if (filters.status === 'archived') {
        conditions.push(Prisma.sql`u."deletedAt" IS NOT NULL`);
    } else if (filters.status === 'suspended') {
        conditions.push(Prisma.sql`u."suspendedAt" IS NOT NULL`);
    }
    return conditions;
}

async function getAdminLearnerIdsByProgress(filters: AdministrationApprenantsFilters, skip: number) {
    const prisma = getPrismaClient();
    const conditions = buildAdminLearnerSqlConditions(filters);
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT u."id"
        FROM "User" u
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY COALESCE((
            SELECT AVG(
                CASE
                    WHEN counts."unitsCount" > 0 THEN
                        LEAST(counts."unitsDone", counts."unitsCount") * 100.0 / counts."unitsCount"
                    ELSE 0
                END
            )
            FROM (
                SELECT
                    e."id",
                    (SELECT COUNT(*) FROM "Unit" un WHERE un."programSlug" = e."programSlug" AND un."unitType" = CAST(${UnitType.DAY} AS "UnitType")) AS "unitsCount",
                    (SELECT COUNT(*) FROM "DayState" ds WHERE ds."enrollmentId" = e."id" AND ds."completed" = TRUE) AS "unitsDone"
                FROM "Enrollment" e
                WHERE e."userId" = u."id"
            ) counts
        ), 0) DESC, u."createdAt" DESC, u."id" ASC
        LIMIT ${ADMINISTRATION_APPRENANTS_PAGE_SIZE}
        OFFSET ${skip}
    `);
    return rows.map((row) => row.id);
}

export async function getAdministrationApprenantsData(
    currentAdminEmail: string,
    filters: AdministrationApprenantsFilters = {},
) {
    const prisma = getPrismaClient();
    const where = buildAdminLearnerWhere(filters);
    const requestedPage = Math.max(1, Math.trunc(filters.page ?? 1));
    const [filteredTotal, total, admins, active, archived, suspended] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.ADMIN } }),
        prisma.user.count({ where: { deletedAt: null, suspendedAt: null } }),
        prisma.user.count({ where: { deletedAt: { not: null } } }),
        prisma.user.count({ where: { suspendedAt: { not: null } } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(filteredTotal / ADMINISTRATION_APPRENANTS_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const skip = (page - 1) * ADMINISTRATION_APPRENANTS_PAGE_SIZE;

    let raw: AdminLearnerListRecord[];
    if (filters.sort === 'progress') {
        const ids = await getAdminLearnerIdsByProgress(filters, skip);
        const usersById = await prisma.user.findMany({
            where: { id: { in: ids } },
            select: adminLearnerListSelect,
        });
        const positions = new Map(ids.map((id, index) => [id, index]));
        raw = usersById.sort((left, right) => (positions.get(left.id) ?? 0) - (positions.get(right.id) ?? 0));
    } else {
        raw = await prisma.user.findMany({
            where,
            select: adminLearnerListSelect,
            orderBy: buildAdminLearnerOrderBy(filters.sort),
            skip,
            take: ADMINISTRATION_APPRENANTS_PAGE_SIZE,
        });
    }

    const users = raw.map((user) => {
        const progressValues = user.enrollments.map((enrollment) => {
            const unitsCount = enrollment.program._count.units;
            const unitsDone = Math.min(enrollment._count.dayStates, unitsCount);
            return unitsCount > 0 ? Math.round((unitsDone / unitsCount) * 100) : 0;
        });
        const learningTimestamps = user.enrollments.flatMap((enrollment) => enrollment.dayStates.map((dayState) => dayState.updatedAt.getTime()));
        const lastLearningActivityAt = learningTimestamps.length
            ? new Date(Math.max(...learningTimestamps))
            : null;

        return {
            _id: user.id,
            name: user.name?.trim() || null,
            email: user.email,
            role: mapRole(user.role),
            createdAtIso: user.createdAt.toISOString(),
            avatarUrl: user.avatarUrl || null,
            isSelf: user.email === currentAdminEmail,
            isArchived: !!user.deletedAt,
            isSuspended: !!user.suspendedAt,
            lastLoginAtIso: user.lastLoginAt?.toISOString() ?? null,
            lastLearningActivityAtIso: lastLearningActivityAt?.toISOString() ?? null,
            enrollCount: user.enrollments.length,
            activePrograms: user.enrollments.filter((enrollment) => enrollment.status === EnrollmentStatus.ACTIVE).length,
            completedPrograms: user.enrollments.filter((enrollment) => enrollment.status === EnrollmentStatus.COMPLETED).length,
            averageProgressPct: progressValues.length
                ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
                : 0,
        };
    });

    return {
        users,
        stats: { total, admins, usersCount: total - admins, active, archived, suspended },
        pagination: {
            page,
            pageSize: ADMINISTRATION_APPRENANTS_PAGE_SIZE,
            total: filteredTotal,
            totalPages,
            from: filteredTotal === 0 ? 0 : skip + 1,
            to: Math.min(skip + users.length, filteredTotal),
        },
    };
}

export async function setAdminLearnerRole(formData: FormData) {
    const me = await requireAdmin();
    const id = getFormUserId(formData);
    const role = getFormRole(formData);
    if (!id) throw new Error('ID manquant.');

    await runSerializableAdminMutation(async (tx) => {
        const target = await getAdminMutationTarget(tx, id);
        if (target.id === me.id && role !== UserRole.ADMIN) {
            throw new Error("Tu ne peux pas te retirer l'admin toi-même.");
        }
        if (role !== UserRole.ADMIN) await guardLastAdmin(tx, target.id, target.role);

        await tx.user.update({ where: { id }, data: { role } });
    });
    return { id };
}

export const setAdminLearnerRoleLegacy = setAdminLearnerRole;

export async function setAdminLearnerLimits(formData: FormData) {
    await requireAdmin();

    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');

    const max = formData.get('maxConcurrentPrograms');
    const featuresCsv = String(formData.get('features') ?? '');
    const features = featuresCsv
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean);

    await getPrismaClient().user.update({
        where: { id },
        data: {
            maxConcurrentPrograms: max ? Number(max) : null,
            features,
        },
    });

    return { id };
}

export async function archiveAdminLearner(formData: FormData) {
    const me = await requireAdmin();
    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');

    await runSerializableAdminMutation(async (tx) => {
        const target = await getAdminMutationTarget(tx, id);
        assertNotSelf(target.id, me.id);
        await guardLastAdmin(tx, target.id, target.role);
        await tx.user.update({ where: { id }, data: { deletedAt: new Date() } });
    });
    return { id };
}

export async function restoreAdminLearner(formData: FormData) {
    await requireAdmin();
    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');

    await getPrismaClient().user.update({ where: { id }, data: { deletedAt: null } });
    return { id };
}

export async function suspendAdminLearner(formData: FormData) {
    const me = await requireAdmin();
    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');

    await runSerializableAdminMutation(async (tx) => {
        const target = await getAdminMutationTarget(tx, id);
        assertNotSelf(target.id, me.id);
        await guardLastAdmin(tx, target.id, target.role);
        await tx.user.update({ where: { id }, data: { suspendedAt: new Date() } });
    });
    return { id };
}

export async function unsuspendAdminLearner(formData: FormData) {
    await requireAdmin();
    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');

    await getPrismaClient().user.update({ where: { id }, data: { suspendedAt: null } });
    return { id };
}

export async function hardDeleteAdminLearner(formData: FormData) {
    const me = await requireAdmin();
    const id = getFormUserId(formData);
    if (!id) throw new Error('ID manquant.');
    if (String(formData.get('confirmation') ?? '') !== 'SUPPRIMER') {
        throw new Error('Confirmation requise.');
    }

    await runSerializableAdminMutation(async (tx) => {
        const target = await getAdminMutationTarget(tx, id);
        assertNotSelf(target.id, me.id);
        await guardLastAdmin(tx, target.id, target.role);
        await tx.dayState.deleteMany({ where: { userId: id } });
        await tx.baselineScore.deleteMany({ where: { enrollment: { userId: id } } });
        await tx.purchase.deleteMany({ where: { userId: id } });
        await tx.enrollment.deleteMany({ where: { userId: id } });
        await tx.passwordReset.deleteMany({ where: { userId: id } });
        await tx.consentLog.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
    });

    return { id };
}

export const hardDeleteAdminLearnerLegacy = hardDeleteAdminLearner;

export async function getAdministrationApprenantDetailData(id: string): Promise<AdminLearnerDetailData | null> {
    await requireAdmin();

    const prisma = getPrismaClient();
    const [user, enrolls, practicedDays, lastFromDays] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                theme: true,
                marketing: true,
                productUpdates: true,
                createdAt: true,
                lastLoginAt: true,
                passwordChangedAt: true,
                deletedAt: true,
                suspendedAt: true,
            },
        }),
        buildEnrollmentRows(id),
        prisma.dayState.count({ where: { userId: id, practiced: true } }),
        prisma.dayState.findFirst({
            where: { userId: id },
            select: { updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        }),
    ]);
    if (!user) return null;

    const avgPercent = enrolls.length ? Math.round(enrolls.reduce((sum, row) => sum + row.progressPct, 0) / enrolls.length) : 0;
    const totalUnitsDone = enrolls.reduce((sum, row) => sum + row.unitsDone, 0);
    const firstStartAt =
        enrolls
            .map((enrollment) => enrollment.startedAt)
            .filter(Boolean)
            .sort((a, b) => a!.getTime() - b!.getTime())[0] ?? null;
    const lastLearningActivityAt = lastFromDays?.updatedAt ?? null;
    const daysSinceFirst = firstStartAt ? Math.max(1, Math.ceil((Date.now() - firstStartAt.getTime()) / 86400000)) : 0;
    const dailyPace = daysSinceFirst > 0 ? totalUnitsDone / daysSinceFirst : 0;
    const statusCounts = enrolls.reduce(
        (acc, enrollment) => {
            acc[enrollment.status]++;
            return acc;
        },
        { active: 0, completed: 0, paused: 0, canceled: 0 } as { active: number; completed: number; paused: number; canceled: number }
    );

    return {
        user: {
            _id: user.id,
            name: user.name ?? null,
            email: user.email,
            role: mapRole(user.role),
            avatarUrl: user.avatarUrl ?? null,
            theme: mapTheme(user.theme),
            marketing: user.marketing,
            productUpdates: user.productUpdates,
            createdAt: user.createdAt ?? null,
            lastLoginAt: user.lastLoginAt ?? null,
            passwordChangedAt: user.passwordChangedAt ?? null,
            deletedAt: user.deletedAt ?? null,
            suspendedAt: user.suspendedAt ?? null,
        },
        enrollsClient: enrolls.map((enrollment) => ({
            _id: enrollment._id,
            programTitle: enrollment.programTitle,
            programSlug: enrollment.programSlug,
            coverUrl: enrollment.coverUrl ?? null,
            level: enrollment.level ?? null,
            status: enrollment.status,
            unitsCount: enrollment.unitsCount,
            unitsDone: enrollment.unitsDone,
            progressPct: enrollment.progressPct,
            currentDay: typeof enrollment.currentDay === 'number' ? enrollment.currentDay : null,
            updatedAt: enrollment.updatedAt ?? null,
        })),
        stats: {
            enrollCount: enrolls.length,
            avgPercent,
            totalUnitsDone,
            practicedDays,
            firstStartAt,
            dailyPace: Number(dailyPace.toFixed(3)),
            status: statusCounts,
        },
        lastLearningActivityAt,
    };
}

export async function getAdminLearnerLegacyUserDetail(formData: FormData): Promise<AdminLegacyUiUserDetail> {
    const me = await requireAdmin();
    const userId = getFormUserId(formData);
    if (!userId) throw new Error('userId requis');

    const user = await getPrismaClient().user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            avatarUrl: true,
            theme: true,
            marketing: true,
            productUpdates: true,
            passwordChangedAt: true,
            deletedAt: true,
            suspendedAt: true,
            maxConcurrentPrograms: true,
            features: true,
        },
    });
    if (!user) throw new Error('Utilisateur introuvable');

    const enrolls = await buildEnrollmentRows(user.id);
    const enrollments: AdminLegacyUiEnrollment[] = enrolls.map((enrollment) => ({
        _id: enrollment._id,
        programSlug: enrollment.programSlug,
        programTitle: enrollment.programTitle,
        coverUrl: enrollment.coverUrl ?? null,
        level: enrollment.level ?? null,
        status: enrollment.status,
        startedAtIso: enrollment.startedAt ? enrollment.startedAt.toISOString() : null,
        updatedAtIso: enrollment.updatedAt ? enrollment.updatedAt.toISOString() : null,
        progressPct: enrollment.progressPct,
        currentDay: enrollment.currentDay ?? null,
        unitsCount: enrollment.unitsCount,
        finishedAtIso: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
    }));

    return {
        _id: user.id,
        name: user.name?.trim() || null,
        email: user.email,
        role: mapRole(user.role),
        createdAtIso: user.createdAt ? user.createdAt.toISOString() : new Date(0).toISOString(),
        avatarUrl: user.avatarUrl || null,
        theme: mapTheme(user.theme),
        marketing: !!user.marketing,
        productUpdates: !!user.productUpdates,
        passwordChangedAtIso: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : null,
        enrollments,
        isArchived: !!user.deletedAt,
        isSuspended: !!user.suspendedAt,
        limits: {
            maxConcurrentPrograms: user.maxConcurrentPrograms ?? null,
            features: user.features ?? [],
        },
        isSelf: user.email === me.email,
    };
}
