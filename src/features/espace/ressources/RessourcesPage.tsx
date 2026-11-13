import 'server-only';

import { ArrowRight, BookOpen, Dumbbell, ExternalLink, Filter, Headphones, PlayCircle, Puzzle, Timer } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Alert, Badge, Button, LinkButton, SearchInput } from '@/components/ui';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { LearnerEmptyState, LearnerPage } from '@/features/espace/components';
import { getLearnerResourcesData, type LearnerResource, type LearnerResourceKind } from '@/server/apprentissage/resources.service';
import type { ComponentType, SVGProps } from 'react';

type SearchParams = Record<string, string | string[] | undefined>;
type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type ResourceSort = 'recent' | 'alpha' | 'duration';

const kindMeta: Record<LearnerResourceKind, { label: string; singular: string; Icon: IconType }> = {
    article: { label: 'Articles', singular: 'Article', Icon: BookOpen },
    video: { label: 'Vidéos', singular: 'Vidéo', Icon: PlayCircle },
    audio: { label: 'Audios', singular: 'Audio', Icon: Headphones },
    exercise: { label: 'Exercices', singular: 'Exercice', Icon: Dumbbell },
    tool: { label: 'Outils', singular: 'Outil', Icon: Puzzle },
};

const sortOptions: Array<{ value: ResourceSort; label: string }> = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'alpha', label: 'Titre A–Z' },
    { value: 'duration', label: 'Durée' },
];

function isResourceKind(value: string | undefined): value is LearnerResourceKind {
    return Boolean(value && value in kindMeta);
}

function normalizeSort(value: string | undefined): ResourceSort {
    if (value === 'alpha' || value === 'duration') return value;
    return 'recent';
}

function toArray(value?: string | string[]) {
    if (!value) return [] as string[];
    return (Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean);
}

function buildResourcesUrl(input: { query?: string; kind?: LearnerResourceKind; tags?: string[]; sort?: ResourceSort }) {
    const params = new URLSearchParams();
    if (input.query) params.set('q', input.query);
    if (input.kind) params.set('kind', input.kind);
    for (const tag of input.tags ?? []) params.append('tag', tag);
    if (input.sort && input.sort !== 'recent') params.set('sort', input.sort);
    const query = params.toString();
    return query ? `${espaceRoutes.ressources}?${query}` : espaceRoutes.ressources;
}

