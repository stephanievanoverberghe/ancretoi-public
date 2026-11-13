import 'server-only';

import { BlogPostStatus, InspirationStatus, NewsletterStatus, ProgramStatus } from '@/generated/prisma/client';
import { routeBuilders } from '@/config/routes';
import type {
    AdminAttentionItem,
    AdminNewsletterCounts,
    AdminRecentItem,
    AdminStatusCounts,
    AdministrationDashboardData,
} from '@/types/administration-dashboard.types';

import type { AdministrationDashboardSource } from './dashboard.loaders';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function getProgramCover(card: unknown, fallback: string | null) {
    const cardImage = asRecord(asRecord(card).image);
    return asString(cardImage.url) || fallback;
}

function getYoutubeThumbnail(videoUrl: string | null) {
    if (!videoUrl) return null;

    try {
        const url = new URL(videoUrl);
        const videoId = url.hostname.includes('youtu.be') ? url.pathname.split('/').filter(Boolean)[0] : url.searchParams.get('v');
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch {
        return null;
    }
}

function toStatusCountMap<TStatus extends string>(rows: { status: TStatus; _count: { _all: number } }[]) {
    return new Map(rows.map((row) => [row.status, row._count._all]));
}

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
    return items.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function mapStatusCounts(source: AdministrationDashboardSource): AdminStatusCounts {
    const programCountMap = toStatusCountMap(source.programStatuses);
    const articleCountMap = toStatusCountMap(source.articleStatuses);
    const inspirationCountMap = toStatusCountMap(source.inspirationStatuses);

    return {
        programs: {
            draft: programCountMap.get(ProgramStatus.DRAFT) ?? 0,
            preflight: programCountMap.get(ProgramStatus.PREFLIGHT) ?? 0,
            published: programCountMap.get(ProgramStatus.PUBLISHED) ?? 0,
            archived: programCountMap.get(ProgramStatus.ARCHIVED) ?? 0,
        },
        articles: {
            draft: articleCountMap.get(BlogPostStatus.DRAFT) ?? 0,
            published: articleCountMap.get(BlogPostStatus.PUBLISHED) ?? 0,
            archived: articleCountMap.get(BlogPostStatus.ARCHIVED) ?? 0,
        },
        inspirations: {
            draft: inspirationCountMap.get(InspirationStatus.DRAFT) ?? 0,
            published: inspirationCountMap.get(InspirationStatus.PUBLISHED) ?? 0,
            archived: inspirationCountMap.get(InspirationStatus.ARCHIVED) ?? 0,
        },
    };
}

function mapNewsletterCounts(source: AdministrationDashboardSource): AdminNewsletterCounts {
    const counts = toStatusCountMap(source.newsletterStatuses);
    return {
        total: Array.from(counts.values()).reduce((sum, count) => sum + count, 0),
        pending: counts.get(NewsletterStatus.PENDING) ?? 0,
        confirmed: counts.get(NewsletterStatus.CONFIRMED) ?? 0,
        unsubscribed: counts.get(NewsletterStatus.UNSUBSCRIBED) ?? 0,
        bounced: counts.get(NewsletterStatus.BOUNCED) ?? 0,
        complained: counts.get(NewsletterStatus.COMPLAINED) ?? 0,
    };
}

function mapAttentionItems(source: AdministrationDashboardSource) {
    return sortByUpdatedAt<AdminAttentionItem>([
        ...source.attentionPrograms.map((program) => ({
            id: program.id,
            kind: 'programme' as const,
            title: program.title || 'Programme sans titre',
            status: program.status === ProgramStatus.PREFLIGHT ? ('preflight' as const) : ('draft' as const),
            reason: program.status === ProgramStatus.PREFLIGHT ? 'Prépublication à vérifier' : 'Programme en brouillon',
            href: routeBuilders.administrationProgrammeEdit(program.slug),
            imageUrl: getProgramCover(program.card, program.coverUrl),
            imageAlt: program.title || '',
            updatedAt: program.updatedAt.toISOString(),
        })),
        ...source.attentionArticles.map((article) => ({
            id: article.id,
            kind: 'article' as const,
            title: article.title || 'Article sans titre',
            status: 'draft' as const,
            reason: 'Article en brouillon',
            href: routeBuilders.administrationArticleEdit(article.slug),
            imageUrl: article.coverPath || null,
            imageAlt: article.coverAlt || '',
            updatedAt: article.updatedAt.toISOString(),
        })),
        ...source.attentionInspirations.map((inspiration) => ({
            id: inspiration.id,
            kind: 'inspiration' as const,
            title: inspiration.title || 'Inspiration sans titre',
            status: 'draft' as const,
            reason: 'Inspiration en brouillon',
            href: routeBuilders.administrationInspirationEdit(inspiration.slug),
            imageUrl: getYoutubeThumbnail(inspiration.videoUrl),
            imageAlt: inspiration.title || '',
            updatedAt: inspiration.updatedAt.toISOString(),
        })),
    ]).slice(0, 6);
}

function mapRecentItems(source: AdministrationDashboardSource) {
    return sortByUpdatedAt<AdminRecentItem>([
        ...source.recentPrograms.map((program) => ({
            id: program.id,
            kind: 'programme' as const,
            title: program.title || 'Programme sans titre',
            status:
                program.status === ProgramStatus.PUBLISHED
                    ? ('published' as const)
                    : program.status === ProgramStatus.PREFLIGHT
                      ? ('preflight' as const)
                      : ('draft' as const),
            href: routeBuilders.administrationProgrammeEdit(program.slug),
            imageUrl: getProgramCover(program.card, program.coverUrl),
            imageAlt: program.title || '',
            summary: program.description || null,
            updatedAt: program.updatedAt.toISOString(),
        })),
        ...source.recentArticles.map((article) => ({
            id: article.id,
            kind: 'article' as const,
            title: article.title || 'Article sans titre',
            status: article.status === BlogPostStatus.PUBLISHED ? ('published' as const) : ('draft' as const),
            href: routeBuilders.administrationArticleEdit(article.slug),
            imageUrl: article.coverPath || null,
            imageAlt: article.coverAlt || '',
            summary: article.summary || null,
            updatedAt: article.updatedAt.toISOString(),
        })),
        ...source.recentInspirations.map((inspiration) => ({
            id: inspiration.id,
            kind: 'inspiration' as const,
            title: inspiration.title || 'Inspiration sans titre',
            status: inspiration.status === InspirationStatus.PUBLISHED ? ('published' as const) : ('draft' as const),
            href: routeBuilders.administrationInspirationEdit(inspiration.slug),
            imageUrl: getYoutubeThumbnail(inspiration.videoUrl),
            imageAlt: inspiration.title || '',
            summary: inspiration.summary || null,
            updatedAt: inspiration.updatedAt.toISOString(),
        })),
    ]).slice(0, 6);
}

export function mapAdministrationDashboardData(source: AdministrationDashboardSource): AdministrationDashboardData {
    const statusCounts = mapStatusCounts(source);
    const newsletter = mapNewsletterCounts(source);

    return {
        counts: {
            publishedPrograms: statusCounts.programs.published,
            publishedArticles: statusCounts.articles.published,
            publishedInspirations: statusCounts.inspirations.published,
            publishedContent: statusCounts.articles.published + statusCounts.inspirations.published,
            learners: source.learners,
            activeLearners30d: source.activeLearners30d,
        },
        statusCounts,
        newsletter,
        attentionItems: mapAttentionItems(source),
        recentItems: mapRecentItems(source),
        analytics: source.analytics,
    };
}
