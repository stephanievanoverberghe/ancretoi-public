import 'server-only';

import { ArrowRight, BookHeart, CheckCircle2, PenLine, StickyNote } from 'lucide-react';
import Link from 'next/link';

import { Alert, Badge, LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import { LearnerEmptyState, LearnerPage } from '@/features/espace/components';
import { getLearnerJournalData } from '@/server/journal/notes.service';

import { formatJournalDate, formatJournalFieldLabel, formatProgrammeLabel } from './journal.utils';
import { WritingSpaceNav } from './WritingSpaceNav';

export async function JournalPage() {
    const data = await getLearnerJournalData(espaceRoutes.journal);

    if (!data.userFound) {
        return (
            <LearnerPage size="narrow" spacing="none">
                <Alert variant="warning" title="Ton journal guidé est momentanément indisponible" className="rounded-3xl p-6 sm:p-8">
                    Nous n’avons pas retrouvé ton profil. Tes écrits ne sont pas supprimés : reconnecte-toi ou reviens à ton espace.
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

    return (
        <LearnerPage size="wide" spacing="relaxed">
            <header className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div>
                        <Badge variant="secondary">Journal guidé</Badge>
                        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                            Les traces de ton parcours
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Retrouve les réponses écrites pendant tes pratiques. Elles restent organisées par journée pour t’aider à observer ton chemin sans te juger.
                        </p>
                    </div>

                    <LinkButton href={espaceRoutes.notes} variant="tertiary" className="w-full lg:w-fit">
                        <StickyNote className="h-4 w-4" aria-hidden="true" />
                        Ouvrir mes notes libres
                    </LinkButton>
                </div>

                <div className="relative mt-5 flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                        {data.states.length} {data.states.length > 1 ? 'journées écrites' : 'journée écrite'}
                    </span>
                    <span className="rounded-full bg-success/10 px-3 py-1.5 text-success">
                        {data.completedCount} {data.completedCount > 1 ? 'journées validées' : 'journée validée'}
                    </span>
                </div>
            </header>

            <WritingSpaceNav active="journal" />

            {data.states.length === 0 ? (
                <LearnerEmptyState
                    icon={BookHeart}
                    title="Ton journal guidé est prêt"
                    description="Tes réponses apparaîtront ici après ta première pratique. Tu peux commencer par le prochain petit pas qui te convient."
                    actions={
                        <LinkButton href={espaceRoutes.continuer} size="lg">
                            Continuer mon parcours
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </LinkButton>
                    }
                />
            ) : (
                <ol className="grid gap-5 sm:gap-6">
                    {[...data.states].reverse().map((state) => {
                        const entries = Object.entries(state.data ?? {});
                        const dayHref = routeBuilders.formationJour(state.programSlug, state.day);

                        return (
                            <li key={`${state.programSlug}-${state.day}`}>
                                <article className="rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-primary/25 sm:p-7">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                                {formatProgrammeLabel(state.programSlug)}
                                            </p>
                                            <h2 className="mt-1 font-serif text-xl font-semibold text-foreground">
                                                Journée {state.day}
                                            </h2>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Mis à jour le {formatJournalDate(state.updatedAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {state.completed ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Validée
                                                </span>
                                            ) : null}
                                            <LinkButton href={dayHref} variant="tertiary" size="sm">
                                                <PenLine className="h-4 w-4" aria-hidden="true" />
                                                Compléter
                                            </LinkButton>
                                        </div>
                                    </div>

                                    {entries.length > 0 ? (
                                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                                            {entries.map(([key, value]) => (
                                                <div key={key} className="rounded-2xl bg-surface-muted p-4">
                                                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {formatJournalFieldLabel(key)}
                                                    </dt>
                                                    <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                                        {value}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : (
                                        <p className="mt-5 rounded-2xl bg-surface-muted p-4 text-sm leading-relaxed text-muted-foreground">
                                            La pratique est enregistrée. Les réponses guidées peuvent encore être complétées lorsque tu seras disponible.
                                        </p>
                                    )}
                                </article>
                            </li>
                        );
                    })}
                </ol>
            )}

            <p className="text-center text-sm text-muted-foreground">
                Besoin d’écrire sans consigne ?{' '}
                <Link href={espaceRoutes.notes} className="font-medium text-primary underline underline-offset-4 hover:no-underline">
                    Va dans tes notes libres
                </Link>
                .
            </p>
        </LearnerPage>
    );
}
