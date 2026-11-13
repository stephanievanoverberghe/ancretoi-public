import 'server-only';

import { ArrowRight, BarChart3, CheckCircle2, Clock3, Download, Filter, List, PenLine, StickyNote, Table2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Alert, Badge, Button, LinkButton, SearchInput } from '@/components/ui';
import { espaceRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import { LearnerEmptyState, LearnerPage, StatTile } from '@/features/espace/components';
import { getLearnerNotesData, type LearnerDayState } from '@/server/journal/notes.service';

import { formatJournalDate, formatProgrammeLabel } from './journal.utils';
import { WritingSpaceNav } from './WritingSpaceNav';

type SearchParams = Record<string, string | string[] | undefined>;
type NotesView = 'timeline' | 'table' | 'stats';

function normalizeView(value: string | undefined): NotesView {
    if (value === 'table' || value === 'stats') return value;
    return 'timeline';
}

function getFreeNote(state: LearnerDayState) {
    return state.data?.notes?.trim() ?? '';
}

function buildNotesUrl(input: { view?: NotesView; program?: string; query?: string }) {
    const params = new URLSearchParams();
    if (input.view && input.view !== 'timeline') params.set('tab', input.view);
    if (input.program) params.set('program', input.program);
    if (input.query) params.set('q', input.query);
    const query = params.toString();
    return query ? `${espaceRoutes.notes}?${query}` : espaceRoutes.notes;
}

export async function NotesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    const params = (await searchParams) ?? {};
    const programFilter = typeof params.program === 'string' ? params.program : undefined;
    const query = typeof params.q === 'string' ? params.q.trim() : '';
    const view = normalizeView(typeof params.tab === 'string' ? params.tab : undefined);
    const { userFound, states, programOptions } = await getLearnerNotesData(espaceRoutes.notes, programFilter);

    if (!userFound) {
        return (
            <LearnerPage size="narrow" spacing="none">
                <Alert variant="warning" title="Tes notes libres sont momentanément indisponibles" className="rounded-3xl p-6 sm:p-8">
                    Nous n’avons pas retrouvé ton profil. Tes notes ne sont pas supprimées : reconnecte-toi ou reviens à ton espace.
                </Alert>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <LinkButton href={espaceRoutes.root} className="w-full sm:w-fit">
                        Revenir à mon espace
                    </LinkButton>
                    <LinkButton href={publicRoutes.aide} variant="tertiary" className="w-full sm:w-fit">
                        Consulter l’aide
                    </LinkButton>
                </div>
            </LearnerPage>
        );
    }

    const normalizedQuery = query.toLocaleLowerCase('fr-FR');
    const filtered = normalizedQuery
        ? states.filter((state) => getFreeNote(state).toLocaleLowerCase('fr-FR').includes(normalizedQuery))
        : states;
    const ordered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const practicedCount = filtered.filter((state) => state.practiced).length;
    const completedCount = filtered.filter((state) => state.completed).length;
    const filterCount = Number(Boolean(programFilter)) + Number(Boolean(query));
    const hasAnyNote = programOptions.length > 0;
    const exportQuery = `${programFilter ? `&program=${encodeURIComponent(programFilter)}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`;

    return (
        <LearnerPage size="wide" spacing="relaxed">
            <header className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div>
                        <Badge variant="outline">Notes libres</Badge>
                        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                            Tes mots, sans consigne
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Retrouve uniquement les notes écrites librement pendant tes journées. Le journal guidé reste à côté, avec les réponses aux exercices.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <LinkButton href={`/api/notes/export?format=json&scope=notes${exportQuery}`} variant="tertiary" size="sm" className="w-full sm:w-fit">
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Export JSON
                        </LinkButton>
                        <LinkButton href={`/api/notes/export?format=pdf&scope=notes${exportQuery}`} variant="tertiary" size="sm" className="w-full sm:w-fit">
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Export PDF
                        </LinkButton>
                    </div>
                </div>
            </header>

            <WritingSpaceNav active="notes" />

            <section aria-label="Recherche et affichage des notes" className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
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
                    <NotesFilterForm
                        idSuffix="mobile"
                        query={query}
                        programFilter={programFilter}
                        programOptions={programOptions}
                        view={view}
                        className="mt-3 grid gap-3"
                    />
                </details>

                <NotesFilterForm
                    idSuffix="desktop"
                    query={query}
                    programFilter={programFilter}
                    programOptions={programOptions}
                    view={view}
                    className="hidden gap-3 min-[1400px]:grid min-[1400px]:grid-cols-[minmax(14rem,0.7fr)_minmax(18rem,1.3fr)_auto_auto]"
                />

                {filterCount > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{filtered.length} {filtered.length > 1 ? 'notes trouvées' : 'note trouvée'}</span>
                        {programFilter ? <Badge variant="outline">{formatProgrammeLabel(programFilter)}</Badge> : null}
                        {query ? <Badge variant="outline">« {query} »</Badge> : null}
                    </div>
                ) : null}

                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Mode d’affichage">
                    <ViewLink href={buildNotesUrl({ view: 'timeline', program: programFilter, query })} active={view === 'timeline'} icon={List}>
                        Chronologie
                    </ViewLink>
                    <ViewLink href={buildNotesUrl({ view: 'table', program: programFilter, query })} active={view === 'table'} icon={Table2} className="hidden min-[1400px]:inline-flex">
                        Tableau
                    </ViewLink>
                    <ViewLink href={buildNotesUrl({ view: 'stats', program: programFilter, query })} active={view === 'stats'} icon={BarChart3}>
                        Repères
                    </ViewLink>
                    <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                        {filtered.length} {filtered.length > 1 ? 'notes' : 'note'}
                    </span>
                </div>
            </section>

            {filtered.length === 0 ? (
                <NotesEmptyState hasAnyNote={hasAnyNote} hasFilters={filterCount > 0} />
            ) : view === 'stats' ? (
                <NotesStats total={filtered.length} practiced={practicedCount} completed={completedCount} />
            ) : view === 'table' ? (
                <>
                    <div className="min-[1400px]:hidden">
                        <NotesTimeline states={ordered} />
                    </div>
                    <div className="hidden min-[1400px]:block">
                        <NotesTable states={ordered} />
                    </div>
                </>
            ) : (
                <NotesTimeline states={ordered} />
            )}
        </LearnerPage>
    );
}

function NotesFilterForm({
    idSuffix,
    query,
    programFilter,
    programOptions,
    view,
    className,
}: {
    idSuffix: string;
    query: string;
    programFilter?: string;
    programOptions: string[];
    view: NotesView;
    className: string;
}) {
    return (
        <form action={espaceRoutes.notes} className={className}>
            <label htmlFor={`notes-program-${idSuffix}`} className="sr-only">Programme</label>
            <select
                id={`notes-program-${idSuffix}`}
                name="program"
                defaultValue={programFilter ?? ''}
                className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
            >
                <option value="">Tous les programmes</option>
                {programOptions.map((program) => (
                    <option key={program} value={program}>{formatProgrammeLabel(program)}</option>
                ))}
            </select>

            <label htmlFor={`notes-query-${idSuffix}`} className="sr-only">Rechercher dans mes notes libres</label>
            <SearchInput
                id={`notes-query-${idSuffix}`}
                name="q"
                defaultValue={query}
                placeholder="Rechercher dans mes notes…"
            />
            {view !== 'timeline' ? <input type="hidden" name="tab" value={view} /> : null}
            <Button type="submit" variant="secondary" className="w-full min-[1400px]:w-fit">Filtrer</Button>
            <LinkButton href={espaceRoutes.notes} variant="tertiary" className="w-full min-[1400px]:w-fit">Effacer</LinkButton>
        </form>
    );
}

function ViewLink({ href, active, icon: Icon, className, children }: { href: string; active: boolean; icon: typeof List; className?: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`${className ?? 'inline-flex'} min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                active ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground'
            }`}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {children}
        </Link>
    );
}

function NotesTimeline({ states }: { states: LearnerDayState[] }) {
    return (
        <ol className="grid gap-5 sm:gap-6">
            {states.map((state) => (
                <li key={`${state.programSlug}-${state.day}`}>
                    <article className="rounded-3xl border border-border bg-surface p-6 sm:p-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{formatProgrammeLabel(state.programSlug)}</p>
                                <h2 className="mt-1 font-serif text-lg font-semibold text-foreground">Journée {state.day}</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {state.completed ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Terminée
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center gap-1">
                                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {formatJournalDate(state.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-surface-muted p-4 text-sm leading-relaxed text-foreground sm:text-base">
                            {getFreeNote(state)}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <LinkButton href={routeBuilders.formationJour(state.programSlug, state.day)} variant="tertiary" size="sm">
                                <PenLine className="h-4 w-4" aria-hidden="true" /> Modifier dans la journée
                            </LinkButton>
                        </div>
                    </article>
                </li>
            ))}
        </ol>
    );
}

function NotesTable({ states }: { states: LearnerDayState[] }) {
    return (
        <section aria-label="Tableau des notes libres" className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Programme</th>
                            <th className="px-4 py-3 font-semibold">Journée</th>
                            <th className="px-4 py-3 font-semibold">Note</th>
                            <th className="px-4 py-3 font-semibold">Mise à jour</th>
                            <th className="px-4 py-3"><span className="sr-only">Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {states.map((state) => (
                            <tr key={`${state.programSlug}-${state.day}`} className="border-t border-border align-top">
                                <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{formatProgrammeLabel(state.programSlug)}</td>
                                <td className="px-4 py-3 tabular-nums text-foreground">{state.day}</td>
                                <td className="max-w-xl px-4 py-3 text-muted-foreground"><p className="line-clamp-2">{getFreeNote(state)}</p></td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatJournalDate(state.updatedAt)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={routeBuilders.formationJour(state.programSlug, state.day)} className="font-medium text-primary hover:text-primary-hover">Ouvrir</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function NotesStats({ total, practiced, completed }: { total: number; practiced: number; completed: number }) {
    return (
        <section aria-labelledby="notes-stats-title" className="space-y-4">
            <div>
                <h2 id="notes-stats-title" className="font-serif text-xl font-semibold text-foreground">Quelques repères</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ces chiffres décrivent les notes affichées, sans analyser leur contenu.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <StatTile icon={StickyNote} label="Notes libres" value={total} />
                <StatTile icon={PenLine} label="Journées pratiquées" value={practiced} />
                <StatTile icon={CheckCircle2} label="Journées terminées" value={completed} />
            </div>
        </section>
    );
}

function NotesEmptyState({ hasAnyNote, hasFilters }: { hasAnyNote: boolean; hasFilters: boolean }) {
    const filteredEmpty = hasAnyNote && hasFilters;

    return (
        <LearnerEmptyState
            icon={StickyNote}
            title={filteredEmpty ? 'Aucune note ne correspond à ces filtres' : 'Aucune note libre pour le moment'}
            description={
                filteredEmpty
                    ? 'Essaie un autre mot ou affiche tous les programmes pour retrouver tes écrits.'
                    : 'Pendant une journée de formation, ouvre « Ajouter une note » pour écrire librement. Elle apparaîtra ensuite ici.'
            }
            actions={
                filteredEmpty ? (
                    <LinkButton href={espaceRoutes.notes} variant="tertiary">Effacer les filtres</LinkButton>
                ) : (
                    <LinkButton href={espaceRoutes.continuer} size="lg">
                        Continuer mon parcours <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </LinkButton>
                )
            }
        />
    );
}
