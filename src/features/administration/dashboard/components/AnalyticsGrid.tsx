'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge, Card, LinkButton } from '@/components/ui';
import { AdminStatePanel } from '@/features/administration/shared';
import type { AdminAnalytics, AdminMetricSeries } from '@/types/administration-dashboard.types';

import Sparkline from './Sparkline';

function Delta({ series }: { series: AdminMetricSeries }) {
    if (series.points.length < 2 || series.total === 0) return null;

    const last = series.points.at(-1)?.value ?? 0;
    const previous = series.points.at(-2)?.value ?? 0;
    const difference = last - previous;

    if (difference === 0) return <Badge variant="outline">— Stable</Badge>;

    return (
        <Badge
            variant={difference > 0 ? 'success' : 'danger'}
            className={difference < 0 ? '!text-foreground' : undefined}
        >
            {difference > 0 ? '▲' : '▼'} {Math.abs(difference)}
        </Badge>
    );
}

function MetricCard({ label, value, series, href, linkLabel, children }: {
    label: string;
    value: number;
    series: AdminMetricSeries;
    href: string;
    linkLabel: string;
    children?: ReactNode;
}) {
    return (
        <Card className="rounded-3xl border-border/80 p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 font-serif text-3xl font-semibold tabular-nums text-foreground">{value}</p>
                </div>
                <Delta series={series} />
            </div>

            {series.total > 0 ? (
                <div className="mt-4">{children ?? <Sparkline points={series.points} ariaLabel={label} />}</div>
            ) : (
                <AdminStatePanel
                    kind="empty"
                    compact
                    headingAs="h3"
                    className="mt-4 min-h-32"
                    title="Pas encore de tendance"
                    description="La série apparaîtra dès qu’une donnée réelle sera disponible."
                />
            )}

            <Link href={href} className="mt-4 inline-flex rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                {linkLabel} →
            </Link>
        </Card>
    );
}

function BarList({ items }: { items: { label: string; value: number }[] }) {
    if (items.length === 0) {
        return <AdminStatePanel kind="empty" compact headingAs="h3" title="Aucune source disponible" description="Les sources apparaîtront après les premières confirmations." />;
    }

    const max = Math.max(...items.map((item) => item.value));

    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{item.label}</span>
                        <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.round((item.value / max) * 100)}%` }} aria-hidden="true" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function AnalyticsGrid({ data }: { data: AdminAnalytics }) {
    const latestNewsletter = data.newsletterWeekly.points.at(-1)?.value ?? 0;
    const latestLearners = data.learnersMonthly.points.at(-1)?.value ?? 0;
    const latestArticles = data.articlesMonthly.points.at(-1)?.value ?? 0;
    const latestInspirations = data.inspirationsMonthly.points.at(-1)?.value ?? 0;
    const publicationSeries: AdminMetricSeries = {
        points: data.articlesMonthly.points.map((point, index) => ({
            label: point.label,
            value: point.value + (data.inspirationsMonthly.points[index]?.value ?? 0),
        })),
        total: data.articlesMonthly.total + data.inspirationsMonthly.total,
    };

    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <MetricCard
                    label="Confirmations newsletter · 12 semaines"
                    value={latestNewsletter}
                    series={data.newsletterWeekly}
                    href="/administration/newsletter"
                    linkLabel="Voir les contacts"
                />
                <MetricCard
                    label="Nouveaux apprenants · 6 mois"
                    value={latestLearners}
                    series={data.learnersMonthly}
                    href="/administration/apprenants"
                    linkLabel="Voir les apprenants"
                />
                <MetricCard
                    label="Publications · 6 mois"
                    value={latestArticles + latestInspirations}
                    series={publicationSeries}
                    href="/administration/articles"
                    linkLabel="Gérer les contenus"
                >
                    <div className="grid gap-4">
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Articles</span>
                                <span className="font-semibold tabular-nums text-foreground">{latestArticles}</span>
                            </div>
                            {data.articlesMonthly.total > 0 ? (
                                <Sparkline points={data.articlesMonthly.points} showFill={false} ariaLabel="Articles publiés par mois" />
                            ) : (
                                <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-xs text-muted-foreground">Aucun article publié sur la période.</p>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Inspirations</span>
                                <span className="font-semibold tabular-nums text-foreground">{latestInspirations}</span>
                            </div>
                            {data.inspirationsMonthly.total > 0 ? (
                                <Sparkline points={data.inspirationsMonthly.points} showFill={false} ariaLabel="Inspirations publiées par mois" />
                            ) : (
                                <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-xs text-muted-foreground">Aucune inspiration publiée sur la période.</p>
                            )}
                        </div>
                    </div>
                </MetricCard>
            </div>

            <Card className="rounded-3xl border-border/80 p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-serif text-xl font-semibold text-foreground">Origine des abonnés confirmés</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Répartition réelle des principales sources d’inscription.</p>
                    </div>
                    <LinkButton href="/administration/newsletter" variant="ghost" size="sm">Détails →</LinkButton>
                </div>
                <div className="mt-5"><BarList items={data.topNewsletterSources} /></div>
            </Card>
        </div>
    );
}
