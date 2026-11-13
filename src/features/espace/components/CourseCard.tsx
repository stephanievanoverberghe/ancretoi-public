import { ArrowRight, BookOpen, Clock3, PauseCircle, PlayCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { LinkButton } from '@/components/ui';
import { reset7Routes } from '@/config/routes';
import { espaceContent } from '@/content/espace';
import { cn } from '@/lib/cn';

import { CourseProgress } from './CourseProgress';
import { ProgramDetailButton } from './ProgramDetailButton';

export type CourseCardData = {
    programSlug: string;
    title: string;
    coverUrl: string | null;
    coverAlt: string | null;
    level: string | null;
    unitsTotal: number;
    unitsDone: number;
    percent: number;
    currentDay: number;
    status: 'active' | 'completed' | 'paused';
    resumeHref: string;
};

export type CourseCardVariant = 'showcase' | 'compact';
export type CourseCardHeadingLevel = 'h2' | 'h3';

type CourseCardProps = {
    course: CourseCardData;
    headingLevel?: CourseCardHeadingLevel;
    imagePriority?: boolean;
    variant?: CourseCardVariant;
};

/** Carte éditoriale d’un parcours, déclinée pour le catalogue et le dashboard. */
export function CourseCard({ course, headingLevel = 'h3', imagePriority = false, variant = 'showcase' }: CourseCardProps) {
    const copy = espaceContent.courseCard;
    const safePercent = Math.max(0, Math.min(100, Math.round(course.percent)));
    const isDone = safePercent >= 100 || course.status === 'completed';
    const isPaused = !isDone && course.status === 'paused';
    const isFresh = !isDone && course.unitsDone === 0;
    const isShowcase = variant === 'showcase';
    const titleId = `course-${course.programSlug}-title`;

    const primaryLabel = isDone
        ? course.programSlug === reset7Routes.programmeSlug
            ? copy.completedLabel
            : 'Revoir le parcours'
        : isFresh
          ? copy.startLabel
          : copy.continueLabel;

    const status = isDone
        ? {
              icon: Sparkles,
              label: copy.completedBadge,
              chipClass: 'border-gold-300/70 bg-gold-50 text-gold-800',
              iconClass: 'bg-gold-100 text-gold-700',
              ringClass: 'text-gold-500',
          }
        : isPaused
          ? {
                icon: PauseCircle,
                label: copy.pausedBadge,
                chipClass: 'border-border bg-surface text-muted-foreground',
                iconClass: 'bg-surface-muted text-muted-foreground',
                ringClass: 'text-muted-foreground',
            }
          : {
                icon: PlayCircle,
                label: copy.activeBadge,
                chipClass: 'border-primary/20 bg-brand-50 text-primary',
                iconClass: 'bg-primary/10 text-primary',
                ringClass: 'text-primary',
            };

    const nextStep = isDone
        ? copy.completedHint
        : isPaused
          ? copy.pausedHint
          : isFresh
            ? copy.firstStepHint
            : `${copy.nextStepLabel} · Jour ${course.currentDay}`;
    const StatusIcon = status.icon;
    const Heading = headingLevel;

    return (
        <article
            aria-labelledby={titleId}
            data-course-card
            data-course-status={isDone ? 'completed' : isPaused ? 'paused' : isFresh ? 'fresh' : 'active'}
            className={cn(
                'group relative isolate grid h-full min-w-0 overflow-hidden rounded-[2rem] border border-border bg-surface text-foreground shadow-soft transition duration-300 motion-reduce:transition-none',
                'hover:border-primary/25 hover:shadow-elevated motion-safe:hover:-translate-y-0.5',
                isShowcase
                    ? 'xl:grid-cols-[minmax(18rem,0.88fr)_minmax(0,1.12fr)]'
                    : 'lg:grid-cols-[11.5rem_minmax(0,1fr)]',
            )}
        >
            <div
                className={cn(
                    'relative min-w-0 overflow-hidden bg-surface-muted',
                    isShowcase ? 'aspect-[16/10] xl:aspect-auto xl:min-h-[21rem]' : 'aspect-[16/9] lg:aspect-auto lg:min-h-[16rem]',
                )}
            >
                {course.coverUrl ? (
                    <Image
                        src={course.coverUrl}
                        alt={course.coverAlt ?? ''}
                        fill
                        sizes={
                            isShowcase
                                ? '(max-width: 1279px) 100vw, 560px'
                                : '(max-width: 1023px) 100vw, 184px'
                        }
                        priority={imagePriority}
                        className="object-cover transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:scale-[1.035]"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 via-surface-muted to-secondary-50 text-primary" aria-hidden="true">
                        <BookOpen className="h-10 w-10" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-foreground/10" aria-hidden="true" />

                <span
                    className={cn(
                        'absolute left-4 top-4 inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-soft',
                        status.chipClass,
                    )}
                >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {status.label}
                </span>

                <div className="absolute bottom-4 right-4 grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full border border-border bg-surface shadow-elevated">
                    <svg className="absolute inset-1 h-[4.25rem] w-[4.25rem] -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-muted" />
                        <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            pathLength="100"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="100"
                            strokeDashoffset={100 - safePercent}
                            className={status.ringClass}
                        />
                    </svg>
                    <span className="relative text-sm font-bold tabular-nums text-foreground">{safePercent}%</span>
                </div>
            </div>

            <div className={cn('flex min-w-0 flex-col', isShowcase ? 'p-5 sm:p-7 lg:p-8' : 'p-5 sm:p-6')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <span>Parcours guidé</span>
                    <span className="h-1 w-1 rounded-full bg-primary/40" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                        <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {course.unitsTotal} {copy.daysSuffix}
                    </span>
                    {course.level ? (
                        <>
                            <span className="h-1 w-1 rounded-full bg-primary/40" aria-hidden="true" />
                            <span className="normal-case tracking-normal text-primary">{course.level}</span>
                        </>
                    ) : null}
                </div>

                <Heading
                    id={titleId}
                    data-course-title
                    className={cn(
                        'mt-4 font-serif font-semibold leading-[1.05] text-foreground',
                        isShowcase ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.7rem]',
                    )}
                >
                    {course.title}
                </Heading>

                <div className={cn('flex items-center gap-3 border-y border-border py-4', isShowcase ? 'mt-6' : 'mt-5')}>
                    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', status.iconClass)} aria-hidden="true">
                        <StatusIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {isDone ? 'Accomplissement' : 'Ton prochain geste'}
                        </p>
                        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{nextStep}</p>
                    </div>
                </div>

                <div className={cn('mt-5', isShowcase && 'sm:mt-6')}>
                    <div className="mb-2.5 flex items-end justify-between gap-4">
                        <span className="text-xs font-medium text-muted-foreground">Progression du parcours</span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                            {course.unitsDone}/{course.unitsTotal} journées
                        </span>
                    </div>
                    <CourseProgress percent={safePercent} hideLabel />
                </div>

                <div className={cn('mt-auto grid gap-2.5 pt-6', isShowcase ? 'sm:grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]')}>
                    <LinkButton
                        href={course.resumeHref}
                        size={isShowcase ? 'lg' : 'md'}
                        className="w-full rounded-xl"
                        data-course-resume-link
                    >
                        {primaryLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </LinkButton>
                    <ProgramDetailButton
                        slug={course.programSlug}
                        label={copy.detailsLabel}
                        className={cn(
                            'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                            isShowcase && 'sm:min-h-12 sm:px-5',
                        )}
                    />
                </div>
            </div>
        </article>
    );
}
