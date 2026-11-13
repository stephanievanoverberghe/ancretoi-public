import { CalendarDays, Clock3, RotateCcw } from 'lucide-react';

import { Card, CardContent, Container, Section } from '@/components/ui';
import type { Program, ProgramDetailPathSummaryKind } from '@/types/programmes.types';

import { ProgrammeDetailPathCarousel } from './ProgrammeDetailPathCarousel';
import { SectionHeader } from '@/components/marketing';

type ProgrammeDetailPathSectionProps = {
    program: Program;
};

const summaryIcons: Partial<Record<ProgramDetailPathSummaryKind, typeof CalendarDays>> = {
    duration: CalendarDays,
    load: Clock3,
    rhythm: RotateCcw,
};

export function ProgrammeDetailPathSection({ program }: ProgrammeDetailPathSectionProps) {
    const path = program.detail.path;
    if (!path.steps.length) return null;

    return (
        <Section spacing="lg" className="bg-background">
            <Container size="xl">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
                    <div className="lg:sticky lg:top-24">
                        <SectionHeader eyebrow={path.eyebrow} title={path.title} description={path.description} />

                        {path.summary.length ? (
                            <Card className="mt-8 rounded-[2rem] bg-surface">
                                <CardContent className="grid gap-3 p-4 sm:p-5">
                                    {path.summary.map((item) => {
                                        const Icon = summaryIcons[item.kind] ?? CalendarDays;

                                        return (
                                            <div key={`${item.label}-${item.value}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background/65 p-3">
                                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary/10 text-secondary">
                                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{item.label}</p>
                                                    <p className="font-semibold text-foreground">{item.value}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>

                    <ProgrammeDetailPathCarousel steps={path.steps} ariaLabel={`${path.eyebrow} - progression du parcours`} />
                </div>
            </Container>
        </Section>
    );
}
