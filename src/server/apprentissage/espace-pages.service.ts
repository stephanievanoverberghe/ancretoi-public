import 'server-only';

import { createHash } from 'node:crypto';

import { EnrollmentStatus } from '@/generated/prisma/client';
import { espaceRoutes, reset7Routes, routeBuilders } from '@/config/routes';
import { getSession } from '@/server/auth/session';
import {
    findPublishedDayIndicesByProgramSlugs,
    findCourseLayoutRecords,
    findEnrollmentForFormationDay,
    findFormationDayState,
    findFormationOverviewRecords,
    findLearnerDashboardUserByEmail,
    findLearnerUserByEmail,
    findLearnerUserIdByEmail,
    findPublishedDayUnitContentRecords,
    findPublishedDayUnitLayoutRecords,
} from './apprentissage.repository';

type JsonRecord = Record<string, unknown>;

type SessionUser = {
    email: string;
    name?: string | null;
};

export type EspaceDashboardDataRow = {
    programSlug: string;
    title: string;
    coverUrl: string | null;
    coverAlt: string | null;
    level: 'Basique' | 'Cible' | 'Premium' | null;
    unitsTotal: number;
    unitsDone: number;
    percent: number;
    currentDay: number;
    status: 'active' | 'completed' | 'paused';
    resumeHref: string;
    lastUpdatedAt: string | null;
};

export type CourseLayoutItem = {
    key: string;
    label: string;
    href: string;
    state: 'done' | 'active' | 'locked';
    sub?: string;
    locked: boolean;
};

