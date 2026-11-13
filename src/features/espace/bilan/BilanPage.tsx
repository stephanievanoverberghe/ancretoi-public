import 'server-only';

import {
    ArrowRight,
    BookOpenCheck,
    CalendarDays,
    CheckCircle2,
    FileDown,
    GaugeCircle,
    GraduationCap,
    LockKeyhole,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge, Card, LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes, reset7Routes, routeBuilders } from '@/config/routes';
import {
    CourseProgress,
    LearnerPage,
    LearnerSectionHeader,
    StatTile,
    StreakHeatmapClient,
} from '@/features/espace/components';
import { getLearnerBilanDataForUserId, type LearnerBilanRow } from '@/server/apprentissage/bilan.service';

import SummaryBarsClient from './SummaryBarsClient';

const statusCopy: Record<LearnerBilanRow['status'], string> = {
    active: 'En cours',
    paused: 'En pause',
    completed: 'Terminé',
};

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString('fr-FR') : '—';
}

export async function BilanPage({ learnerUserId }: { learnerUserId: string }) {
    const bilan = await getLearnerBilanDataForUserId(learnerUserId);

    const {
        rows,
        avgPercent,
        totalUnitsDone,
        lastActivityIso,
        bilanMode,
        canAccessPlan,
        reset7Progress,
    } = bilan;
    const isFinal = bilanMode === 'final';
    const reset7Href = reset7Progress?.resumeHref ?? routeBuilders.programme(reset7Routes.programmeSlug);
    const heroImage = isFinal
        ? '/images/espace/bilan-accomplissement.webp'
        : '/images/espace/reset-7-studio.webp';

    return (
        <LearnerPage size="wide" spacing="relaxed">
            <section
                aria-labelledby="bilan-title"
                className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-surface-raised p-6 shadow-elevated sm:p-8 lg:p-10"
            >
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,21rem)] xl:items-stretch xl:gap-10">
                    <div>
                        <Badge variant={isFinal ? 'success' : 'secondary'}>
                            {isFinal ? 'Bilan final' : 'Aperçu du bilan'}
                        </Badge>
                        <h1 id="bilan-title" className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                            {isFinal ? 'Ton parcours RESET-7 est accompli' : 'Tes repères prennent forme'}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {isFinal
                                ? 'Retrouve ici ta progression complète et ouvre la suite de ton parcours.'
                                : 'Cet aperçu évolue avec chaque journée complétée. Ton bilan final et le guide 30 jours se débloquent après RESET-7.'}
                        </p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                            <LinkButton
                                href={canAccessPlan ? espaceRoutes.plan30Jours : reset7Href}
                                size="lg"
                                className="w-full sm:w-fit"
                            >
                                {canAccessPlan ? (
                                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                )}
                                {canAccessPlan
                                    ? 'Ouvrir le guide 30 jours'
                                    : reset7Progress
                                      ? 'Continuer RESET-7'
                                      : 'Découvrir RESET-7'}
                            </LinkButton>
                            <LinkButton href={espaceRoutes.root} variant="tertiary" size="lg" className="w-full sm:w-fit">
                                Retour à mon espace
                            </LinkButton>
                        </div>
                    </div>

                    <div className="relative min-h-52 overflow-hidden rounded-3xl border border-border/70 bg-surface-muted shadow-soft sm:min-h-64">
                        <Image
                            src={heroImage}
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 1279px) 100vw, 336px"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" aria-hidden="true" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-surface/90 px-3 py-2 shadow-soft backdrop-blur">
                            <span className="text-xs font-medium text-foreground">Progression moyenne</span>
                            <span className="text-sm font-semibold tabular-nums text-primary">{avgPercent}%</span>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-label="Repères du bilan" className="rounded-3xl border border-border bg-surface-muted/40 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile className="bg-surface/70 shadow-none" icon={GraduationCap} label="Parcours suivis" value={rows.length} />
                    <StatTile className="bg-surface/70 shadow-none" icon={BookOpenCheck} label="Journées complétées" value={totalUnitsDone} />
                    <StatTile className="bg-surface/70 shadow-none" icon={CalendarDays} label="Dernière activité" value={formatDate(lastActivityIso)} />
                    <StatTile className="bg-surface/70 shadow-none" icon={GaugeCircle} label="Progression moyenne" value={`${avgPercent}%`} />
                </div>
            </section>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-10">
                <div className="space-y-10">
                    <section aria-labelledby="bilan-progress-title">
                        <LearnerSectionHeader
                            id="bilan-progress-title"
                            title="Progression par parcours"
                            description="Une lecture simple des journées déjà intégrées."
                        />
                        <Card className="mt-5 rounded-3xl p-6 sm:p-7">
                            <SummaryBarsClient
                                items={rows.map((row) => ({
                                    slug: row.programSlug,
                                    title: row.title,
                                    percent: row.percent,
                                }))}
                            />
                        </Card>
                    </section>

                    <section aria-labelledby="bilan-programmes-title">
                        <LearnerSectionHeader
                            id="bilan-programmes-title"
                            title="Détail de tes parcours"
                            description="Chaque carte reprend uniquement la progression enregistrée."
                        />
                        {rows.length > 0 ? (
                            <ul className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-6">
                                {rows.map((row) => (
                                    <li key={row.programSlug}>
                                        <Card className="flex h-full flex-col rounded-3xl p-6 sm:p-7">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        {row.level ?? 'Parcours guidé'}
                                                    </p>
                                                    <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-foreground">
                                                        {row.title}
                                                    </h3>
                                                </div>
                                                <Badge variant={row.status === 'completed' ? 'success' : row.status === 'paused' ? 'outline' : 'info'}>
                                                    {statusCopy[row.status]}
                                                </Badge>
                                            </div>

                                            <CourseProgress
                                                className="mt-5"
                                                percent={row.percent}
                                                done={row.unitsDone}
                                                total={row.unitsTotal}
                                            />

                                            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                                {row.status === 'completed' ? (
                                                    <LinkButton href={routeBuilders.formation(row.programSlug)} size="sm" className="w-full">
                                                        Revoir le parcours
                                                    </LinkButton>
                                                ) : (
                                                    <LinkButton href={row.resumeHref} size="sm" className="w-full">
                                                        Reprendre
                                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                    </LinkButton>
                                                )}
                                                <LinkButton
                                                    href={routeBuilders.programme(row.programSlug)}
                                                    variant="tertiary"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    Voir le programme
                                                </LinkButton>
                                            </div>
                                        </Card>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Card variant="muted" className="mt-4 rounded-3xl p-5 text-sm text-muted-foreground">
                                Aucun parcours suivi pour le moment.
                            </Card>
                        )}
                    </section>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-24">
                    <Card className="rounded-3xl p-6">
                        <div className="flex items-start gap-3">
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${canAccessPlan ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`} aria-hidden="true">
                                {canAccessPlan ? <CheckCircle2 className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
                            </span>
                            <div>
                                <h2 className="font-serif text-lg font-semibold text-foreground">Guide 30 jours</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {canAccessPlan
                                        ? 'Ton guide est maintenant disponible.'
                                        : 'Un aperçu utile reste accessible avant sa disponibilité complète.'}
                                </p>
                            </div>
                        </div>
                        {reset7Progress ? (
                            <CourseProgress
                                className="mt-4"
                                percent={reset7Progress.percent}
                                done={reset7Progress.unitsDone}
                                total={reset7Progress.unitsTotal}
                            />
                        ) : null}
                        <LinkButton href={espaceRoutes.plan30Jours} variant="tertiary" size="sm" className="mt-4 w-full">
                            {canAccessPlan ? 'Ouvrir le guide' : 'Voir l’aperçu'}
                        </LinkButton>
                    </Card>

                    <Card className="rounded-3xl p-6">
                        <h2 className="font-serif text-lg font-semibold text-foreground">Activité réelle · 90 jours</h2>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Un repère correspond à un jour d’activité enregistré.
                        </p>
                        <div className="mt-4">
                            <StreakHeatmapClient days={90} size={10} />
                        </div>
                    </Card>

                    <Card className="rounded-3xl p-6">
                        <h2 className="font-serif text-lg font-semibold text-foreground">Mes exports</h2>
                        <div className="mt-3 grid gap-2">
                            <Link
                                href="/api/notes/export?format=json"
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                            >
                                <FileDown className="h-4 w-4 text-primary" aria-hidden="true" />
                                Journal · JSON
                            </Link>
                            <Link
                                href="/api/notes/export?format=pdf"
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                            >
                                <FileDown className="h-4 w-4 text-primary" aria-hidden="true" />
                                Journal · PDF
                            </Link>
                        </div>
                    </Card>

                    <Link
                        href={publicRoutes.programmes}
                        className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Explorer les programmes
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </aside>
            </div>
        </LearnerPage>
    );
}
