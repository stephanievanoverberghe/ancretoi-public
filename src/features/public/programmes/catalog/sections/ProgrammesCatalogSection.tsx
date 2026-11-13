import { AlertCircle } from 'lucide-react';

import { Alert, Container, LinkButton, Section } from '@/components/ui';
import { programmesContent } from '@/content/programmes';
import { publicRoutes } from '@/config/routes';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

import { ProgrammeCatalogCard } from './ProgrammeCatalogCard';
import { ProgrammesCatalogCarousel } from './ProgrammesCatalogCarousel';
import { SectionHeader } from '@/components/marketing';

type ProgrammesCatalogSectionProps = {
    programs: ProgrammesCatalogProgram[];
    hasError?: boolean;
};

export function ProgrammesCatalogSection({ programs, hasError = false }: ProgrammesCatalogSectionProps) {
    const hasPublishedProgram = programs.some((program) => program.isPublished);

    return (
        <Section id="catalogue" spacing="lg" className="relative scroll-mt-24 overflow-hidden bg-surface-muted/35">
            <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-secondary/8 blur-3xl" aria-hidden="true" />
            <Container size="xl">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.74fr)_auto] lg:items-end">
                    <SectionHeader
                        eyebrow={programmesContent.catalogue.eyebrow}
                        title={programmesContent.catalogue.title}
                        description={programmesContent.catalogue.description}
                    />
                    {programs.length ? (
                        <LinkButton href="#comparatif" variant="tertiary" className="w-full sm:w-fit lg:justify-self-end">
                            {programmesContent.catalogue.compareCta}
                        </LinkButton>
                    ) : null}
                </div>

                {hasError || !hasPublishedProgram ? (
                    <Alert
                        variant="warning"
                        title={hasError ? 'Le catalogue est momentanément indisponible' : programmesContent.catalogue.emptyTitle}
                        icon={<AlertCircle className="h-5 w-5" aria-hidden="true" />}
                        className="mt-8"
                    >
                        <span>
                            {hasError
                                ? 'Le reste du site reste accessible. Réessaie dans quelques instants ou contacte-nous si tu recherches un parcours précis.'
                                : programmesContent.catalogue.emptyDescription}
                        </span>{' '}
                        <LinkButton href={publicRoutes.aide} variant="tertiary" size="sm" className="mt-4 w-full sm:w-fit">
                            {programmesContent.catalogue.helpCta}
                        </LinkButton>
                    </Alert>
                ) : null}

                {programs.length ? (
                    <div className="mt-10">
                        <ProgrammesCatalogCarousel programs={programs} />

                        <ul className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                            {programs.map((program, index) => (
                                <li key={program.slug} className={index === 0 ? 'flex lg:col-span-2 xl:col-span-2' : 'flex'}>
                                    <ProgrammeCatalogCard program={program} featured={index === 0} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </Container>
        </Section>
    );
}
