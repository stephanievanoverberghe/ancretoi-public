import 'server-only';

import { EnrollmentStatus } from '@/generated/prisma/client';
import { requireUser } from '@/server/auth/authz';
import {
    deleteDayStateForEnrollmentDay,
    deleteDayStatesForEnrollment,
    findCompletedDayIndices,
    findEnrollmentProgressRecord,
    findLearnerProgramSummaryData,
    findLearnerUserIdByEmail,
    findPublishedDayUnitHeadings,
    findUserEnrollmentActivityDates,
    markIntroEngaged,
    pauseEnrollment,
    saveLearnerDayStateAndSyncProgress,
    setEnrollmentActiveDay,
    updateEnrollmentSetDay,
    upsertLearnerDayStateRecord,
} from './apprentissage.repository';

type DayStatePatch = {
    data?: Record<string, string>;
    practiced?: boolean;
    completed?: boolean;
};

function toResponseStatus(status: EnrollmentStatus) {
    if (status === EnrollmentStatus.COMPLETED) return 'completed' as const;
    if (status === EnrollmentStatus.PAUSED) return 'paused' as const;
    return 'active' as const;
}

function normalizeCoverUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/')) return value;
    return `/${value.replace(/^public\//, '')}`;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringRecord(value: unknown): Record<string, string> {
    return Object.fromEntries(
        Object.entries(asRecord(value)).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
    );
}

