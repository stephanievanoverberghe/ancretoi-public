import 'server-only';

import { BookOpenCheck, CheckCircle2, MailCheck, Plus, Users } from 'lucide-react';

import { Badge, LinkButton } from '@/components/ui';
import { administrationRoutes } from '@/config/routes';
import type { AdminContentKind, AdminRecentItem } from '@/types/administration-dashboard.types';
import { getAdministrationDashboardData } from '@/server/administration/dashboard.service';
import { requireAdmin } from '@/server/auth/authz';

import { AdminKpiCard, AdminMediaCard, AdminMediaHero, AdminPage, AdminPanel, AdminStatePanel } from '../shared';
import { AnalyticsGrid } from './components';

const kindLabels: Record<AdminContentKind, string> = {
    programme: 'Programme',
    article: 'Article',
    inspiration: 'Inspiration',
};

function getFirstName(name: string | null | undefined, email: string) {
    const source = name?.trim() || email.split('@')[0] || 'vous';
    return source.split(/\s+/)[0] || 'vous';
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function getStatusPresentation(status: AdminRecentItem['status']) {
    if (status === 'published') return { label: 'Publié', variant: 'success' as const };
    if (status === 'preflight') return { label: 'Prépublication', variant: 'warning' as const };
    return { label: 'Brouillon', variant: 'outline' as const };
}

export async function AdministrationDashboardPage() {
    const admin = await requireAdmin();
    const { counts, statusCounts, newsletter, attentionItems, recentItems, analytics } = await getAdministrationDashboardData();
    const firstName = getFirstName(admin.name, admin.email);
    const attentionTotal =
        statusCounts.programs.draft +
        statusCounts.programs.preflight +
        statusCounts.articles.draft +
        statusCounts.inspirations.draft;

    return (
        <AdminPage spacing="relaxed">
            <AdminMediaHero
                eyebrow="Studio de pilotage éditorial"
                title={`Bonjour ${firstName}, que souhaitez-vous faire vivre aujourd’hui ?`}
                description="Retrouvez les contenus qui demandent votre attention, l’activité réelle de votre audience et votre prochaine action utile."
                imageSrc="/images/administration/dashboard-studio.webp"
                actions={
                    <LinkButton href={administrationRoutes.programmeNouveau} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                        Créer un programme
                    </LinkButton>
                }
                footer={
                    <dl className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                            <dt className="text-muted-foreground">Actifs sur 30 jours</dt>
                            <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums text-foreground">{counts.activeLearners30d}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">À finaliser</dt>
                            <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums text-foreground">{attentionTotal}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Contacts newsletter</dt>
                            <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums text-foreground">{newsletter.total}</dd>
                        </div>
                    </dl>
                }
            />

            <section aria-labelledby="admin-kpi-title">
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Repères essentiels</p>
                    <h2 id="admin-kpi-title" className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">La plateforme en un regard</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpiCard
                        label="Programmes publiés"
                        value={counts.publishedPrograms}
                        icon={BookOpenCheck}
                        href={administrationRoutes.programmes}
                    />
                    <AdminKpiCard
                        label="Contenus publiés"
                        value={counts.publishedContent}
                        icon={CheckCircle2}
                        href={administrationRoutes.articles}
                        helper={`${counts.publishedArticles} article${counts.publishedArticles !== 1 ? 's' : ''} · ${counts.publishedInspirations} inspiration${counts.publishedInspirations !== 1 ? 's' : ''}`}
                        tone="secondary"
                    />
                    <AdminKpiCard
                        label="Apprenants accessibles"
                        value={counts.learners}
                        icon={Users}
                        href={administrationRoutes.apprenants}
                        helper={`${counts.activeLearners30d} connexion${counts.activeLearners30d !== 1 ? 's' : ''} sur les 30 derniers jours`}
                    />
                    <AdminKpiCard
                        label="Abonnés confirmés"
                        value={newsletter.confirmed}
                        icon={MailCheck}
                        href={administrationRoutes.newsletter}
                        helper={`${newsletter.total} contact${newsletter.total !== 1 ? 's' : ''} au total`}
                        tone="accent"
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
                <AdminPanel
                    eyebrow="Priorités"
                    title="À finaliser"
                    description="Brouillons et prépublications réellement présents dans le studio."
                    actions={<LinkButton href={administrationRoutes.programmes} variant="ghost" size="sm">Voir les contenus</LinkButton>}
                >
                    {attentionItems.length > 0 ? (
                        <div className="grid gap-4 2xl:grid-cols-2">
                            {attentionItems.map((item) => {
                                const status = getStatusPresentation(item.status);
                                return (
                                    <AdminMediaCard
                                        key={`${item.kind}-${item.id}`}
                                        title={item.title}
                                        href={item.href}
                                        kindLabel={kindLabels[item.kind]}
                                        statusLabel={status.label}
                                        statusVariant={status.variant}
                                        imageSrc={item.imageUrl}
                                        imageAlt={item.imageAlt}
                                        summary={item.reason}
                                        meta={`Modifié le ${formatDate(item.updatedAt)}`}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <AdminStatePanel kind="empty" headingAs="h3" title="Tout est à jour" description="Aucun brouillon ni contenu en prépublication ne demande votre attention." />
                    )}
                </AdminPanel>

                <AdminPanel eyebrow="Audience" title="Newsletter" description={`${newsletter.total} contact${newsletter.total !== 1 ? 's' : ''} réparti${newsletter.total !== 1 ? 's' : ''} selon leur statut.`}>
                    <dl className="grid gap-3">
                        <NewsletterRow label="Confirmés" value={newsletter.confirmed} variant="success" />
                        <NewsletterRow label="En attente" value={newsletter.pending} variant="warning" />
                        <NewsletterRow label="Désinscrits" value={newsletter.unsubscribed} variant="outline" />
                        <NewsletterRow label="Rejetés" value={newsletter.bounced} variant="danger" />
                        <NewsletterRow label="Plaintes" value={newsletter.complained} variant="danger" />
                    </dl>
                    <LinkButton href={administrationRoutes.newsletter} variant="secondary" className="mt-5 w-full">Gérer l’audience</LinkButton>
                </AdminPanel>
            </div>

            <AdminPanel
                eyebrow="Édition"
                title="Récemment modifié"
                description="Les derniers contenus travaillés, avec leurs médias et leur statut réel."
            >
                {recentItems.length > 0 ? (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {recentItems.map((item) => {
                            const status = getStatusPresentation(item.status);
                            return (
                                <AdminMediaCard
                                    key={`${item.kind}-${item.id}`}
                                    title={item.title}
                                    href={item.href}
                                    kindLabel={kindLabels[item.kind]}
                                    statusLabel={status.label}
                                    statusVariant={status.variant}
                                    imageSrc={item.imageUrl}
                                    imageAlt={item.imageAlt}
                                    summary={item.summary}
                                    meta={`Modifié le ${formatDate(item.updatedAt)}`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <AdminStatePanel kind="empty" headingAs="h3" title="Aucun contenu récent" description="Les contenus modifiés apparaîtront ici dès la première édition." />
                )}
            </AdminPanel>

            <section aria-labelledby="admin-analytics-title">
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Tendances réelles</p>
                    <h2 id="admin-analytics-title" className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">Activité</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Confirmations, nouveaux apprenants et publications sur leurs périodes réelles.</p>
                </div>
                <AnalyticsGrid data={analytics} />
            </section>
        </AdminPage>
    );
}

function NewsletterRow({ label, value, variant }: { label: string; value: number; variant: 'success' | 'warning' | 'outline' | 'danger' }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/75 bg-surface-muted/40 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd><Badge variant={variant}>{value}</Badge></dd>
        </div>
    );
}
