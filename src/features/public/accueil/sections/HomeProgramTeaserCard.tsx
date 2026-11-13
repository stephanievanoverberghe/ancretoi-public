import { ProgrammeTeaserCard, type ProgrammeTeaserCardViewModel } from '@/features/public/programmes/cards/ProgrammeTeaserCard';

export interface HomeProgram {
    slug: string;
    title: string;
    duration: string;
    status: string;
    href: string;
    cover: string;
    description: string;
}

export function mapHomeProgramToTeaserCard(program: HomeProgram): ProgrammeTeaserCardViewModel {
    const isPublished = program.status === 'Publié';

    return {
        slug: program.slug,
        title: program.title,
        statusLabel: program.status,
        href: program.href,
        coverSrc: program.cover,
        durationLabel: program.duration,
        description: program.description,
        ctaLabel: isPublished ? 'Voir le programme' : 'Voir le catalogue',
        isPublished,
    };
}

export interface HomeProgramTeaserCardProps {
    program: HomeProgram;
    imagePriority?: boolean;
    featured?: boolean;
}

export function HomeProgramTeaserCard({ program, imagePriority = false, featured = false }: HomeProgramTeaserCardProps) {
    return <ProgrammeTeaserCard program={mapHomeProgramToTeaserCard(program)} imagePriority={imagePriority} featured={featured} />;
}
