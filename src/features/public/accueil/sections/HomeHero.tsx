import { ArrowRight, BookOpenCheck, CheckCircle2, NotebookPen } from 'lucide-react';
import Image from 'next/image';

import { Badge, Container, LinkButton } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { homeContent } from '@/content/home';

export type HomeHeroResumeView = {
    programSlug: string;
    title: string;
    coverUrl: string | null;
    percent: number;
    currentDay: number;
    unitsDone: number;
    unitsTotal: number;
    status: 'active' | 'completed' | 'paused';
    displayName: string;
};

type HomeHeroProps = {
    hasActiveProgram?: boolean;
    isAuthed?: boolean;
    resume?: HomeHeroResumeView | null;
};

export function HomeHero({ hasActiveProgram = false, isAuthed = false, resume = null }: HomeHeroProps) {
    const hero = homeContent.hero;
    const isCompleted = resume ? resume.percent >= 100 || resume.status === 'completed' : false;
    const primaryCta = hasActiveProgram ? (isCompleted ? hero.completedProgramCta : hero.activeProgramCta) : hero.primaryCta;
    const secondaryCta = !isAuthed ? hero.accountCta : hasActiveProgram ? hero.formationsCta : hero.espaceCta;

    return (
        <section className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden border-b border-border bg-background">
            <div className="pointer-events-none absolute -left-40 top-16 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            <Container
                size="xl"
                className="relative grid min-h-[clamp(42rem,86svh,58rem)] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.94fr)_minmax(25rem,0.76fr)] lg:gap-16 lg:py-20"
            >
                <div className="max-w-3xl lg:py-10">
                    <Badge variant="secondary" size="md">
                        {hero.eyebrow}
                    </Badge>

                    <h1 className="mt-6 max-w-3xl font-serif text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.94] tracking-[-0.035em] text-foreground">
                        {hero.titleLead}
                        <span className="mt-2 block text-secondary">{hero.titleHighlights[0]}</span>
                    </h1>

                    <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">{hero.description}</p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <LinkButton href={primaryCta.href} size="lg" className="w-full sm:w-fit">
                            {primaryCta.label}
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </LinkButton>
                        <LinkButton href={secondaryCta.href} variant="tertiary" size="lg" className="w-full sm:w-fit">
                            {secondaryCta.label}
                        </LinkButton>
                    </div>

                    <ul className="mt-10 grid max-w-2xl gap-3 border-t border-border pt-6 sm:grid-cols-3">
                        {hero.meta.map((item, index) => {
                            const Icon = index === 0 ? CheckCircle2 : index === 1 ? BookOpenCheck : NotebookPen;

                            return (
                                <li key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                    {item}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-elevated sm:aspect-[5/6]">
                        <Image
                            src={publicMedia.ritualJournal.src}
                            alt={publicMedia.ritualJournal.alt}
                            fill
                            priority
                            sizes="(max-width: 1024px) 92vw, 42vw"
                            className="object-cover"
                            style={{ objectPosition: publicMedia.ritualJournal.objectPosition }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/88 via-transparent to-primary/8" aria-hidden="true" />

                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                            {resume ? (
                                <div className="rounded-[1.75rem] border border-border bg-background/88 p-5 shadow-soft backdrop-blur-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                {isCompleted ? 'Parcours accompli' : `Jour ${resume.currentDay} · prochain rituel`}
                                            </p>
                                            <p className="mt-2 truncate font-serif text-2xl font-semibold text-foreground">{resume.title}</p>
                                        </div>
                                        <span className="shrink-0 font-serif text-2xl font-semibold text-primary">{resume.percent}%</span>
                                    </div>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, resume.percent))}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-sm border-l-2 border-secondary pl-4 text-foreground">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">Rituel · journal · bilan</p>
                                    <p className="mt-2 font-serif text-2xl leading-tight">Un espace pour revenir à l’essentiel, un jour à la fois.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute -left-5 top-10 hidden rounded-full border border-border bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-soft backdrop-blur sm:block">
                        Formation guidée
                    </div>
                </div>
            </Container>
        </section>
    );
}