export async function RessourcesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    const params = (await searchParams) ?? {};
    const query = typeof params.q === 'string' ? params.q.trim() : '';
    const kindValue = typeof params.kind === 'string' ? params.kind : undefined;
    const kind = isResourceKind(kindValue) ? kindValue : undefined;
    const tags = toArray(params.tag);
    const sort = normalizeSort(typeof params.sort === 'string' ? params.sort : undefined);
    const { userFound, items, allTags } = await getLearnerResourcesData(espaceRoutes.ressources, { q: query, kind, tags, sort });

    if (!userFound) {
        return (
            <LearnerPage size="narrow" spacing="none">
                <Alert variant="warning" title="La bibliothèque est momentanément indisponible" className="rounded-3xl p-6 sm:p-8">
                    Nous n’avons pas retrouvé ton profil. Tes accès ne sont pas supprimés : reconnecte-toi ou reviens à ton espace.
                </Alert>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <LinkButton href={espaceRoutes.root} className="w-full sm:w-fit">Revenir à mon espace</LinkButton>
                    <LinkButton href={publicRoutes.aide} variant="tertiary" className="w-full sm:w-fit">Consulter l’aide</LinkButton>
                </div>
            </LearnerPage>
        );
    }

    const filterCount = Number(Boolean(query)) + Number(Boolean(kind)) + tags.length + Number(sort !== 'recent');
    const availableTags = Array.from(new Set([...allTags, ...tags])).sort((a, b) => a.localeCompare(b, 'fr'));

    return (
        <LearnerPage size="wide" spacing="relaxed">
            <header className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

                <div className="relative">
                    <Badge variant="secondary">Bibliothèque</Badge>
                    <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">Des supports pour aller à ton rythme</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Articles, vidéos, audios, exercices et outils réunis au même endroit. Choisis ce qui t’aide aujourd’hui, sans devoir tout parcourir.
                    </p>
                    <p className="mt-4 text-xs font-medium text-muted-foreground">
                        {items.length} {items.length > 1 ? 'ressources affichées' : 'ressource affichée'}
                    </p>
                </div>
            </header>

            <section aria-label="Filtres de la bibliothèque" className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <details className="group min-[1400px]:hidden">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        <span className="inline-flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
                            Rechercher et filtrer
                        </span>
                        {filterCount > 0 ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{filterCount}</span>
                        ) : (
                            <span className="text-xs font-normal text-muted-foreground">Afficher</span>
                        )}
                    </summary>
                    <ResourceFilters
                        idSuffix="mobile"
                        query={query}
                        kind={kind}
                        tags={tags}
                        sort={sort}
                        availableTags={availableTags}
                        className="mt-3"
                    />
                </details>

                <ResourceFilters
                    idSuffix="desktop"
                    query={query}
                    kind={kind}
                    tags={tags}
                    sort={sort}
                    availableTags={availableTags}
                    className="hidden min-[1400px]:block"
                />

                {filterCount > 0 ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{items.length} résultat{items.length > 1 ? 's' : ''}</span>
                        {kind ? <Badge variant="outline">{kindMeta[kind].label}</Badge> : null}
                        {query ? <Badge variant="outline">« {query} »</Badge> : null}
                        {tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                    </div>
                ) : null}
            </section>

            {items.length === 0 ? (
                <ResourcesEmptyState hasFilters={filterCount > 0} />
            ) : (
                <section aria-label="Ressources disponibles">
                    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                        {items.map((item, index) => (
                            <li key={item._id || item.slug}>
                                <ResourceCard item={item} imagePriority={index === 0} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </LearnerPage>
    );
}

function ResourceFilters({
    idSuffix,
    query,
    kind,
    tags,
    sort,
    availableTags,
    className,
}: {
    idSuffix: string;
    query: string;
    kind?: LearnerResourceKind;
    tags: string[];
    sort: ResourceSort;
    availableTags: string[];
    className: string;
}) {
    return (
        <div className={className}>
            <form action={espaceRoutes.ressources} className="grid gap-3 min-[1400px]:grid-cols-[minmax(18rem,1fr)_13rem_12rem_auto_auto]">
                <label htmlFor={`resources-query-${idSuffix}`} className="sr-only">Rechercher une ressource</label>
                <SearchInput id={`resources-query-${idSuffix}`} name="q" defaultValue={query} placeholder="Rechercher une ressource…" />

                <label htmlFor={`resources-kind-${idSuffix}`} className="sr-only">Type de ressource</label>
                <select
                    id={`resources-kind-${idSuffix}`}
                    name="kind"
                    defaultValue={kind ?? ''}
                    className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                    <option value="">Tous les formats</option>
                    {(Object.keys(kindMeta) as LearnerResourceKind[]).map((value) => (
                        <option key={value} value={value}>{kindMeta[value].label}</option>
                    ))}
                </select>

                <label htmlFor={`resources-sort-${idSuffix}`} className="sr-only">Trier les ressources</label>
                <select
                    id={`resources-sort-${idSuffix}`}
                    name="sort"
                    defaultValue={sort}
                    className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                    {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {tags.map((tag) => <input key={tag} type="hidden" name="tag" value={tag} />)}
                <Button type="submit" variant="secondary" className="w-full min-[1400px]:w-fit">Appliquer</Button>
                <LinkButton href={espaceRoutes.ressources} variant="tertiary" className="w-full min-[1400px]:w-fit">Effacer</LinkButton>
            </form>

            {availableTags.length > 0 ? (
                <div className="mt-4 flex items-start gap-3">
                    <span className="mt-1 shrink-0 text-xs font-medium text-muted-foreground">Thèmes</span>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                            const active = tags.includes(tag);
                            const nextTags = active ? tags.filter((current) => current !== tag) : [...tags, tag];
                            return (
                                <Link
                                    key={tag}
                                    href={buildResourcesUrl({ query, kind, tags: nextTags, sort })}
                                    aria-current={active ? 'page' : undefined}
                                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                                    }`}
                                >
                                    #{tag}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function ResourceCard({ item, imagePriority }: { item: LearnerResource; imagePriority: boolean }) {
    const { Icon, singular } = kindMeta[item.kind];
    const href = getSafeResourceHref(item.url);
    const external = href?.startsWith('https://') ?? false;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-colors hover:border-primary/25">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                {item.coverUrl ? (
                    <Image
                        src={item.coverUrl}
                        alt=""
                        fill
                        priority={imagePriority}
                        className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                ) : (
                    <span className="grid h-full w-full place-items-center text-primary/70" aria-hidden="true"><Icon className="h-8 w-8" /></span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline"><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {singular}</Badge>
                    {typeof item.minutes === 'number' ? (
                        <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" aria-hidden="true" /> {item.minutes} min</span>
                    ) : null}
                </div>

                <h2 className="mt-3 font-serif text-lg font-semibold leading-snug text-foreground">{item.title}</h2>
                {item.description ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p> : null}

                {item.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] text-muted-foreground">#{tag}</span>)}
                        {item.tags.length > 4 ? <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] text-muted-foreground">+{item.tags.length - 4}</span> : null}
                    </div>
                ) : null}

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    {href ? (
                        <LinkButton href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} size="sm">
                            Ouvrir
                            {external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                        </LinkButton>
                    ) : (
                        <span aria-disabled="true" className="inline-flex min-h-9 items-center rounded-md bg-surface-muted px-3 text-sm font-medium text-muted-foreground">Bientôt disponible</span>
                    )}
                    <time dateTime={item.createdAt.toISOString()} className="text-xs text-muted-foreground">{item.createdAt.toLocaleDateString('fr-FR')}</time>
                </div>
            </div>
        </article>
    );
}

function ResourcesEmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <LearnerEmptyState
            icon={BookOpen}
            title={hasFilters ? 'Aucune ressource ne correspond' : 'La bibliothèque se prépare'}
            description={
                hasFilters
                    ? 'Modifie les filtres ou essaie un autre mot-clé pour élargir les résultats.'
                    : 'Les premiers supports seront ajoutés ici. Ton parcours et ton journal restent accessibles pendant ce temps.'
            }
            actions={
                hasFilters ? (
                    <LinkButton href={espaceRoutes.ressources} variant="tertiary">Effacer les filtres</LinkButton>
                ) : (
                    <LinkButton href={espaceRoutes.continuer} size="lg">Continuer mon parcours <ArrowRight className="h-4 w-4" aria-hidden="true" /></LinkButton>
                )
            }
        />
    );
}

function getSafeResourceHref(value: string | null) {
    if (!value) return null;
    if (value.startsWith('/') && !value.startsWith('//')) return value;

    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
}
