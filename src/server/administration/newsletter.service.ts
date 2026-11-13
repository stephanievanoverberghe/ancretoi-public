import 'server-only';

import { NewsletterStatus, type Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

export type AdminNewsletterSearchParams = {
    q?: string;
    status?: 'all' | 'pending' | 'confirmed' | 'unsubscribed' | 'bounced' | 'complained';
    tag?: string;
    sort?: 'recent' | 'oldest' | 'alphaAsc' | 'alphaDesc';
    page?: string;
};

type SortKey = NonNullable<AdminNewsletterSearchParams['sort']>;

const PAGE_SIZE = 20;

const statusToPrisma = {
    pending: NewsletterStatus.PENDING,
    confirmed: NewsletterStatus.CONFIRMED,
    unsubscribed: NewsletterStatus.UNSUBSCRIBED,
    bounced: NewsletterStatus.BOUNCED,
    complained: NewsletterStatus.COMPLAINED,
} as const;

type NewsletterFilterStatus = 'all' | keyof typeof statusToPrisma;

export const adminNewsletterStatuses = Object.keys(statusToPrisma) as Array<keyof typeof statusToPrisma>;

function statusFromPrisma(status: NewsletterStatus) {
    return status.toLowerCase() as Exclude<AdminNewsletterSearchParams['status'], 'all'>;
}

export async function getAdministrationNewsletterData(searchParams?: AdminNewsletterSearchParams) {
    const prisma = getPrismaClient();

    const q = (searchParams?.q ?? '').trim().toLowerCase();
    const rawStatus = searchParams?.status ?? 'all';
    const status: NewsletterFilterStatus = rawStatus === 'all' || adminNewsletterStatuses.includes(rawStatus as keyof typeof statusToPrisma)
        ? (rawStatus as NewsletterFilterStatus)
        : 'all';
    const rawSort = searchParams?.sort ?? 'recent';
    const sort: SortKey = ['recent', 'oldest', 'alphaAsc', 'alphaDesc'].includes(rawSort) ? rawSort : 'recent';
    const parsedPage = Number(searchParams?.page ?? '1');
    const requestedPage = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
    const tag = (searchParams?.tag ?? '').trim();

    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (q) where.email = { contains: q, mode: 'insensitive' };
    if (status !== 'all') where.status = statusToPrisma[status];
    if (tag) where.tags = { has: tag };

    const orderBy: Prisma.NewsletterSubscriberOrderByWithRelationInput =
        sort === 'alphaAsc' ? { email: 'asc' } : sort === 'alphaDesc' ? { email: 'desc' } : sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [statusRows, total] = await Promise.all([
        prisma.newsletterSubscriber.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.newsletterSubscriber.count({ where }),
    ]);
    const statusCounts = new Map(statusRows.map((row) => [row.status, row._count._all]));
    const countConfirmed = statusCounts.get(NewsletterStatus.CONFIRMED) ?? 0;
    const countPending = statusCounts.get(NewsletterStatus.PENDING) ?? 0;
    const countUnsub = statusCounts.get(NewsletterStatus.UNSUBSCRIBED) ?? 0;
    const countBounced = statusCounts.get(NewsletterStatus.BOUNCED) ?? 0;
    const countComplained = statusCounts.get(NewsletterStatus.COMPLAINED) ?? 0;
    const countAll = Array.from(statusCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const docsRaw = await prisma.newsletterSubscriber.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    });
    const docs = docsRaw.map((doc) => ({
        ...doc,
        status: statusFromPrisma(doc.status),
    }));

    return {
        countAll,
        countConfirmed,
        countPending,
        countUnsub,
        countBounced,
        countComplained,
        q,
        status,
        sort,
        page,
        tag,
        total,
        docs,
        totalPages,
    };
}

export async function updateAdminNewsletterSubscriberStatus(input: { email: string; status: keyof typeof statusToPrisma }) {
    if (!input.email || !adminNewsletterStatuses.includes(input.status)) {
        return { ok: false as const, error: 'bad_request' as const, statusCode: 400 };
    }
    if (input.status === 'confirmed') {
        return { ok: false as const, error: 'double_opt_in_required' as const, statusCode: 409 };
    }

    const doc = await getPrismaClient().newsletterSubscriber.findUnique({ where: { email: input.email } });
    if (!doc) return { ok: false as const, error: 'not_found' as const, statusCode: 404 };

    await getPrismaClient().newsletterSubscriber.update({
        where: { email: input.email },
        data: {
            status: statusToPrisma[input.status],
            ...(input.status === 'unsubscribed' ? { unsubscribedAt: new Date() } : {}),
        },
    });

    return { ok: true as const };
}

export async function getAdminNewsletterExportRows(input: {
    q: string;
    status: NewsletterFilterStatus;
    tag?: string;
    sort?: SortKey;
}) {
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (input.q) where.email = { contains: input.q, mode: 'insensitive' };
    if (input.status !== 'all') where.status = statusToPrisma[input.status];
    if (input.tag) where.tags = { has: input.tag };

    const orderBy: Prisma.NewsletterSubscriberOrderByWithRelationInput =
        input.sort === 'alphaAsc'
            ? { email: 'asc' }
            : input.sort === 'alphaDesc'
              ? { email: 'desc' }
              : input.sort === 'oldest'
                ? { createdAt: 'asc' }
                : { createdAt: 'desc' };

    return getPrismaClient().newsletterSubscriber.findMany({ where, orderBy });
}

export async function getConfirmedNewsletterRecipients(tag?: string) {
    return getPrismaClient().newsletterSubscriber.findMany({
        where: {
            status: NewsletterStatus.CONFIRMED,
            ...(tag ? { tags: { has: tag } } : {}),
        },
        select: { id: true, email: true, unsubToken: true },
        orderBy: [{ id: 'asc' }, { email: 'asc' }],
    });
}

export async function getConfirmedNewsletterRecipientsByIds(input: { ids: string[]; tag?: string }) {
    if (input.ids.length === 0) return [];

    return getPrismaClient().newsletterSubscriber.findMany({
        where: {
            id: { in: input.ids },
            status: NewsletterStatus.CONFIRMED,
            ...(input.tag ? { tags: { has: input.tag } } : {}),
        },
        select: { id: true, email: true, unsubToken: true },
        orderBy: [{ id: 'asc' }, { email: 'asc' }],
    });
}

export async function ensureNewsletterUnsubscribeToken(input: { id: string; candidateToken: string }) {
    const prisma = getPrismaClient();

    await prisma.newsletterSubscriber.updateMany({
        where: { id: input.id, unsubToken: null },
        data: { unsubToken: input.candidateToken },
    });

    const recipient = await prisma.newsletterSubscriber.findUnique({
        where: { id: input.id },
        select: { id: true, email: true, status: true, unsubToken: true },
    });

    if (!recipient?.unsubToken) throw new Error('newsletter_recipient_missing');
    return recipient;
}
