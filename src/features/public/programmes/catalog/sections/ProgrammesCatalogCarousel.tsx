import { ProgrammeTeaserCarousel, type ProgrammeTeaserCarouselItem } from '../../cards/ProgrammeTeaserCarousel';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

import { mapCatalogProgramToTeaserCard } from './ProgrammeCatalogCard';

type ProgrammesCatalogCarouselProps = {
    programs: ProgrammesCatalogProgram[];
};

export function ProgrammesCatalogCarousel({ programs }: ProgrammesCatalogCarouselProps) {
    const items: ProgrammeTeaserCarouselItem[] = programs.map((program) => ({
        id: program.slug,
        ...mapCatalogProgramToTeaserCard(program),
    }));

    return <ProgrammeTeaserCarousel items={items} ariaLabel="Programmes disponibles" />;
}
