import { ArrowRight, CheckCircle2, Compass, HeartHandshake, ListChecks, Target, UserRound } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Container, LinkButton, Section } from '@/components/ui';
import { getProgrammeVisualIdentity } from '@/features/public/programmes/programme-visuals';
import { cn } from '@/lib/cn';
import type { Program, ProgramDetailOverviewCardKind } from '@/types/programmes.types';

type ProgrammeDetailOverviewSectionProps = {
    program: Program;
};

const overviewIcons: Partial<Record<ProgramDetailOverviewCardKind, typeof Compass>> = {
    fit: Compass,
    goals: Target,
    includes: ListChecks,
};

export function ProgrammeDetailOverviewSection({ program }: ProgrammeDetailOverviewSectionProps) {
    const overview = program.detail.overview;
    const visual = getProgrammeVisualIdentity(program.slug);

    return (
        <Section spacing="lg" className="bg-background">
            <Container size="xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
                    <div className="lg:sticky lg:top-24">
                        <SectionHeader eyebrow={overview.eyebrow} title={overview.title} description={overview.description} />

                        <div className={cn('mt-8 border-l-2 pl-5 sm:pl-6', visual.borderClassName)}>
                            <span className={cn('grid h-11 w-11 place-items-center rounded-full ring-1', visual.iconClassName)} aria-hidden="true">
                                <UserRound className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 text-lg font-semibold text-foreground">{overview.who_title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{program.detail.who}</p>
                        </div>
                    </div>

                    <div>
                        <ol className="border-y border-border">
                            {overview.cards.map(({ kind, title, description, items }, index) => {
                                const Icon = overviewIcons[kind] ?? Compass;

                                return (
                                    <li key={title} className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:grid-cols-[5rem_minmax(0,1fr)] sm:py-8">
                                        <div className="flex items-center justify-between sm:block">
                                            <span className="font-serif text-3xl font-semibold text-border">{String(index + 1).padStart(2, '0')}</span>
                                            <span className={cn('grid h-11 w-11 place-items-center rounded-full ring-1 sm:mt-4', visual.iconClassName)} aria-hidden="true">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{title}</h3>
                                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
                                            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                                {items.map((item) => (
                                                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <div className="mt-7 flex flex-col gap-4 border-l-2 border-secondary pl-5 sm:flex-row sm:items-start sm:justify-between sm:pl-6">
                            <div className="flex items-start gap-4">
                                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                                <div>
                                    <h3 className="font-semibold text-foreground">{overview.note.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{overview.note.description}</p>
                                </div>
                            </div>
                            <LinkButton href="#commencer" variant="tertiary" className="w-full shrink-0 sm:w-fit">
                                {overview.note.cta_label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </LinkButton>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