export type LearnerFormField = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'slider' | 'select' | 'boolean';
    required: boolean;
    min?: number;
    max?: number;
    options?: string[];
    groupTitle?: string;
};

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function humanizeSlug(slug: string): string {
    if (/^[a-z]+-\d+$/i.test(slug)) return slug.toUpperCase();
    return slug
        .split('-')
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

function getDisplayName(userEmail: string, sessionName?: string | null, dbName?: string | null) {
    const raw = (sessionName ?? dbName ?? '').trim();
    if (raw) return raw.split(' ')[0];
    const local = (userEmail.split('@')[0] ?? '').trim();
    if (!local) return 'toi';
    return local.charAt(0).toUpperCase() + local.slice(1);
}

function mapEnrollmentStatus(status: EnrollmentStatus): EspaceDashboardDataRow['status'] {
    if (status === EnrollmentStatus.PAUSED) return 'paused';
    return 'active';
}

function pad(n: number) {
    return String(n).padStart(2, '0');
}

export function getProgrammeResumeHref(input: {
    programSlug: string;
    currentDay: number;
    unitsDone: number;
    unitsTotal: number;
    status: EspaceDashboardDataRow['status'];
}) {
    if (input.status === 'completed') {
        return input.programSlug === reset7Routes.programmeSlug && input.unitsTotal > 0
            ? espaceRoutes.bilan
            : routeBuilders.formation(input.programSlug);
    }
    if (input.status === 'paused' || input.unitsDone === 0) {
        return routeBuilders.formation(input.programSlug);
    }

    return routeBuilders.formationJour(input.programSlug, input.currentDay);
}

function asStringRecord(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
}

function toLearnerFormField(
    value: unknown,
    fallbackKey: string,
    groupTitle?: string,
): LearnerFormField | null {
    const field = asRecord(value);
    const key = asString(field.key) ?? fallbackKey;
    const label = asString(field.label) ?? asString(field.title);
    if (!key || !label) return null;

    const rawType = asString(field.type);
    const type: LearnerFormField['type'] =
        rawType === 'textarea' ||
        rawType === 'slider' ||
        rawType === 'select' ||
        rawType === 'boolean'
            ? rawType
            : 'text';
    const rawOptions = Array.isArray(field.options)
        ? field.options.filter((option): option is string => typeof option === 'string')
        : undefined;

    return {
        key,
        label,
        type,
        required: field.required === true,
        min: asNumber(field.min) ?? undefined,
        max: asNumber(field.max) ?? undefined,
        options: rawOptions?.length ? rawOptions : undefined,
        groupTitle,
    };
}

function getJournalFields(value: unknown): LearnerFormField[] {
    const schema = asRecord(value);
    const exercises = Array.isArray(schema.exercises) ? schema.exercises : [];
    const fields: LearnerFormField[] = [];

    for (const rawExercise of exercises) {
        const exercise = asRecord(rawExercise);
        const groupTitle = asString(exercise.title) ?? undefined;
        const exerciseFields = Array.isArray(exercise.fields) ? exercise.fields : [];

        for (const [index, rawField] of exerciseFields.entries()) {
            const field = toLearnerFormField(
                rawField,
                `${asString(exercise.key) ?? 'journal'}-${index + 1}`,
                groupTitle,
            );
            if (field) fields.push(field);
        }
    }

    return fields;
}

function getValidationFields(value: unknown): LearnerFormField[] {
    const schema = asRecord(value);
    const candidates = Array.isArray(schema.fields)
        ? schema.fields.map((field, index) => [String(index + 1), field] as const)
        : Object.entries(schema);

    return candidates
        .map(([key, field]) => toLearnerFormField(field, key))
        .filter((field): field is LearnerFormField => field !== null);
}

function getContentParagraphs(contentParagraphs: string[], content: unknown) {
    if (contentParagraphs.length > 0) return contentParagraphs;

    const record = asRecord(content);
    const objectives = Array.isArray(record.objectives)
        ? record.objectives.filter((value): value is string => typeof value === 'string')
        : [];
    const outcomes = Array.isArray(record.outcomes)
        ? record.outcomes.filter((value): value is string => typeof value === 'string')
        : [];

    return [...objectives, ...outcomes];
}

export async function getEspaceDashboardData(user: SessionUser) {
    const userDoc = await findLearnerDashboardUserByEmail(user.email);

    if (!userDoc || userDoc.deletedAt) return null;

    const displayName = getDisplayName(user.email, user.name, userDoc.name);
    const publishedDaysBySlug = await findPublishedDayIndicesByProgramSlugs(
        userDoc.enrollments.map((enrollment) => enrollment.programSlug),
    );

    const rows: EspaceDashboardDataRow[] = userDoc.enrollments.map((enrollment) => {
        const program = enrollment.program;
        const hero = asRecord(program.hero);
        const card = asRecord(program.card);
        const cardImage = asRecord(card.image);
        const meta = asRecord(program.meta);
        const publishedDays = publishedDaysBySlug.get(enrollment.programSlug) ?? [];
        const publishedSet = new Set(publishedDays);
        const total = publishedDays.length;
        const completedSet = new Set(
            enrollment.dayStates
                .map((state) => state.dayIndex)
                .filter((day) => publishedSet.has(day)),
        );
        const done = completedSet.size;
        const currentDay =
            publishedDays.find((day) => !completedSet.has(day)) ??
            publishedDays.at(-1) ??
            1;
        const percent = total ? Math.round((done / total) * 100) : 0;
        const status: EspaceDashboardDataRow['status'] =
            total > 0 && done === total
                ? 'completed'
                : mapEnrollmentStatus(enrollment.status);

        return {
            programSlug: enrollment.programSlug,
            title: asString(hero.title) ?? program.title ?? 'Sans titre',
            coverUrl: asString(cardImage.url) ?? program.coverUrl ?? null,
            coverAlt: asString(cardImage.alt),
            level: (asString(meta.level) ?? null) as EspaceDashboardDataRow['level'],
            unitsTotal: total,
            unitsDone: done,
            percent,
            currentDay,
            status,
            resumeHref: getProgrammeResumeHref({
                programSlug: enrollment.programSlug,
                currentDay,
                unitsDone: done,
                unitsTotal: total,
                status,
            }),
            lastUpdatedAt: enrollment.updatedAt ? enrollment.updatedAt.toISOString() : null,
        };
    });

    return { displayName, rows };
}

export type LearnerResume = {
    programSlug: string;
    title: string;
    coverUrl: string | null;
    percent: number;
    currentDay: number;
    unitsDone: number;
    unitsTotal: number;
    status: 'active' | 'completed' | 'paused';
    resumeHref: string;
};

export type HomeLearnerResume = LearnerResume & { displayName: string };

/** Sélectionne le parcours à reprendre : nouvel achat, puis en cours, puis le plus récent. */
function pickResumeRow(rows: EspaceDashboardDataRow[]): EspaceDashboardDataRow | null {
    const mostRecent = (candidates: EspaceDashboardDataRow[]) =>
        [...candidates].sort((a, b) =>
            (b.lastUpdatedAt ?? '').localeCompare(a.lastUpdatedAt ?? ''),
        )[0] ?? null;

    return (
        mostRecent(rows.filter((row) => row.status === 'active')) ??
        mostRecent(rows.filter((row) => row.status === 'paused')) ??
        mostRecent(rows.filter((row) => row.status === 'completed')) ??
        null
    );
}

function toLearnerResume(row: EspaceDashboardDataRow): LearnerResume {
    return {
        programSlug: row.programSlug,
        title: row.title,
        coverUrl: row.coverUrl,
        percent: row.percent,
        currentDay: row.currentDay,
        unitsDone: row.unitsDone,
        unitsTotal: row.unitsTotal,
        status: row.status,
        resumeHref: row.resumeHref,
    };
}

/**
 * Parcours à reprendre pour le châssis de l'espace (widget de progression).
 */
export async function getLearnerResume(user: SessionUser): Promise<LearnerResume | null> {
    const data = await getEspaceDashboardData(user);
    if (!data || data.rows.length === 0) return null;

    const resume = pickResumeRow(data.rows);
    return resume ? toLearnerResume(resume) : null;
}

/**
 * Parcours à reprendre pour les surfaces publiques (hero de l'accueil) :
 * lit la session lui-même et renvoie null pour un visiteur non connecté ou
 * sans formation.
 */
export async function getHomeLearnerResume(): Promise<HomeLearnerResume | null> {
    const sess = await getSession();
    if (!sess?.email) return null;

    const data = await getEspaceDashboardData({ email: sess.email });
    if (!data || data.rows.length === 0) return null;

    const resume = pickResumeRow(data.rows);
    return resume ? { ...toLearnerResume(resume), displayName: data.displayName } : null;
}

export async function getLearnerUserIdByEmail(email: string) {
    const userDoc = await findLearnerUserIdByEmail(email);

    return userDoc && !userDoc.deletedAt ? userDoc.id : null;
}

export async function getCourseLayoutData(input: { safeSlug: string; user: SessionUser }) {
    const userDoc = await findLearnerUserByEmail(input.user.email);
    const userId = userDoc && !userDoc.deletedAt ? userDoc.id : '';

    const { enrollment, units, states } = userId
        ? await findCourseLayoutRecords(userId, input.safeSlug)
        : { enrollment: null, units: await findPublishedDayUnitLayoutRecords(input.safeSlug), states: [] };

    const total = units.length;
    const lastPublished = total > 0 ? units[total - 1].unitIndex : 0;
    const publishedDays = units.map((unit) => unit.unitIndex);
    const started = !!enrollment?.introEngaged;
    const isPaused = enrollment?.status === EnrollmentStatus.PAUSED;

    const completedSet = new Set<number>();
    for (const state of states) if (state.completed) completedSet.add(state.dayIndex);

    const doneCount = publishedDays.filter((day) => completedSet.has(day)).length;
    const isCompleted = total > 0 && doneCount === total;
    const currentDay =
        publishedDays.find((day) => !completedSet.has(day)) ??
        Math.max(1, lastPublished);
    const percent = total ? Math.round((doneCount / total) * 100) : 0;

    const items: CourseLayoutItem[] = [
        {
            key: 'intro',
            label: 'Introduction',
            href: routeBuilders.formation(input.safeSlug),
            state: started ? 'done' : 'active',
            sub: undefined,
            locked: false,
        },
        ...units.map((unit) => {
            const day = unit.unitIndex;
            let state: CourseLayoutItem['state'] = 'locked';

            if (!started) {
                state = 'locked';
            } else if (completedSet.has(day)) {
                state = 'done';
            } else if (!isCompleted && !isPaused && day === currentDay) {
                state = 'active';
            } else {
                state = 'locked';
            }

            const locked = state === 'locked';
            return {
                key: `day-${day}`,
                label: `Jour ${pad(day)} — ${unit.title ?? ''}`,
                href: routeBuilders.formationJour(input.safeSlug, day),
                state,
                sub: unit.mantra || undefined,
                locked,
            };
        }),
        {
            key: 'conclusion',
            label: 'Conclusion & Bilan',
            href: espaceRoutes.bilan,
            state: isCompleted ? 'active' : 'locked',
            sub: isCompleted ? 'Exports & suites' : undefined,
            locked: !isCompleted,
        },
    ];

    const displayName = input.user.name ?? userDoc?.name ?? '';
    const firstName = displayName ? displayName.split(' ')[0] : 'toi';
    const primaryHref = isCompleted
        ? espaceRoutes.bilan
        : isPaused || !started
          ? routeBuilders.formation(input.safeSlug)
          : routeBuilders.formationJour(input.safeSlug, currentDay);
    const primaryLabel = isCompleted
        ? 'Terminé'
        : isPaused
          ? 'Reprendre'
          : started
            ? 'Continuer'
            : 'Commencer';

    return {
        items,
        percent,
        total,
        doneCount,
        isCompleted,
        firstName,
        programName: humanizeSlug(input.safeSlug),
        primaryHref,
        primaryLabel,
    };
}

export async function getFormationOverviewData(input: { safeSlug: string; user: SessionUser }) {
    const userDoc = await findLearnerUserByEmail(input.user.email);
    if (!userDoc || userDoc.deletedAt) return null;

    const { program, units, enrollment, progressCount } = await findFormationOverviewRecords(userDoc.id, input.safeSlug);

    if (!program || program.deletedAt) return null;

    const hero = asRecord(program.hero);
    const meta = asRecord(program.meta);
    const totalDays = units.length;
    const minutesPerDay = asNumber(meta.estMinutesPerDay) ?? program.estMinutesPerDay ?? 20;
    const minutesPerDaySafe = Math.max(1, minutesPerDay);
    const displayName = input.user.name ?? userDoc.name ?? '';
    const publishedSet = new Set(units.map((unit) => unit.unitIndex));
    const completedSet = new Set(
        (enrollment?.dayStates.map((state) => state.dayIndex) ?? []).filter((day) =>
            publishedSet.has(day),
        ),
    );
    const isCompleted = totalDays > 0 && completedSet.size === totalDays;
    const resumeDay =
        units.find((unit) => !completedSet.has(unit.unitIndex))?.unitIndex ??
        units.at(-1)?.unitIndex ??
        1;
    const isPaused = enrollment?.status === EnrollmentStatus.PAUSED;

    return {
        safeSlug: input.safeSlug,
        programName: humanizeSlug(input.safeSlug),
        title: asString(hero.title) || 'Introduction',
        subtitle: asString(hero.subtitle) || 'Bienvenue. Voici les repÃ¨res essentiels pour dÃ©marrer en douceur et en conscience.',
        totalDays,
        minutesPerDaySafe,
        level: asString(meta.level) ?? 'Basique',
        initialEngaged: !!enrollment?.introEngaged && !isPaused,
        hasProgress: progressCount > 0,
        hasPublishedDays: totalDays > 0,
        isCompleted,
        resumeDay,
        isPaused,
        learnerName: displayName ? displayName.split(' ')[0] : '',
    };
}

export async function getFormationDayData(input: { safeSlug: string; requestedDay: number; userEmail: string }) {
    const userDoc = await findLearnerUserIdByEmail(input.userEmail);
    if (!userDoc || userDoc.deletedAt) return { status: 'not_found' as const };

    const units = await findPublishedDayUnitContentRecords(input.safeSlug);

    if (units.length === 0) return { status: 'redirect' as const, href: routeBuilders.formation(input.safeSlug) };
    if (!Number.isFinite(input.requestedDay) || input.requestedDay < 1) return { status: 'not_found' as const };

    const unit = units.find((candidate) => candidate.unitIndex === input.requestedDay);
    if (!unit) return { status: 'redirect' as const, href: routeBuilders.formationJour(input.safeSlug, units[0].unitIndex) };

    const enrollment = await findEnrollmentForFormationDay(userDoc.id, input.safeSlug);
    if (!enrollment?.introEngaged) return { status: 'redirect' as const, href: routeBuilders.formation(input.safeSlug) };
    if (enrollment.status === EnrollmentStatus.PAUSED) {
        return { status: 'redirect' as const, href: routeBuilders.formation(input.safeSlug) };
    }

    const publishedIndices = units.map((publishedUnit) => publishedUnit.unitIndex);
    const completedSet = new Set(enrollment.dayStates.map((state) => state.dayIndex));
    const completedCount = publishedIndices.filter((day) => completedSet.has(day)).length;
    const isCompleted = publishedIndices.length > 0 && completedCount === publishedIndices.length;
    const currentDay =
        publishedIndices.find((day) => !completedSet.has(day)) ??
        publishedIndices.at(-1) ??
        1;
    if (
        !isCompleted &&
        input.requestedDay > currentDay &&
        !completedSet.has(input.requestedDay)
    ) {
        return { status: 'redirect' as const, href: routeBuilders.formationJour(input.safeSlug, currentDay) };
    }

    const position = units.findIndex((publishedUnit) => publishedUnit.unitIndex === unit.unitIndex);
    const prev = position > 0 ? units[position - 1] : null;
    const next = position < units.length - 1 ? units[position + 1] : null;

    const { state } = await findFormationDayState({
        enrollmentId: enrollment.id,
        userId: userDoc.id,
        programSlug: input.safeSlug,
        day: unit.unitIndex,
    });

    const totalDays = units.length;
    const unitData = {
        ...unit,
        contentParagraphs: getContentParagraphs(unit.contentParagraphs, unit.content),
        journalFields: getJournalFields(unit.journalSchema),
        validationFields: getValidationFields(unit.validationSchema),
    };

    return {
        status: 'ok' as const,
        props: {
            safeSlug: input.safeSlug,
            draftOwnerKey: createHash('sha256').update(userDoc.id).digest('base64url').slice(0, 20),
            unit: unitData,
            currentDay,
            completedCount,
            totalDays,
            remaining: Math.max(0, totalDays - completedCount),
            prevHref: prev ? routeBuilders.formationJour(input.safeSlug, prev.unitIndex) : null,
            nextHref: next ? routeBuilders.formationJour(input.safeSlug, next.unitIndex) : null,
            initial: {
                data: asStringRecord(state?.data),
                practiced: !!state?.practiced,
                completed: !!state?.completed,
                lastSavedAt: state?.updatedAt ? new Date(state.updatedAt).toLocaleTimeString('fr-FR') : null,
                version: state?.updatedAt ? new Date(state.updatedAt).toISOString() : null,
            },
        },
    };
}
