'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import type { ProgrammesCatalogProgram } from '../programmes-catalog.types';

import { ProgrammesComparisonCard } from './ProgrammesComparisonCard';

type ProgrammesComparisonCarouselProps = {
    programs: ProgrammesCatalogProgram[];
};

export function ProgrammesComparisonCarousel({ programs }: ProgrammesComparisonCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', containScroll: 'trimSnaps', loop: false });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [snapCount, setSnapCount] = useState(0);

    const updateState = useCallback(() => {
        if (!emblaApi) return;

        setSelectedIndex(emblaApi.selectedScrollSnap());
        setSnapCount(emblaApi.scrollSnapList().length);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        updateState();
        emblaApi.on('select', updateState);
        emblaApi.on('reInit', updateState);

        return () => {
            emblaApi.off('select', updateState);
            emblaApi.off('reInit', updateState);
        };
    }, [emblaApi, updateState]);

    return (
        <div className="mt-10 lg:hidden" aria-roledescription="carousel" aria-label="Comparatif des programmes">
            <div ref={emblaRef} className="-mx-[var(--gutter-page)] overflow-hidden px-[var(--gutter-page)]">
                <ul className="-ml-4 flex touch-pan-y">
                    {programs.map((program) => (
                        <li key={program.slug} className="min-w-0 flex-[0_0_82%] pl-4 sm:flex-[0_0_58%] md:flex-[0_0_45%]">
                            <ProgrammesComparisonCard program={program} compact />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-5 flex justify-center">
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: snapCount }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className="grid h-6 min-w-6 cursor-pointer place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Afficher le programme ${index + 1}`}
                            aria-current={selectedIndex === index ? 'true' : undefined}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'block h-2 rounded-full transition-all',
                                    selectedIndex === index ? 'w-5 bg-primary' : 'w-2.5 bg-border',
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