function toDayStateConflict(current: {
    data: unknown;
    practiced: boolean;
    completed: boolean;
    updatedAt: Date;
} | null) {
    return {
        ok: false as const,
        error: 'STALE_STATE' as const,
        status: 409,
        current: current
            ? {
                data: asStringRecord(current.data),
                practiced: current.practiced,
                completed: current.completed,
                version: current.updatedAt.toISOString(),
            }
            : null,
    };
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function ymdUTC(d: Date) {
    return d.toISOString().slice(0, 10);
}

async function getCurrentPrismaUser(nextPath = '/espace/formations') {
    const user = await requireUser(nextPath);
    return findLearnerUserIdByEmail(user.email);
}

function getProgressFromCompletedDays(publishedDays: number[], completedDays: number[]) {
    const publishedSet = new Set(publishedDays);
    const completedSet = new Set(completedDays.filter((day) => publishedSet.has(day)));
    const nextDay = publishedDays.find((day) => !completedSet.has(day)) ?? null;
    const allCompleted = publishedDays.length > 0 && nextDay === null;

    return {
        completedSet,
        completedCount: completedSet.size,
        nextDay,
        allCompleted,
        currentDay: allCompleted
            ? (publishedDays.at(-1) ?? 1)
            : (nextDay ?? publishedDays[0] ?? 1),
    };
}

export async function upsertLearnerDayState(input: {
    slug: string;
    day: number;
    patch: DayStatePatch;
    expectedVersion: string | null;
}) {
    const userDoc = await getCurrentPrismaUser();

    if (!userDoc || userDoc.deletedAt) {
        return { ok: false as const, error: 'USER_NOT_FOUND' as const, status: 401 };
    }

    const programSlug = input.slug.toLowerCase();
    const publishedUnits = await findPublishedDayUnitHeadings(programSlug);
    const publishedDays = publishedUnits.map((unit) => unit.unitIndex);
    if (!publishedDays.includes(input.day)) {
        return { ok: false as const, error: 'DAY_NOT_PUBLISHED' as const, status: 400 };
    }

    const enrollment = await findEnrollmentProgressRecord(userDoc.id, programSlug);
    if (!enrollment) {
        return { ok: false as const, error: 'PROGRAM_ACCESS_REQUIRED' as const, status: 403 };
    }
    if (enrollment.status === EnrollmentStatus.CANCELED) {
        return { ok: false as const, error: 'ENROLLMENT_CANCELED' as const, status: 403 };
    }

    if (typeof input.patch.completed === 'boolean') {
        const result = await saveLearnerDayStateAndSyncProgress({
            enrollmentId: enrollment.id,
            userId: userDoc.id,
            programSlug,
            day: input.day,
            publishedDays,
            data: input.patch.data,
            practiced: input.patch.practiced,
            completed: input.patch.completed,
            expectedVersion: input.expectedVersion,
        });

        if (!result.ok) {
            if (result.error === 'STALE_STATE') return toDayStateConflict(result.current);
            return {
                ok: false as const,
                error: result.error,
                requirements: result.requirements,
                status: 400,
            };
        }

        return {
            ok: true as const,
            id: result.id,
            version: result.version,
            currentDay: result.currentDay,
            completedCount: result.completedCount,
            status: toResponseStatus(result.status),
        };
    }

    const doc = await upsertLearnerDayStateRecord({
        enrollmentId: enrollment.id,
        userId: userDoc.id,
        programSlug,
        day: input.day,
        data: input.patch.data,
        practiced: input.patch.practiced,
        completed: input.patch.completed,
        expectedVersion: input.expectedVersion,
    });

    if (!doc.ok) return toDayStateConflict(doc.current);
    return { ok: true as const, id: doc.id, version: doc.version };
}

export async function deleteLearnerDayState(input: { slug: string; all: boolean; day?: number }) {
    if (!input.slug) {
        return { ok: false as const, error: 'MISSING_SLUG' as const, status: 400 };
    }

    const userDoc = await getCurrentPrismaUser();

    if (!userDoc || userDoc.deletedAt) {
        return { ok: false as const, error: 'USER_NOT_FOUND' as const, status: 401 };
    }

    const programSlug = input.slug.toLowerCase();
    const enrollment = await findEnrollmentProgressRecord(userDoc.id, programSlug);
    if (!enrollment) {
        return { ok: false as const, error: 'PROGRAM_ACCESS_REQUIRED' as const, status: 403 };
    }
    if (enrollment.status === EnrollmentStatus.CANCELED) {
        return { ok: false as const, error: 'ENROLLMENT_CANCELED' as const, status: 403 };
    }

    if (input.all) {
        const res = await deleteDayStatesForEnrollment(enrollment.id);
        await setEnrollmentActiveDay(enrollment.id, 1);
        return {
            ok: true as const,
            scope: 'all' as const,
            deleted: res.count,
            currentDay: 1,
            status: 'active' as const,
        };
    }

    const day = input.day ?? 0;
    if (!Number.isFinite(day) || day < 1) {
        return { ok: false as const, error: 'INVALID_DAY' as const, status: 400 };
    }

    const res = await deleteDayStateForEnrollmentDay(enrollment.id, day);
    await setEnrollmentActiveDay(enrollment.id, day);

    return {
        ok: true as const,
        scope: 'one' as const,
        day,
        deleted: res.count,
        currentDay: day,
        status: 'active' as const,
    };
}

export async function updateLearnerIntro(input: { slug: string; engaged: boolean }) {
    const userDoc = await getCurrentPrismaUser();

    if (!userDoc || userDoc.deletedAt) {
        return { ok: false as const, error: 'USER_NOT_FOUND' as const, status: 401 };
    }

    const programSlug = input.slug.toLowerCase();
    const publishedUnits = await findPublishedDayUnitHeadings(programSlug);
    const publishedDays = publishedUnits.map((unit) => unit.unitIndex);
    const lastPublished = publishedDays.at(-1) ?? 0;
    const enrollment = await findEnrollmentProgressRecord(userDoc.id, programSlug);

    if (!enrollment) {
        return { ok: false as const, error: 'PROGRAM_ACCESS_REQUIRED' as const, status: 403 };
    }

    if (!input.engaged) {
        if (enrollment.status === EnrollmentStatus.CANCELED) {
            return { ok: false as const, error: 'ENROLLMENT_CANCELED' as const, status: 403 };
        }
        if (enrollment.status === EnrollmentStatus.COMPLETED) {
            return {
                ok: true as const,
                engaged: true,
                lastPublished,
                paused: false as const,
                status: 'completed' as const,
            };
        }

        await pauseEnrollment(enrollment.id);

        return {
            ok: true as const,
            engaged: false,
            lastPublished,
            paused: true as const,
            status: 'paused' as const,
        };
    }

    if (enrollment.status === EnrollmentStatus.CANCELED) {
        return { ok: false as const, error: 'ENROLLMENT_CANCELED' as const, status: 403 };
    }
    if (publishedDays.length === 0) {
        return { ok: false as const, error: 'NO_PUBLISHED_DAYS' as const, status: 409 };
    }
    const completedRows = await findCompletedDayIndices(enrollment.id);
    const progress = getProgressFromCompletedDays(
        publishedDays,
        completedRows.map((row) => row.dayIndex),
    );
    const status = progress.allCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;
    await markIntroEngaged({
        userId: userDoc.id,
        programSlug,
        currentDay: progress.currentDay,
        status,
        startedAtMissing: !enrollment.startedAt,
    });

    return {
        ok: true as const,
        engaged: true,
        lastPublished,
        paused: false as const,
        currentDay: progress.currentDay,
        status: toResponseStatus(status),
    };
}

export async function updateLearnerProgress(input: { slug: string; action: 'setDay' | 'completeDay' | 'reopenDay'; day?: number }) {
    const userDoc = await getCurrentPrismaUser();

    if (!userDoc || userDoc.deletedAt) {
        return { ok: false as const, error: 'USER_NOT_FOUND' as const, status: 401 };
    }

    const programSlug = input.slug.toLowerCase();
    const publishedUnits = await findPublishedDayUnitHeadings(programSlug);
    const publishedDays = publishedUnits.map((unit) => unit.unitIndex);
    const lastPublished = publishedDays.at(-1) ?? 0;
    if (publishedDays.length === 0) {
        return { ok: false as const, error: 'NO_PUBLISHED_UNITS' as const, status: 400 };
    }

    const enrollment = await findEnrollmentProgressRecord(userDoc.id, programSlug);
    if (!enrollment) {
        return { ok: false as const, error: 'PROGRAM_ACCESS_REQUIRED' as const, status: 403 };
    }
    if (enrollment.status === EnrollmentStatus.CANCELED) {
        return { ok: false as const, error: 'ENROLLMENT_CANCELED' as const, status: 403 };
    }
    const completedRows = await findCompletedDayIndices(enrollment.id);
    const progress = getProgressFromCompletedDays(
        publishedDays,
        completedRows.map((row) => row.dayIndex),
    );

    if (input.action === 'setDay') {
        const requested = input.day ?? progress.currentDay;
        const requestedPublished = publishedDays.includes(requested) ? requested : progress.currentDay;
        const target = progress.allCompleted
            ? requestedPublished
            : Math.min(requestedPublished, progress.currentDay);
        const status = progress.allCompleted
            ? EnrollmentStatus.COMPLETED
            : EnrollmentStatus.ACTIVE;

        await updateEnrollmentSetDay({ enrollmentId: enrollment.id, currentDay: target, status, startedAtMissing: !enrollment.startedAt });

        return {
            ok: true as const,
            currentDay: target,
            completedCount: progress.completedCount,
            lastPublished,
            status: toResponseStatus(status),
        };
    }

    if (input.action === 'completeDay') {
        const doneDay = input.day ?? progress.currentDay;
        if (!publishedDays.includes(doneDay)) {
            return { ok: false as const, error: 'DAY_NOT_PUBLISHED' as const, status: 400 };
        }
        const result = await saveLearnerDayStateAndSyncProgress({
            enrollmentId: enrollment.id,
            userId: userDoc.id,
            programSlug,
            day: doneDay,
            publishedDays,
            completed: true,
        });
        if (!result.ok) {
            if (result.error === 'STALE_STATE') return toDayStateConflict(result.current);
            return {
                ok: false as const,
                error: result.error,
                requirements: result.requirements,
                status: 400,
            };
        }

        return {
            ok: true as const,
            currentDay: result.currentDay,
            completedCount: result.completedCount,
            lastPublished,
            status: toResponseStatus(result.status),
        };
    }

    if (input.action === 'reopenDay') {
        const computed = progress.currentDay;
        const status = progress.allCompleted
            ? EnrollmentStatus.COMPLETED
            : EnrollmentStatus.ACTIVE;

        await updateEnrollmentSetDay({
            enrollmentId: enrollment.id,
            currentDay: computed,
            status,
            startedAtMissing: !enrollment.startedAt,
        });

        return {
            ok: true as const,
            currentDay: computed,
            completedCount: progress.completedCount,
            lastPublished,
            status: toResponseStatus(status),
            toIntro: progress.completedCount === 0 && !enrollment.startedAt,
        };
    }

    return { ok: false as const, error: 'UNKNOWN_ACTION' as const, status: 400 };
}

export async function getLearnerProgramSummary(slug: string) {
    if (!slug) return { ok: false as const, error: 'SLUG_MISSING' as const, status: 400 };

    const userDoc = await getCurrentPrismaUser(`/espace/formations/${slug}`);
    if (!userDoc || userDoc.deletedAt) return { ok: false as const, error: 'UNAUTH' as const, status: 401 };

    const { enrollment, total, publishedDays, program } = await findLearnerProgramSummaryData(userDoc.id, slug);

    if (!enrollment) return { ok: false as const, error: 'NOT_ENROLLED' as const, status: 403 };
    if (!program || program.deletedAt) return { ok: false as const, error: 'PROGRAM_NOT_FOUND' as const, status: 404 };

    const progress = getProgressFromCompletedDays(
        publishedDays,
        enrollment.dayStates.map((state) => state.dayIndex),
    );
    const currentDay = progress.currentDay;
    const done = progress.completedCount;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const hero = asRecord(program.hero);
    const heroCover = asRecord(hero.cover);
    const card = asRecord(program.card);
    const cardImage = asRecord(card.image);
    const meta = asRecord(program.meta);
    const rawCoverUrl = asString(heroCover.url) ?? asString(cardImage.url);
    const coverUrl = normalizeCoverUrl(rawCoverUrl);
    const coverAlt = asString(heroCover.alt) ?? asString(cardImage.alt) ?? '';

    return {
        ok: true as const,
        programSlug: slug,
        title: asString(hero.title) ?? program.title ?? slug,
        subtitle: asString(hero.subtitle),
        coverUrl,
        coverAlt,
        total,
        currentDay,
        done,
        percent,
        status: progress.allCompleted
            ? 'completed'
            : toResponseStatus(enrollment.status),
        level: asString(meta.level),
        durationDays: asNumber(meta.durationDays) ?? program.durationDays,
        dailyLoadLabel: asString(meta.dailyLoadLabel),
    };
}

export async function getLearnerProgramPlan(input: { slug: string; limit: number }) {
    if (!input.slug) return { ok: false, error: 'SLUG_MISSING', days: [], status: 400 };

    const userDoc = await getCurrentPrismaUser(`/espace/formations/${input.slug}`);
    if (!userDoc || userDoc.deletedAt) return { ok: false, error: 'UNAUTH', days: [], status: 401 };

    const units = await findPublishedDayUnitHeadings(input.slug, { take: input.limit });

    return { ok: true, days: units.map((unit) => ({ index: unit.unitIndex, title: unit.title || null })) };
}

export async function getUserStreakData(input: { email: string; daysParam: number }) {
    const user = await findLearnerUserIdByEmail(input.email);

    if (!user || user.deletedAt) {
        return { ok: false as const, error: 'Not found' as const, status: 404 };
    }

    const days = Math.max(14, Math.min(365, Number.isFinite(input.daysParam) ? input.daysParam : 180));
    const today = new Date();
    const from = new Date(today);
    from.setUTCDate(today.getUTCDate() - (days - 1));

    const enrollments = await findUserEnrollmentActivityDates(user.id);

    const activeDays = new Set<string>();

    for (const enrollment of enrollments) {
        for (const date of [enrollment.createdAt, enrollment.updatedAt, enrollment.completedAt]) {
            if (date && date >= from && date <= today) activeDays.add(ymdUTC(date));
        }
    }

    const rows: { dateISO: string; active: boolean }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(today.getUTCDate() - i);
        const key = ymdUTC(d);
        rows.push({ dateISO: key, active: activeDays.has(key) });
    }

    let streak = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].active) streak++;
        else break;
    }

    const totalActive = rows.reduce((sum, row) => sum + (row.active ? 1 : 0), 0);

    return { ok: true as const, days, rows, streak, totalActive };
}
