import { Compass } from 'lucide-react';

import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { programmesContent } from '@/content/programmes';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

import { comparisonFields, getComparisonValue } from './ProgrammesComparisonCard';
import { ProgrammesComparisonCarousel } from './ProgrammesComparisonCarousel';
import { SectionHeader } from '@/components/marketing';

type ProgrammesComparisonSectionProps = {
    programs: ProgrammesCatalogProgram[];
};

export function ProgrammesComparisonSection({ programs }: ProgrammesComparisonSectionProps) {
    const comparisonGridStyle = {
        gridTemplateColumns: `minmax(15rem, 0.9fr) repeat(${programs.length}, minmax(11rem, 1fr))`,
    };

    return (
        <Section id="comparatif" spacing="lg" className="scroll-mt-24 border-y border-border bg-background">
            <Container size="xl">
                <SectionHeader
                    align="center"
                    eyebrow={programmesContent.comparison.eyebrow}
                    title={programmesContent.comparison.title}
                    description={programmesContent.comparison.description}
                />

                <ProgrammesComparisonCarousel programs={programs} />

                <div className="mt-10 hidden overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft lg:block">
                    <div className="grid border-b border-border bg-surface-muted/70 text-sm font-semibold text-muted-foreground" style={comparisonGridStyle}>
                        <div className="px-5 py-4">{programmesContent.comparison.labels.objective}</div>
                        {programs.map((program) => (
                            <div key={program.slug} className="border-l border-border px-5 py-4">
                                <div className="flex flex-col gap-3">
                                    <Badge variant={program.isPublished ? 'success' : 'outline'} className="w-fit">
                                        {program.statusLabel}
                                    </Badge>
                                    <span className="font-serif text-xl font-semibold leading-tight text-foreground">{program.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid border-b border-border" style={comparisonGridStyle}>
                        <div className="px-5 py-5 text-sm font-semibold text-foreground">{programmesContent.comparison.labels.objective}</div>
                        {programs.map((program) => (
                            <div key={program.slug} className="border-l border-border px-5 py-5 text-sm leading-relaxed text-muted-foreground">
                                {program.summary}
                            </div>
                        ))}
                    </div>

                    {comparisonFields.map((field) => {
                        const Icon = field.icon;

                        return (
                            <div key={field.key} className="grid border-b border-border last:border-b-0" style={comparisonGridStyle}>
                                <div className="flex items-center gap-2 px-5 py-5 text-sm font-semibold text-foreground">
                                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                                    {programmesContent.comparison.labels[field.key]}
                                </div>
                                {programs.map((program) => (
                                    <div key={program.slug} className="border-l border-border px-5 py-5 text-sm leading-relaxed text-muted-foreground">
                                        {getComparisonValue(program, field.key)}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 flex flex-col items-center gap-4 text-center">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{programmesContent.comparison.quizLead}</p>
                    <LinkButton href={programmesContent.comparison.quizCta.href} variant="tertiary">
                        <Compass className="h-4 w-4" aria-hidden="true" />
                        {programmesContent.comparison.quizCta.label}
                    </LinkButton>
                </div>
            </Container>
        </Section>
    );
}
