import 'server-only';

import { getProgramsForCatalogAllStatuses, getProgramsForComparisonAllStatuses } from '@/server/programmes';

import { mapProgrammesCatalogPrograms } from './programmes-catalog.mapper';
import type { ProgrammesCatalogProgram } from './programmes-catalog.types';
import {
    ProgrammesCatalogSection,
    ProgrammesComparisonSection,
    ProgrammesExperienceSection,
    ProgrammesFaqSection,
    ProgrammesFinalCtaSection,
    ProgrammesHeroSection,
} from './sections';

export async function ProgrammesPage() {
    let catalogPrograms: ProgrammesCatalogProgram[] = [];
    let hasCatalogError = false;

    try {
        const [programs, comparisonRows] = await Promise.all([getProgramsForCatalogAllStatuses(), getProgramsForComparisonAllStatuses()]);
        catalogPrograms = mapProgrammesCatalogPrograms({ programs, comparisonRows });
    } catch (error) {
        hasCatalogError = true;
        console.error('Impossible de charger le catalogue public.', error);
    }

    return (
        <>
            <ProgrammesHeroSection />
            <ProgrammesCatalogSection programs={catalogPrograms} hasError={hasCatalogError} />
            {catalogPrograms.length ? <ProgrammesComparisonSection programs={catalogPrograms} /> : null}
            <ProgrammesExperienceSection />
            <ProgrammesFaqSection />
            <ProgrammesFinalCtaSection />
        </>
    );
}
