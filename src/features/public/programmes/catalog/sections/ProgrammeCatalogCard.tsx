import { ProgrammeTeaserCard, type ProgrammeTeaserCardViewModel } from '../../cards/ProgrammeTeaserCard';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

type ProgrammeCatalogCardProps = {
    program: ProgrammesCatalogProgram;
    imagePriority?: boolean;
    featured?: boolean;
};

export function mapCatalogProgramToTeaserCard(program: ProgrammesCatalogProgram): ProgrammeTeaserCardViewModel {
    return {
        slug: program.slug,
        title: program.title,
        statusLabel: program.statusLabel,
        href: program.href,
        coverSrc: program.coverSrc,
        durationLabel: program.durationLabel,
        description: program.summary,
        ctaLabel: program.ctaLabel,
        isPublished: program.isPublished,
        levelLabel: program.level,
        priceLabel: program.priceLabel,
    };
}

export function ProgrammeCatalogCard({ program, imagePriority = false, featured = false }: ProgrammeCatalogCardProps) {
    return <ProgrammeTeaserCard program={mapCatalogProgramToTeaserCard(program)} imagePriority={imagePriority} featured={featured} />;
}
