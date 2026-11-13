import Link from 'next/link';
import { ArchiveX, CheckCircle2, ChevronDown, Clock3, Download, Mail, Plus, Search, ShieldAlert, SlidersHorizontal, UserMinus, X } from 'lucide-react';

import { Badge, Button, LinkButton } from '@/components/ui';
import { getAdministrationNewsletterData, type AdminNewsletterSearchParams } from '@/server/administration/newsletter.service';
import { requireAdmin } from '@/server/auth/authz';

import { AdminKpiCard, AdminPageHeader, AdminPanel, AdminStatePanel, AdminToolbar } from '../shared';
import ComposeSendForm from './components/ComposeSendForm';
import NewsletterContactActions from './components/NewsletterContactActions';

export type NewsletterSearchParams = AdminNewsletterSearchParams;

export async function AdministrationNewsletterPage({ searchParams }: { searchParams?: Promise<NewsletterSearchParams> }) {
    await requireAdmin();
    const filters = (await searchParams) ?? {};
    let data: Awaited<ReturnType<typeof getAdministrationNewsletterData>>;

    try {
        data = await getAdministrationNewsletterData(filters);
    } catch {
        return (
            <div className="mx-auto max-w-[88rem] space-y-8">
                <AdminPageHeader title="Newsletter" description="Contacts et campagnes." breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Newsletter' }]} />
                <AdminStatePanel kind="error" title="Impossible de charger la newsletter" description="Les données sont momentanément indisponibles. Réessayez dans quelques instants." icon={ShieldAlert} />
            </div>
        );
    }

    const { countAll, countConfirmed, countPending, countUnsub, countBounced, countComplained, q, status, sort, page, tag, total, docs, totalPages } = data;
    const hasFilters = Boolean(q || tag || status !== 'all');

    const pageHref = (nextPage: number) => {
        const params = createFilterParams({ q, status, tag, sort });
        params.set('page', String(nextPage));
        return `/administration/newsletter?${params.toString()}`;
    };
    const exportHref = `/api/admin/newsletter/export?${createFilterParams({ q, status, tag, sort }).toString()}`;

    return (
        <div className="mx-auto max-w-[88rem] space-y-8">
            <AdminPageHeader
                eyebrow="Audience"
                title="Newsletter"
                description="Pilotez une liste consentie, contrôlez sa qualité et testez chaque campagne avant diffusion."
                breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Newsletter' }]}
                actions={
                    <>
                        <LinkButton href={exportHref} variant="secondary" leftIcon={<Download className="h-4 w-4" />}>Exporter en CSV</LinkButton>
                        <LinkButton href="#compose" leftIcon={<Plus className="h-4 w-4" />}>Préparer une campagne</LinkButton>
                    </>
                }
                stats={
                    <>
                        <AdminKpiCard label="Contacts" value={countAll} icon={Mail} />
                        <AdminKpiCard label="Confirmés" value={countConfirmed} icon={CheckCircle2} />
                        <AdminKpiCard label="En attente" value={countPending} icon={Clock3} />
                        <AdminKpiCard label="Désinscrits" value={countUnsub} icon={UserMinus} />
                    </>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2" aria-label="Qualité de la liste">
                <AdminKpiCard label="Emails rejetés" value={countBounced} icon={ArchiveX} helper="Statut BOUNCED" />
                <AdminKpiCard label="Plaintes" value={countComplained} icon={ShieldAlert} helper="Statut COMPLAINED" />
            </div>

            <AdminToolbar ariaLabel="Filtrer les contacts newsletter" summary={`${total} contact${total > 1 ? 's' : ''} · page ${page} sur ${totalPages}`}>
                <details className="group rounded-xl border border-border bg-surface xl:hidden">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30">
                        <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />Recherche et filtres</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground motion-safe:transition-transform motion-safe:group-open:rotate-180 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                    </summary>
                    <NewsletterFiltersForm idPrefix="newsletter-mobile" q={q} status={status} tag={tag} sort={sort} className="grid gap-3 border-t border-border p-3" />
                </details>

                <NewsletterFiltersForm
                    idPrefix="newsletter-desktop"
                    q={q}
                    status={status}
                    tag={tag}
                    sort={sort}
                    className="hidden w-full min-w-0 gap-3 xl:grid xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]"
                />

                {hasFilters ? (
                    <Link href="/administration/newsletter" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        <X className="h-4 w-4" aria-hidden="true" />Réinitialiser les filtres
                    </Link>
                ) : null}
            </AdminToolbar>

            <AdminPanel title="Contacts" description="Les cinq statuts reflètent directement l’état conservé en base." contentClassName="p-0 sm:p-0">
                {docs.length ? (
                    <>
                        <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:hidden">
                            {docs.map((contact) => (
                                <li key={contact.id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="break-all text-sm font-semibold text-foreground">{contact.email}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Ajouté le {formatDate(contact.createdAt)} · {contact.source ?? 'site'}</p>
                                        </div>
                                        <NewsletterStatusBadge status={contact.status} />
                                    </div>
                                    <div className="mt-4 min-h-6">
                                        {contact.tags.length ? (
                                            <div className="flex flex-wrap gap-1.5">{contact.tags.map((contactTag) => <Badge key={contactTag} variant="outline">{contactTag}</Badge>)}</div>
                                        ) : <span className="text-xs text-muted-foreground">Aucun tag</span>}
                                    </div>
                                    <div className="mt-4 border-t border-border pt-3">
                                        <NewsletterContactActions email={contact.email} unsubscribeToken={contact.unsubToken} />
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="hidden overflow-x-auto xl:block">
                            <table className="w-full min-w-[64rem] text-sm">
                                <thead className="bg-surface-muted text-muted-foreground">
                                    <tr>
                                        <th scope="col" className="px-5 py-3 text-left font-medium">Email</th>
                                        <th scope="col" className="px-5 py-3 text-left font-medium">Statut</th>
                                        <th scope="col" className="px-5 py-3 text-left font-medium">Tags</th>
                                        <th scope="col" className="px-5 py-3 text-left font-medium">Source</th>
                                        <th scope="col" className="px-5 py-3 text-left font-medium">Créé le</th>
                                        <th scope="col" className="px-5 py-3 text-right font-medium">Action sûre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map((contact) => (
                                        <tr key={contact.id} className="border-t border-border align-middle hover:bg-surface-muted/40">
                                            <td className="max-w-xs break-all px-5 py-3 font-medium text-foreground">{contact.email}</td>
                                            <td className="px-5 py-3"><NewsletterStatusBadge status={contact.status} /></td>
                                            <td className="max-w-48 px-5 py-3 text-muted-foreground">{contact.tags.length ? contact.tags.join(', ') : '—'}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{contact.source ?? 'site'}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDate(contact.createdAt)}</td>
                                            <td className="px-5 py-3"><NewsletterContactActions email={contact.email} unsubscribeToken={contact.unsubToken} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="p-5">
                        <AdminStatePanel
                            kind="empty"
                            title={countAll === 0 ? 'Aucun contact newsletter' : 'Aucun résultat'}
                            description={countAll === 0 ? 'Les contacts apparaîtront ici après leur inscription.' : 'Modifiez la recherche, le statut ou le tag pour élargir les résultats.'}
                            icon={Search}
                        />
                    </div>
                )}
            </AdminPanel>

            {totalPages > 1 ? (
                <nav aria-label="Pagination des contacts" className="flex flex-wrap items-center justify-center gap-3">
                    <LinkButton href={pageHref(Math.max(1, page - 1))} variant="tertiary" disabled={page <= 1}>Précédent</LinkButton>
                    <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
                    <LinkButton href={pageHref(Math.min(totalPages, page + 1))} variant="tertiary" disabled={page >= totalPages}>Suivant</LinkButton>
                </nav>
            ) : null}

            <div id="compose" className="scroll-mt-24">
                <AdminPanel title="Préparer une campagne" description="Un test réussi et une revue explicite sont requis avant la diffusion globale.">
                    <ComposeSendForm />
                </AdminPanel>
            </div>
        </div>
    );
}

function NewsletterFiltersForm({ idPrefix, q, status, tag, sort, className }: { idPrefix: string; q: string; status: AdminNewsletterSearchParams['status']; tag: string; sort: AdminNewsletterSearchParams['sort']; className: string }) {
    return (
        <form method="get" className={className}>
            <FilterField id={`${idPrefix}-q`} label="Rechercher un contact">
                <input id={`${idPrefix}-q`} type="search" name="q" defaultValue={q} placeholder="email@example.com" className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20" />
            </FilterField>
            <FilterField id={`${idPrefix}-status`} label="Filtrer par statut">
                <select id={`${idPrefix}-status`} name="status" defaultValue={status} className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20">
                    <option value="all">Tous les statuts</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="pending">En attente</option>
                    <option value="unsubscribed">Désinscrits</option>
                    <option value="bounced">Rejetés</option>
                    <option value="complained">Plaintes</option>
                </select>
            </FilterField>
            <FilterField id={`${idPrefix}-tag`} label="Filtrer par tag">
                <input id={`${idPrefix}-tag`} name="tag" defaultValue={tag} placeholder="Tag exact" className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20" />
            </FilterField>
            <FilterField id={`${idPrefix}-sort`} label="Trier les contacts">
                <select id={`${idPrefix}-sort`} name="sort" defaultValue={sort} className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20">
                    <option value="recent">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="alphaAsc">A → Z</option>
                    <option value="alphaDesc">Z → A</option>
                </select>
            </FilterField>
            <input type="hidden" name="page" value="1" />
            <Button type="submit" className="w-full xl:col-span-2 2xl:col-span-1 2xl:w-auto">Appliquer</Button>
        </form>
    );
}

function FilterField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="sr-only">{label}</label>
            {children}
        </div>
    );
}

function NewsletterStatusBadge({ status }: { status?: string }) {
    const variants = {
        confirmed: ['Confirmé', 'success'],
        pending: ['En attente', 'warning'],
        unsubscribed: ['Désinscrit', 'outline'],
        bounced: ['Rejeté', 'danger'],
        complained: ['Plainte', 'danger'],
    } as const;
    const [label, variant] = variants[status as keyof typeof variants] ?? [status || 'Inconnu', 'outline'];
    return <Badge variant={variant}>{label}</Badge>;
}

function createFilterParams({ q, status, tag, sort }: { q: string; status: AdminNewsletterSearchParams['status']; tag: string; sort: AdminNewsletterSearchParams['sort'] }) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status && status !== 'all') params.set('status', status);
    if (tag) params.set('tag', tag);
    if (sort && sort !== 'recent') params.set('sort', sort);
    return params;
}

function formatDate(value: Date | string | null | undefined) {
    return value ? new Date(value).toLocaleDateString('fr-FR') : '—';
}
