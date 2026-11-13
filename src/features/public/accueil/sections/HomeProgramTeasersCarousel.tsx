import { ProgrammeTeaserCarousel, type ProgrammeTeaserCarouselItem } from '@/features/public/programmes/cards/ProgrammeTeaserCarousel';

import { mapHomeProgramToTeaserCard, type HomeProgram } from './HomeProgramTeaserCard';

interface HomeProgramTeasersCarouselProps {
    items: readonly HomeProgram[];
}

export function HomeProgramTeasersCarousel({ items }: HomeProgramTeasersCarouselProps) {
    const carouselItems: ProgrammeTeaserCarouselItem[] = items.map((program) => ({
        id: program.slug,
        ...mapHomeProgramToTeaserCard(program),
    }));

    return <ProgrammeTeaserCarousel items={carouselItems} ariaLabel="Programmes Ancre-toi" />;
}
