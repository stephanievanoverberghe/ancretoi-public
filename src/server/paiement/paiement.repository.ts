import 'server-only';

import { EnrollmentStatus, PurchaseStatus } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export function upsertActiveEnrollment(input: { userId: string; programSlug: string; startedAt?: Date }) {
    return getPrismaClient().enrollment.upsert({
        where: { userId_programSlug: { userId: input.userId, programSlug: input.programSlug } },
        create: {
            userId: input.userId,
            programSlug: input.programSlug,
            status: EnrollmentStatus.ACTIVE,
            currentDay: 1,
            ...(input.startedAt ? { startedAt: input.startedAt } : {}),
        },
        update: { status: EnrollmentStatus.ACTIVE },
        select: { id: true },
    });
}

export function findCheckoutUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: { id: true, email: true, deletedAt: true },
    });
}

export function findActiveCheckoutEnrollment(input: { userId: string; programSlug: string }) {
    return getPrismaClient().enrollment.findFirst({
        where: {
            userId: input.userId,
            programSlug: input.programSlug,
            status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
        },
        select: { id: true, currentDay: true },
    });
}

export function findFulfillmentUserById(userId: string) {
    return getPrismaClient().user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true, email: true },
    });
}

export function recordPaidPurchaseAndEnrollment(input: {
    userId: string;
    programSlug: string;
    stripeSessionId: string;
    stripePaymentIntentId: string | null;
    amountCents: number | null;
    currency: string | null;
    metadata: Record<string, string>;
}) {
    return getPrismaClient().$transaction(async (tx) => {
        await tx.purchase.upsert({
            where: { stripeSessionId: input.stripeSessionId },
            create: {
                userId: input.userId,
                programSlug: input.programSlug,
                stripeSessionId: input.stripeSessionId,
                stripePaymentIntentId: input.stripePaymentIntentId,
                amountCents: input.amountCents,
                currency: input.currency,
                status: PurchaseStatus.PAID,
                metadata: input.metadata,
            },
            update: {
                status: PurchaseStatus.PAID,
                amountCents: input.amountCents,
                currency: input.currency,
                metadata: input.metadata,
            },
        });

        return tx.enrollment.upsert({
            where: { userId_programSlug: { userId: input.userId, programSlug: input.programSlug } },
            create: {
                userId: input.userId,
                programSlug: input.programSlug,
                status: EnrollmentStatus.ACTIVE,
                currentDay: 1,
                startedAt: new Date(),
            },
            update: {
                status: EnrollmentStatus.ACTIVE,
            },
            select: { id: true },
        });
    });
}
