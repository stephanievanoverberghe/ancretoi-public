import { ArrowRight, BookOpenCheck, CalendarDays, Compass, GaugeCircle, GraduationCap, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge, LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes, reset7Routes } from '@/config/routes';
import { espaceContent } from '@/content/espace';
import {
    CourseCard,
    LearnerEmptyState,
    LearnerPage,
    LearnerSectionHeader,
    StatTile,
    StreakHeatmapClient,
} from '@/features/espace/components';

export type EspaceDashboardRow = {
    programSlug: string;
    title: string;
    coverUrl: string | null;
    coverAlt: string | null;
    level: 'Basique' | 'Cible' | 'Premium' | null;
    unitsTotal: number;
    unitsDone: number;
    percent: number;
    currentDay: number;
    status: 'active' | 'completed' | 'paused';
    resumeHref: string;
    lastUpdatedAt: string | null;
};

type EspaceDashboardPageProps = {
    displayName: string;
    rows: EspaceDashboardRow[];
};

function pickResume(rows: EspaceDashboardRow[]): EspaceDashboardRow | null {
    const mostRecent = (candidates: EspaceDashboardRow[]) =>
        [...candidates].sort((a, b) =>
            (b.lastUpdatedAt ?? '').localeCompare(a.lastUpdatedAt ?? ''),
        )[0] ?? null;

    return (
        mostRecent(rows.filter((row) => row.status === 'active')) ??
        mostRecent(rows.filter((row) => row.status === 'paused')) ??
        mostRecent(rows.filter((row) => row.status === 'completed')) ??
        null
    );
}

export function EspaceDashboardPage({ displayName, rows }: EspaceDashboardPageProps) {
    if (rows.length === 0) {
        return <NoProgramAccessState />;
    }

    const resume = pickResume(rows);
    const resumeDone = resume ? resume.percent >= 100 || resume.status === 'completed' : false;

    const welcome = resume ? (resumeDone ? espaceContent.dashboard.welcome.completed : resume.unitsDone === 0 ? espaceContent.dashboard.welcome.fresh : espaceContent.dashboard.welcome.inProgress) : espaceContent.dashboard.welcome.fresh;
    const heroHref = resume?.resumeHref ?? publicRoutes.programmes;
    const heroLabel = resume
        ? resumeDone
            ? resume.programSlug === reset7Routes.programmeSlug
                ? espaceContent.courseCard.completedLabel
                : 'Revoir le parcours'
            : resume.status === 'paused'
              ? 'Reprendre en douceur'
              : resume.unitsDone === 0
                ? espaceContent.courseCard.startLabel
                : espaceContent.courseCard.continueLabel
        : espaceContent.noAccess.primaryCta;

    const activeCount = rows.filter((r) => r.status === 'active').length;
    const avgPercent = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0;
    const totalUnitsDone = rows.reduce((sum, row) => sum + row.unitsDone, 0);
    const lastActivityIso = rows[0]?.lastUpdatedAt ?? null;
    const heroTitle = resumeDone
        ? 'Ton bilan est prêt'
        : resume && resume.unitsDone > 0
          ? `Jour ${resume.currentDay} · ${resume.title}`
          : resume?.title ?? '';

    return (
        <LearnerPage size="wide" spacing="relaxed">
            {/* Le prochain rituel reste le point d'entrée principal de la page. */}
            <section
                aria-labelledby="dashboard-next-ritual"
                className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-surface-raised p-6 shadow-elevated sm:p-8 lg:p-10"
            >
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,21rem)] xl:items-stretch xl:gap-10">
                    <div className="min-w-0">
                        <Badge variant={resumeDone ? 'success' : 'secondary'}>
                            {resumeDone ? 'Parcours accompli' : 'Prochain rituel'}
                        </Badge>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Bonjour {displayName}
                        </p>
                        <h1 id="dashboard-next-ritual" className="mt-2 max-w-3xl font-serif text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
                            {heroTitle}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {welcome}
                        </p>

                        {resume ? (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <LinkButton href={heroHref} size="lg" className="w-full sm:w-fit">
                                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                                    {heroLabel}
                                </LinkButton>
                                <p className="text-sm tabular-nums text-muted-foreground">
                                    {resume.unitsDone}/{resume.unitsTotal} journées · {resume.percent}%
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="relative min-h-52 overflow-hidden rounded-3xl border border-border/70 bg-surface-muted shadow-soft sm:min-h-64">
                        <Image
                            src="/images/espace/rituel-quotidien.webp"
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 1279px) 100vw, 336px"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" aria-hidden="true" />
                        {resume ? (
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-surface/90 px-3 py-2 shadow-soft backdrop-blur">
                                <span className="text-xs font-medium text-foreground">Progression du parcours</span>
                                <span className="text-sm font-semibold tabular-nums text-primary">{resume.percent}%</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* Les statistiques restent des repères secondaires. */}
            <section aria-label="Mes repères" className="rounded-3xl border border-border bg-surface-muted/40 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile className="bg-surface/70 shadow-none" icon={GraduationCap} label={espaceContent.dashboard.stats.active} value={activeCount} />
                    <StatTile className="bg-surface/70 shadow-none" icon={GaugeCircle} label={espaceContent.dashboard.stats.progress} value={`${avgPercent}%`} />
                    <StatTile className="bg-surface/70 shadow-none" icon={BookOpenCheck} label={espaceContent.dashboard.stats.daysDone} value={totalUnitsDone} />
                    <StatTile className="bg-surface/70 shadow-none" icon={CalendarDays} label={espaceContent.dashboard.stats.lastActivity} value={lastActivityIso ? new Date(lastActivityIso).toLocaleDateString('fr-FR') : '—'} />
                </div>
            </section>

            {/* Mes formations. */}
            <section aria-labelledby="dashboard-courses">
                <LearnerSectionHeader
                    id="dashboard-courses"
                    title={espaceContent.dashboard.courses.title}
                    description={espaceContent.dashboard.courses.description}
                    action={
                        <Link
                            href={espaceRoutes.formations}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover"
                        >
                            Tout voir
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    }
                />
                <ul className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-2 2xl:gap-6">
                    {rows.map((row) => (
                        <li key={row.programSlug} className="min-w-0">
                            <CourseCard course={row} variant="compact" />
                        </li>
                    ))}
                </ul>
            </section>

            {/* Assiduité réelle (30 jours). */}
            <section aria-labelledby="dashboard-streak">
                <LearnerSectionHeader id="dashboard-streak" title={espaceContent.dashboard.streak.title} description={espaceContent.dashboard.streak.description} />
                <div className="mt-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
                    <StreakHeatmapClient days={30} size={14} />
                </div>
            </section>
        </LearnerPage>
    );
}

function NoProgramAccessState() {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <LearnerEmptyState
                icon={Compass}
                title={espaceContent.noAccess.title}
                description={espaceContent.noAccess.description}
                actions={
                    <>
                        <LinkButton href={publicRoutes.programmes} size="lg" className="w-full sm:w-fit">
                            {espaceContent.noAccess.primaryCta}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </LinkButton>
                        <LinkButton href={publicRoutes.quizBoussole} variant="tertiary" size="lg" className="w-full sm:w-fit">
                            {espaceContent.noAccess.quizCta}
                        </LinkButton>
                    </>
                }
            />
            <p className="mt-5 text-center text-sm text-muted-foreground">
                {espaceContent.noAccess.helpHint}{' '}
                <Link href={publicRoutes.contact} className="font-medium text-primary underline underline-offset-2 hover:no-underline">
                    {espaceContent.noAccess.helpCta}
                </Link>
            </p>
        </div>
    );
}
