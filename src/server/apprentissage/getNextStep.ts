import 'server-only';

import { EnrollmentStatus } from '@/generated/prisma/client';
import { findLatestEnrollmentForNextStep, findPublishedDayUnitHeadings } from './apprentissage.repository';

type NextStep =
    | { type: 'none'; href: '/programmes' }
    | { type: 'intro'; href: `/espace/formations/${string}` }
    | { type: 'day'; href: `/espace/formations/${string}/jour/${string}` }
    | { type: 'summary'; href: '/espace/bilan' };

export async function getNextStepForUser(userId: string): Promise<NextStep> {
    const enrollment = await findLatestEnrollmentForNextStep(userId);

    if (!enrollment) return { type: 'none', href: '/programmes' };

    const slug = enrollment.programSlug.toLowerCase();
    const publishedUnits = await findPublishedDayUnitHeadings(slug);
    const publishedDays = publishedUnits.map((unit) => unit.unitIndex);
    if (publishedDays.length === 0) return { type: 'none', href: '/programmes' };

    const completedSet = new Set(enrollment.dayStates.map((state) => state.dayIndex));
    const nextDay = publishedDays.find((day) => !completedSet.has(day)) ?? null;
    if (nextDay === null) return { type: 'summary', href: '/espace/bilan' };

    if (
        enrollment.status === EnrollmentStatus.PAUSED ||
        !enrollment.introEngaged
    ) {
        return { type: 'intro', href: `/espace/formations/${slug}` };
    }

    const dayStr = String(nextDay).padStart(2, '0');
    return { type: 'day', href: `/espace/formations/${slug}/jour/${dayStr}` };
}
