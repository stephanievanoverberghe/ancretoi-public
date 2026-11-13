import { ArrowRight, Clock3, Gem, Sparkles, Target } from 'lucide-react';

import { Badge, Card, CardContent, LinkButton } from '@/components/ui';
import { programmesContent } from '@/content/programmes';
import { cn } from '@/lib/cn';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

const comparisonFields = [
    { key: 'duration', icon: Clock3 },
    { key: 'level', icon: Sparkles },
    { key: 'price', icon: Gem },
    { key: 'idealFor', icon: Target },
] as const;

type ComparisonFieldKey = (typeof comparisonFields)[number]['key'];

function getComparisonValue(program: ProgrammesCatalogProgram, key: ComparisonFieldKey) {
    switch (key) {
        case 'duration':
            return program.durationLabel;
        case 'level':
            return program.level;
        case 'price':
            return program.priceLabel ?? programmesContent.comparison.priceFallback;
        case 'idealFor':
            return program.idealFor;
    }
}

type ProgrammesComparisonCardProps = {
    program: ProgrammesCatalogProgram;
    compact?: boolean;
};

export function ProgrammesComparisonCard({ program, compact = false }: ProgrammesComparisonCardProps) {
    const visibleFields = compact ? comparisonFields.filter((field) => field.key !== 'idealFor') : comparisonFields;

    return (
        <Card className="h-full rounded-3xl bg-surface">
            <CardContent className={cn('flex h-full flex-col', compact ? 'p-4' : 'p-5')}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {programmesContent.comparison.labels.status}
                        </p>
                        <h3 className={cn('mt-2 font-serif font-semibold leading-tight text-foreground', compact ? 'text-xl' : 'text-2xl')}>
                            {program.title}
                        </h3>
                    </div>
                    <Badge variant={program.isPublished ? 'success' : 'outline'}>{program.statusLabel}</Badge>
                </div>

                <p className={cn('text-sm leading-relaxed text-muted-foreground', compact ? 'mt-3 line-clamp-3' : 'mt-4')}>{program.summary}</p>

                <dl className={cn('divide-y divide-border border-y border-border', compact ? 'mt-4' : 'mt-5')}>
                    {visibleFields.map((field) => {
                        const Icon = field.icon;

                        return (
                            <div key={field.key} className={cn(compact ? 'py-3' : 'py-4')}>
                                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                                    {programmesContent.comparison.labels[field.key]}
                                </dt>
                                <dd className={cn('mt-2 text-sm leading-relaxed text-foreground', compact && 'line-clamp-2')}>
                                    {getComparisonValue(program, field.key)}
                                </dd>
                            </div>
                        );
                    })}
                </dl>

                <LinkButton
                    href={program.href}
                    variant={program.isPublished ? 'primary' : 'tertiary'}
                    size="sm"
                    disabled={!program.isPublished}
                    className={cn('w-full', compact ? 'mt-4' : 'mt-5')}
                >
                    {program.isPublished ? programmesContent.comparison.publishedCta : programmesContent.comparison.draftCta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </LinkButton>
            </CardContent>
        </Card>
    );
}

export { comparisonFields, getComparisonValue };
