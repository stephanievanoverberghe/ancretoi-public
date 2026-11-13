export type AdminSeriesPoint = {
    label: string;
    value: number;
};

export type AdminTopItem = {
    label: string;
    value: number;
};

export type AdminMetricSeries = {
    points: AdminSeriesPoint[];
    total: number;
};

export type AdminAnalytics = {
    newsletterWeekly: AdminMetricSeries;
    learnersMonthly: AdminMetricSeries;
    articlesMonthly: AdminMetricSeries;
    inspirationsMonthly: AdminMetricSeries;
    topNewsletterSources: AdminTopItem[];
};

export type AdminContentKind = 'programme' | 'article' | 'inspiration';

export type AdminAttentionItem = {
    id: string;
    kind: AdminContentKind;
    title: string;
    status: 'draft' | 'preflight';
    reason: string;
    href: string;
    imageUrl: string | null;
    imageAlt: string;
    updatedAt: string;
};

export type AdminRecentItem = {
    id: string;
    kind: AdminContentKind;
    title: string;
    status: 'draft' | 'preflight' | 'published';
    href: string;
    imageUrl: string | null;
    imageAlt: string;
    summary: string | null;
    updatedAt: string;
};

export type AdminStatusCounts = {
    programs: {
        draft: number;
        preflight: number;
        published: number;
        archived: number;
    };
    articles: {
        draft: number;
        published: number;
        archived: number;
    };
    inspirations: {
        draft: number;
        published: number;
        archived: number;
    };
};

export type AdminNewsletterCounts = {
    total: number;
    pending: number;
    confirmed: number;
    unsubscribed: number;
    bounced: number;
    complained: number;
};

export type AdministrationDashboardData = {
    counts: {
        publishedPrograms: number;
        publishedArticles: number;
        publishedInspirations: number;
        publishedContent: number;
        learners: number;
        activeLearners30d: number;
    };
    statusCounts: AdminStatusCounts;
    newsletter: AdminNewsletterCounts;
    attentionItems: AdminAttentionItem[];
    recentItems: AdminRecentItem[];
    analytics: AdminAnalytics;
};
