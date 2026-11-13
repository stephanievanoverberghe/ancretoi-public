import { CheckCircle2, ShieldCheck } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Container, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Program } from '@/types/programmes.types';

type ProgrammeDetailOutcomesSectionProps = {
    program: Program;
};

export function ProgrammeDetailOutcomesSection({ program }: ProgrammeDetailOutcomesSectionProps) {
    const outcomes = program.detail.outcomes_section;
    if (!outcomes.items.length) return null;

    return (
        <Section spacing="lg" className="border-y border-border bg-surface-muted/35">
            <Container size="xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
                    <SectionHeader eyebrow={outcomes.eyebrow} title={outcomes.title} description={outcomes.description} />

                    <div>
                        <ul className="grid border-y border-border sm:grid-cols-2">
                            {outcomes.items.map((outcome, index) => (
                                <li
                                    key={outcome.title}
                                    className={cn(
                                        'border-b border-border py-6 sm:px-6 sm:py-7',
                                        index % 2 === 0 && 'sm:border-r',
                                        index >= Math.floor((outcomes.items.length - 1) / 2) * 2 && 'sm:border-b-0',
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-serif text-3xl font-semibold text-border">{String(index + 1).padStart(2, '0')}</span>
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold leading-tight text-foreground">{outcome.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcome.description}</p>
                                </li>
                            ))}
                        </ul>

                        {outcomes.note ? (
                            <div className="mt-7 flex gap-4 border-l-2 border-primary pl-5 sm:pl-6">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                <p className="text-sm leading-relaxed text-foreground">{outcomes.note}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
