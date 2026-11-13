import {
    ArrowRight,
    CalendarCheck2,
    CheckCircle2,
    Compass,
    HeartHandshake,
    LockKeyhole,
    Repeat2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge, Card, LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes, reset7Routes, routeBuilders } from '@/config/routes';
import { CourseProgress, LearnerPage } from '@/features/espace/components';
import type { Reset7Progress } from '@/server/apprentissage/bilan.service';

const phases = [
    {
        days: 'Jours 1 à 7',
        title: 'Garder un seul rituel',
        description: 'Choisis la pratique la plus simple de RESET-7 et répète-la au même moment, même imparfaitement.',
        action: '10 minutes maximum',
        icon: Repeat2,
    },
    {
        days: 'Jours 8 à 14',
        title: 'Observer sans corriger',
        description: 'Note ce qui soutient ton énergie et ce qui la disperse. Une phrase dans le journal suffit.',
        action: '1 observation par jour',
        icon: Compass,
    },
    {
        days: 'Jours 15 à 21',
        title: 'Protéger ton rythme',
        description: 'Pose une limite concrète et garde un créneau de récupération dans ta semaine.',
        action: '1 limite + 1 pause',
        icon: HeartHandshake,
    },
    {
        days: 'Jours 22 à 30',
        title: 'Ancrer la suite',
        description: 'Choisis ce que tu continues, ce que tu allèges et le prochain pas réaliste pour le mois suivant.',
        action: '1 décision tenable',
        icon: CalendarCheck2,
    },
] as const;

type Plan30JoursPageProps = {
    canAccessPlan: boolean;
    reset7Progress: Reset7Progress | null;
};

export function Plan30JoursPage({ canAccessPlan, reset7Progress }: Plan30JoursPageProps) {
    const reset7Href = reset7Progress?.resumeHref ?? routeBuilders.programme(reset7Routes.programmeSlug);

    return (
        <LearnerPage size="wide" spacing="relaxed">
            <header className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-surface-raised p-6 shadow-elevated sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] xl:items-stretch xl:gap-9">
                    <div className="min-w-0">
                        <Badge variant={canAccessPlan ? 'success' : 'warning'}>
                            {canAccessPlan ? 'RESET-7 terminé' : 'Disponible après RESET-7'}
                        </Badge>
                        <div className="mt-5 flex items-start gap-4">
                            <span
                                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${canAccessPlan ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
                                aria-hidden="true"
                            >
                                {canAccessPlan ? <CheckCircle2 className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
                            </span>
                            <div className="min-w-0">
                                <h1 className="max-w-2xl font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                                    Ton guide d’ancrage sur 30 jours
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {canAccessPlan
                                        ? 'Garde ce qui fonctionne, avec un seul cap par semaine et la liberté de faire une pause.'
                                        : 'Le guide complet se débloque avec ton bilan final. D’ici là, retrouve ton avancée et les quatre repères qui t’attendent.'}
                                </p>
                            </div>
                        </div>

                        {canAccessPlan ? (
                            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                                <LinkButton href={espaceRoutes.journal} size="lg" className="w-full sm:w-fit">
                                    Ouvrir mon journal
                                </LinkButton>
                                <LinkButton href={espaceRoutes.bilan} variant="tertiary" size="lg" className="w-full sm:w-fit">
                                    Revoir mon bilan
                                </LinkButton>
                            </div>
                        ) : (
                            <div className="mt-7 max-w-xl rounded-3xl border border-border bg-surface/80 p-4 shadow-soft backdrop-blur sm:p-5">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-medium text-foreground">Progression RESET-7</span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {reset7Progress
                                            ? `${reset7Progress.unitsDone}/${reset7Progress.unitsTotal}`
                                            : `0/${reset7Routes.jours.length}`}
                                    </span>
                                </div>
                                <CourseProgress
                                    className="mt-3"
                                    percent={reset7Progress?.percent ?? 0}
                                    done={reset7Progress?.unitsDone ?? 0}
                                    total={reset7Progress?.unitsTotal ?? reset7Routes.jours.length}
                                    hideLabel
                                />
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <LinkButton href={reset7Href} size="md" className="w-full sm:w-fit">
                                        {reset7Progress ? 'Reprendre RESET-7' : 'Découvrir RESET-7'}
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </LinkButton>
                                    <LinkButton href={espaceRoutes.bilan} variant="tertiary" size="md" className="w-full sm:w-fit">
                                        Voir mon aperçu
                                    </LinkButton>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative min-h-56 overflow-hidden rounded-3xl border border-border/70 bg-surface-muted shadow-soft">
                        <Image
                            src="/images/espace/reset-7-studio.webp"
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 1279px) 100vw, 320px"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" aria-hidden="true" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-2xl border border-white/40 bg-surface/90 px-3 py-2 text-xs font-medium text-foreground shadow-soft backdrop-blur">
                            {canAccessPlan ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                            ) : (
                                <LockKeyhole className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            )}
                            <span>{canAccessPlan ? 'Guide disponible' : 'Guide en préparation'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <section aria-labelledby="plan-phases">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            {canAccessPlan ? 'Une étape à la fois' : 'Aperçu du guide'}
                        </p>
                        <h2 id="plan-phases" className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                            Les quatre phases
                        </h2>
                    </div>
                    <span className="hidden text-sm text-muted-foreground sm:block">30 jours · rythme libre</span>
                </div>

                <ol className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
                    {phases.map(({ days, title, description, action, icon: Icon }) => (
                        <li key={days}>
                            <Card
                                variant={canAccessPlan ? 'default' : 'muted'}
                                className="relative h-full overflow-hidden rounded-3xl p-6 sm:p-7"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
                                        {canAccessPlan ? <Icon className="h-5 w-5" /> : <LockKeyhole className="h-4 w-4" />}
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{days}</p>
                                        <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">{title}</h3>
                                    </div>
                                </div>

                                {canAccessPlan ? (
                                    <>
                                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
                                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            {action}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-4 text-sm text-muted-foreground">Cette phase devient disponible avec ton bilan final.</p>
                                )}
                            </Card>
                        </li>
                    ))}
                </ol>
            </section>

            <aside className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground">Ton repère de sécurité</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    Si une pratique augmente ton inconfort, arrête-toi, reviens à quelque chose de familier et demande de l’aide si nécessaire. Une pause ne supprime jamais ta progression.
                </p>
                <Link href={publicRoutes.aide} className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-primary underline underline-offset-4 hover:no-underline">
                    Consulter les ressources d’aide
                </Link>
            </aside>
        </LearnerPage>
    );
}
