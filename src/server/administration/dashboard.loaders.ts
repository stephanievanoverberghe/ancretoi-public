import 'server-only';

import { BlogPostStatus, InspirationStatus, ProgramStatus, UserRole } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

import { getAdminAnalytics } from './analytics';

export async function loadAdministrationDashboardSource() {
    const prisma = getPrismaClient();
    const activeSince = new Date();
    activeSince.setUTCDate(activeSince.getUTCDate() - 30);

    const [
        programStatuses,
        articleStatuses,
        inspirationStatuses,
        learners,
        activeLearners30d,
        newsletterStatuses,
        attentionPrograms,
        attentionArticles,
        attentionInspirations,
        recentPrograms,
        recentArticles,
        recentInspirations,
        analytics,
    ] = await Promise.all([
        prisma.program.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.blogPost.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.inspiration.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.user.count({ where: { role: UserRole.USER, deletedAt: null, suspendedAt: null } }),
        prisma.user.count({
            where: { role: UserRole.USER, deletedAt: null, suspendedAt: null, lastLoginAt: { gte: activeSince } },
        }),
        prisma.newsletterSubscriber.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.program.findMany({
            where: { deletedAt: null, status: { in: [ProgramStatus.DRAFT, ProgramStatus.PREFLIGHT] } },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, status: true, coverUrl: true, card: true, updatedAt: true },
        }),
        prisma.blogPost.findMany({
            where: { deletedAt: null, status: BlogPostStatus.DRAFT },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, coverPath: true, coverAlt: true, updatedAt: true },
        }),
        prisma.inspiration.findMany({
            where: { deletedAt: null, status: InspirationStatus.DRAFT },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, videoUrl: true, updatedAt: true },
        }),
        prisma.program.findMany({
            where: { deletedAt: null, status: { not: ProgramStatus.ARCHIVED } },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, description: true, status: true, coverUrl: true, card: true, updatedAt: true },
        }),
        prisma.blogPost.findMany({
            where: { deletedAt: null, status: { not: BlogPostStatus.ARCHIVED } },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, summary: true, status: true, coverPath: true, coverAlt: true, updatedAt: true },
        }),
        prisma.inspiration.findMany({
            where: { deletedAt: null, status: { not: InspirationStatus.ARCHIVED } },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            select: { id: true, slug: true, title: true, summary: true, status: true, videoUrl: true, updatedAt: true },
        }),
        getAdminAnalytics(),
    ]);

    return {
        programStatuses,
        articleStatuses,
        inspirationStatuses,
        learners,
        activeLearners30d,
        newsletterStatuses,
        attentionPrograms,
        attentionArticles,
        attentionInspirations,
        recentPrograms,
        recentArticles,
        recentInspirations,
        analytics,
    };
}

export type AdministrationDashboardSource = Awaited<ReturnType<typeof loadAdministrationDashboardSource>>;
