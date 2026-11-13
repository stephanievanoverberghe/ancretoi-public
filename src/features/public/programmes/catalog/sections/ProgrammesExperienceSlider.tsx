'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

type ExperienceSlide = {
    label: string;
    title: string;
    description: string;
    imageSrc: string | null;
    imageAlt: string;
};

type ProgrammesExperienceSliderProps = {
    slides: readonly ExperienceSlide[];
    ariaLabel: string;
};

export function ProgrammesExperienceSlider({ slides, ariaLabel }: ProgrammesExperienceSliderProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', containScroll: 'trimSnaps', loop: true });
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
        <div aria-roledescription="carousel" aria-label={ariaLabel}>
            <div ref={emblaRef} className="overflow-hidden">
                <ul className="-ml-4 flex touch-pan-y">
                    {slides.map((slide) => {
                        return (
                            <li key={slide.label} className="min-w-0 flex-[0_0_100%] pl-4">
                                <article className="grid min-h-[360px] gap-5 overflow-hidden rounded-[1.75rem] border border-border bg-surface-muted/50 p-5 text-foreground sm:min-h-[420px] sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                                    <div>
                                        <Badge variant="outline" className="bg-surface/80 backdrop-blur">
                                            {slide.label}
                                        </Badge>
                                        <h3 className="mt-4 max-w-md font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{slide.title}</h3>
                                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{slide.description}</p>
                                    </div>

                                    {slide.imageSrc ? (
                                        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-border">
                                            <Image
                                                src={slide.imageSrc}
                                                alt={slide.imageAlt}
                                                fill
                                                sizes="(min-width: 1024px) 560px, 92vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-border bg-surface-muted text-center">
                                            <div className="p-6">
                                                <ImageOff className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                                                <p className="mt-3 text-sm text-muted-foreground">Visuel non disponible</p>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mt-5 flex justify-center">
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: snapCount }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className="grid h-6 min-w-6 cursor-pointer place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Afficher l’aperçu ${index + 1}`}
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
