import Image from 'next/image';
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Sparkles, type LucideIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';

import { Badge, Card, CardContent, LinkButton, type BadgeVariant } from '@/components/ui';
import { cn } from '@/lib/cn';

import { getProgrammeVisualIdentity } from '../programme-visuals';

export type ProgrammeTeaserCardViewModel = {
    slug?: string;
    title: string;
    statusLabel: string;
    href: string;
    coverSrc: string;
    durationLabel: string;
    description: string;
    ctaLabel: string;
    isPublished: boolean;
    levelLabel?: string | null;
    priceLabel?: string | null;
};

type ProgrammeTeaserCardProps = {
    program: ProgrammeTeaserCardViewModel;
    imagePriority?: boolean;
    featured?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function getStatusMeta(program: ProgrammeTeaserCardViewModel): {
    badgeVariant: BadgeVariant;
    icon: LucideIcon;
} {
    return {
        badgeVariant: program.isPublished ? 'success' : 'outline',
        icon: program.isPublished ? CheckCircle2 : Clock3,
    };
}

export function ProgrammeTeaserCard({ program, imagePriority = false, featured = false, onClick }: ProgrammeTeaserCardProps) {
    const meta = getStatusMeta(program);
    const StatusIcon = meta.icon;
    const CtaIcon = program.isPublished ? ArrowRight : LockKeyhole;
    const visual = getProgrammeVisualIdentity(program.slug);

    return (
        <Card
            className={cn(
                'group relative isolate flex w-full overflow-hidden rounded-[2rem] border-border bg-surface text-foreground shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-elevated motion-reduce:transform-none motion-reduce:transition-none',
                featured ? 'min-h-[30rem] flex-col sm:grid sm:min-h-[25rem] sm:grid-cols-[minmax(0,1.16fr)_minmax(18rem,0.84fr)]' : 'min-h-full flex-col',
            )}
        >
            <span className={cn('absolute inset-x-0 top-0 z-20 h-1.5', visual.lineClassName)} aria-hidden="true" />

            <div className={cn('relative overflow-hidden bg-surface-muted', featured ? 'min-h-64 sm:min-h-full' : 'aspect-[16/11]')}>
                <Image
                    src={program.coverSrc}
                    alt=""
                    fill
                    sizes={featured ? '(max-width: 640px) 86vw, 52vw' : '(max-width: 1024px) 86vw, 32vw'}
                    className="object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                    priority={imagePriority}
                />
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 dark:opacity-75', visual.washClassName)} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/85 via-background/15 to-transparent sm:hidden" aria-hidden="true" />

                <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                    <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur', visual.labelClassName)}>
                        Parcours {visual.index}
                    </span>
                </div>

                <span className="absolute bottom-3 right-4 font-serif text-[4.5rem] font-semibold leading-none text-background/70 mix-blend-soft-light sm:bottom-5 sm:right-6 sm:text-[6rem]" aria-hidden="true">
                    {visual.index}
                </span>
            </div>

            <CardContent className={cn('relative z-10 flex flex-1 flex-col', featured ? 'p-5 sm:p-7 lg:p-8' : 'p-5 sm:p-6')}>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.badgeVariant}>
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {program.statusLabel}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {program.durationLabel}
                    </span>
                </div>

                <h3 className={cn('mt-5 font-serif font-semibold leading-[1.02] text-foreground', featured ? 'text-3xl sm:text-4xl' : 'text-3xl')}>
                    {program.title}
                </h3>
                <p className={cn('mt-4 text-sm leading-relaxed text-muted-foreground', featured ? 'sm:text-base' : 'line-clamp-3')}>{program.description}</p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
                    {program.levelLabel ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                            {program.levelLabel}
                        </span>
                    ) : null}
                    {program.priceLabel ? <span className="font-semibold text-foreground">{program.priceLabel}</span> : null}
                </div>

                <div className="mt-auto pt-6">
                    <LinkButton
                        href={program.href}
                        variant="tertiary"
                        size="sm"
                        disabled={!program.isPublished}
                        className="w-full justify-between sm:w-fit"
                        onClick={onClick}
                    >
                        {program.ctaLabel}
                        <CtaIcon aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                    </LinkButton>
                </div>
            </CardContent>
        </Card>
    );
}
