import 'server-only';

import { AlertCircle, ArrowRight } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Container, LinkButton, Section } from '@/components/ui';
import { homeContent } from '@/content/home';
import { mapProgrammesCatalogPrograms } from '@/features/public/programmes/catalog/programmes-catalog.mapper';
import type { ProgrammesCatalogProgram } from '@/features/public/programmes/catalog/programmes-catalog.types';
import { ProgrammeCatalogCard } from '@/features/public/programmes/catalog/sections/ProgrammeCatalogCard';
import { ProgrammesCatalogCarousel } from '@/features/public/programmes/catalog/sections/ProgrammesCatalogCarousel';
import { getProgramsForCatalogAllStatuses, getProgramsForComparisonAllStatuses } from '@/server/programmes';

async function getHomePrograms(): Promise<{ programs: ProgrammesCatalogProgram[]; hasError: boolean }> {
    try {
        const [programs, comparisonRows] = await Promise.all([getProgramsForCatalogAllStatuses(), getProgramsForComparisonAllStatuses()]);

        return {
            programs: mapProgrammesCatalogPrograms({ programs, comparisonRows }).slice(0, 4),
            hasError: false,
        };
    } catch (error) {
        console.error('Impossible de charger les programmes sur la page d’accueil.', error);
        return { programs: [], hasError: true };
    }
}

export async function HomeProgramTeasers() {
    const { programs, hasError } = await getHomePrograms();

    return (
        <Section id="programmes" spacing="lg" className="relative overflow-hidden border-y border-border bg-surface-muted/35">
            <div className="pointer-events-none absolute -right-36 top-12 h-80 w-80 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
            <Container size="xl" className="relative">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_auto] lg:items-end">
                    <SectionHeader
                        eyebrowVariant="secondary"
                        align="left"
                        eyebrow={homeContent.programmes.eyebrow}
                        title={homeContent.programmes.title}
                        description={homeContent.programmes.description}
                    />
                    <LinkButton href={homeContent.programmes.cta.href} variant="tertiary" size="md" className="w-full sm:w-fit lg:justify-self-end">
                        {homeContent.programmes.cta.label}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </LinkButton>
                </div>

                {programs.length ? (
                    <div className="mt-10">
                        <ProgrammesCatalogCarousel programs={programs} />

                        <ul className="hidden gap-5 lg:grid lg:grid-cols-12">
                            {programs.map((program, index) => (
                                <li key={program.slug} className={index === 0 ? 'flex lg:col-span-7' : index === 1 ? 'flex lg:col-span-5' : 'flex lg:col-span-6'}>
                                    <ProgrammeCatalogCard program={program} featured={index === 0} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="mt-10 flex max-w-2xl items-start gap-4 border-l-2 border-warning pl-5 sm:pl-6">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-foreground">{hasError ? 'Les programmes sont momentanément indisponibles.' : 'Les prochains parcours se préparent.'}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {hasError ? 'Le reste du site reste accessible. Tu peux réessayer dans quelques instants.' : 'Le catalogue sera mis à jour dès qu’un parcours sera publié.'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 border-t border-border pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Tu hésites entre plusieurs formats ?</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Le catalogue compare les parcours, les statuts et les accès avant achat.</p>
                        </div>
                        <LinkButton href={homeContent.programmes.cta.href} variant="primary" size="md" className="w-full sm:w-fit">
                            Comparer les programmes
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </LinkButton>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
