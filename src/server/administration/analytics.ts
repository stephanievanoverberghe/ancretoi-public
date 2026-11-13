import 'server-only';

import { BlogPostStatus, InspirationStatus, NewsletterStatus, UserRole } from '@/generated/prisma/client';
import { requireAdmin } from '@/server/auth/authz';
import { getPrismaClient } from '@/server/db/prisma';
import type { AdminAnalytics, AdminMetricSeries, AdminSeriesPoint } from '@/types/administration-dashboard.types';

function labelWeek(date: Date) {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function labelMonth(date: Date) {
    return date.toLocaleDateString('fr-FR', { month: 'short' });
}

function weekStart(date: Date) {
    const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = result.getUTCDay() || 7;
    result.setUTCDate(result.getUTCDate() - day + 1);
    return result;
}

function monthStart(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function countByKey<T>(items: T[], getKey: (item: T) => string) {
    const map = new Map<string, number>();
    for (const item of items) {
        const key = getKey(item);
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
}

function buildSeries(starts: Date[], counts: Map<string, number>, labeler: (date: Date) => string): AdminMetricSeries {
    const points: AdminSeriesPoint[] = starts.map((date) => ({ label: labeler(date), value: counts.get(date.toISOString()) ?? 0 }));
    return {
        points,
        total: points.reduce((sum, point) => sum + point.value, 0),
    };
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
    await requireAdmin();

    const now = new Date();
    const monthStarts = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        date.setUTCMonth(date.getUTCMonth() - (5 - index));
        return date;
    });
    const weekStarts = Array.from({ length: 12 }, (_, index) => {
        const date = weekStart(now);
        date.setUTCDate(date.getUTCDate() - 7 * (11 - index));
        return date;
    });
    const sixMonthsAgo = monthStarts[0];
    const twelveWeeksAgo = weekStarts[0];

    const [newsletters, learners, articles, inspirations, sources] = await Promise.all([
        getPrismaClient().newsletterSubscriber.findMany({
            where: { status: NewsletterStatus.CONFIRMED, confirmedAt: { gte: twelveWeeksAgo } },
            select: { confirmedAt: true },
        }),
        getPrismaClient().user.findMany({
            where: { role: UserRole.USER, deletedAt: null, suspendedAt: null, createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
        }),
        getPrismaClient().blogPost.findMany({
            where: { status: BlogPostStatus.PUBLISHED, deletedAt: null, publishedAt: { gte: sixMonthsAgo } },
            select: { publishedAt: true },
        }),
        getPrismaClient().inspiration.findMany({
            where: { status: InspirationStatus.PUBLISHED, deletedAt: null, publishedAt: { gte: sixMonthsAgo } },
            select: { publishedAt: true },
        }),
        getPrismaClient().newsletterSubscriber.groupBy({
            by: ['source'],
            where: { status: NewsletterStatus.CONFIRMED },
            _count: { _all: true },
            orderBy: { _count: { source: 'desc' } },
            take: 5,
        }),
    ]);

    const weeklyCounts = countByKey(
        newsletters.filter((item): item is { confirmedAt: Date } => item.confirmedAt instanceof Date),
        (item) => weekStart(item.confirmedAt).toISOString(),
    );
    const learnerMonthlyCounts = countByKey(learners, (item) => monthStart(item.createdAt).toISOString());
    const articleMonthlyCounts = countByKey(
        articles.filter((item): item is { publishedAt: Date } => item.publishedAt instanceof Date),
        (item) => monthStart(item.publishedAt).toISOString(),
    );
    const inspirationMonthlyCounts = countByKey(
        inspirations.filter((item): item is { publishedAt: Date } => item.publishedAt instanceof Date),
        (item) => monthStart(item.publishedAt).toISOString(),
    );

    return {
        newsletterWeekly: buildSeries(weekStarts, weeklyCounts, labelWeek),
        learnersMonthly: buildSeries(monthStarts, learnerMonthlyCounts, labelMonth),
        articlesMonthly: buildSeries(monthStarts, articleMonthlyCounts, labelMonth),
        inspirationsMonthly: buildSeries(monthStarts, inspirationMonthlyCounts, labelMonth),
        topNewsletterSources: sources.map((source) => ({ label: source.source?.trim() || 'site', value: source._count._all })),
    };
}
