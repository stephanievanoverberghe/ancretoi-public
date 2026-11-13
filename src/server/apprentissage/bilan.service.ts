import 'server-only';

import { reset7Routes } from '@/config/routes';
import { EnrollmentStatus } from '@/generated/prisma/client';
import { findLearnerBilanEnrollments, findPublishedDayIndicesByProgramSlugs } from './apprentissage.repository';
import { getProgrammeResumeHref } from './espace-pages.service';

type JsonRecord = Record<string, unknown>;

export type LearnerBilanRow = {
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
    updatedAtIso: string | null;
};

export type Reset7Progress = Pick<
    LearnerBilanRow,
    'programSlug' | 'title' | 'unitsTotal' | 'unitsDone' | 'percent' | 'currentDay' | 'status' | 'resumeHref'
>;

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function mapStatus(status: EnrollmentStatus): LearnerBilanRow['status'] {
    if (status === EnrollmentStatus.PAUSED) return 'paused';
    return 'active';
}

function mapLevel(level: unknown): LearnerBilanRow['level'] {
    if (level === 'Cible' || level === 'Premium' || level === 'Basique') return level;
    return null;
}

export async function getLearnerBilanDataForUserId(userId: string) {
    const enrollments = await findLearnerBilanEnrollments(userId);

    const slugs = [...new Set(enrollments.map((enrollment) => enrollment.programSlug))];
    const publishedDaysBySlug = await findPublishedDayIndicesByProgramSlugs(slugs);

    const rows: LearnerBilanRow[] = enrollments.map((enrollment) => {
        const program = enrollment.program;
        const hero = asRecord(program.hero);
        const card = asRecord(program.card);
        const cardImage = asRecord(card.image);
        const meta = asRecord(program.meta);
        const publishedDays = publishedDaysBySlug.get(enrollment.programSlug) ?? [];
        const publishedSet = new Set(publishedDays);
        const total = publishedDays.length;
        const completedDays = new Set(
            enrollment.dayStates
                .map((state) => state.dayIndex)
                .filter((day) => publishedSet.has(day)),
        );
        const done = completedDays.size;
        const percent = total ? Math.round((done / total) * 100) : 0;
        const currentDay =
            publishedDays.find((day) => !completedDays.has(day)) ??
            publishedDays.at(-1) ??
            1;
        const status: LearnerBilanRow['status'] =
            total > 0 && done === total ? 'completed' : mapStatus(enrollment.status);

        return {
            programSlug: enrollment.programSlug,
            title: asString(hero.title) ?? program.title ?? 'Sans titre',
            coverUrl: asString(cardImage.url) ?? program.coverUrl ?? null,
            coverAlt: asString(cardImage.alt),
            level: mapLevel(meta.level),
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
            updatedAtIso: enrollment.updatedAt ? enrollment.updatedAt.toISOString() : null,
        };
    });

    const avgPercent = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0;
    const totalUnitsDone = rows.reduce((sum, row) => sum + row.unitsDone, 0);
    const lastActivityIso = enrollments[0]?.updatedAt ? enrollments[0].updatedAt.toISOString() : null;
    const reset7Row = rows.find((row) => row.programSlug === reset7Routes.programmeSlug) ?? null;
    const canAccessPlan = reset7Row?.status === 'completed' && reset7Row.unitsTotal > 0;
    const reset7Progress: Reset7Progress | null = reset7Row
        ? {
              programSlug: reset7Row.programSlug,
              title: reset7Row.title,
              unitsTotal: reset7Row.unitsTotal,
              unitsDone: reset7Row.unitsDone,
              percent: reset7Row.percent,
              currentDay: reset7Row.currentDay,
              status: reset7Row.status,
              resumeHref: reset7Row.resumeHref,
          }
        : null;

    return {
        rows,
        avgPercent,
        totalUnitsDone,
        lastActivityIso,
        bilanMode: canAccessPlan ? ('final' as const) : ('preview' as const),
        canAccessPlan,
        reset7Progress,
    };
}
