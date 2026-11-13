'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, Flag, Gauge } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ProgramDetailPathStep } from '@/types/programmes.types';

type ProgrammeDetailPathCarouselProps = {
    steps: ProgramDetailPathStep[];
    ariaLabel: string;
};

function shouldReduceMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ProgrammeDetailPathCarousel({ steps, ariaLabel }: ProgrammeDetailPathCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', containScroll: 'trimSnaps', loop: steps.length > 1 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [snapCount, setSnapCount] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

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

    useEffect(() => {
        if (!emblaApi || isPaused || steps.length < 2 || shouldReduceMotion()) return;

        const interval = window.setInterval(() => {
            emblaApi.scrollNext();
        }, 4600);

        return () => window.clearInterval(interval);
    }, [emblaApi, isPaused, steps.length]);

    return (
        <div
            className="min-w-0 rounded-[2rem] border border-border bg-surface p-3 shadow-elevated sm:p-4"
            aria-roledescription="carousel"
            aria-label={ariaLabel}
            onPointerEnter={() => setIsPaused(true)}
            onPointerLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <div ref={emblaRef} className="overflow-hidden rounded-[1.75rem] border border-border bg-background">
                <ol className="-ml-4 flex touch-pan-y">
                    {steps.map((step, index) => {
                        const stepNumber = String(index + 1).padStart(2, '0');
                        const isLast = index === steps.length - 1;

                        return (
                            <li key={`${step.label}-${step.title}`} className="min-w-0 flex-[0_0_100%] pl-4">
                                <Card className="h-full overflow-hidden rounded-none border-0 bg-transparent shadow-none">
                                    <CardContent className="relative flex min-h-[320px] flex-col p-6 sm:min-h-[380px] sm:p-8 lg:min-h-[430px] lg:p-10">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <Badge variant="outline" size="md">
                                                {step.label}
                                            </Badge>
                                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Étape {stepNumber}/{steps.length}
                                            </span>
                                        </div>

                                        <div className="my-auto max-w-2xl py-10">
                                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/10 text-secondary ring-1 ring-secondary/15">
                                                {isLast ? <Flag className="h-6 w-6" aria-hidden="true" /> : <Gauge className="h-6 w-6" aria-hidden="true" />}
                                            </span>

                                            {step.focus ? (
                                                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">{step.focus}</p>
                                            ) : null}
                                            <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{step.title}</h3>
                                            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{step.description}</p>
                                        </div>

                                        <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-4">
                                            <span className="block h-2 rounded-full bg-gradient-to-r from-secondary/75 via-primary/55 to-transparent" aria-hidden="true" />
                                            <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {snapCount > 1 ? (
                <div className="mt-4 flex justify-center sm:hidden">
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: snapCount }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={cn(
                                    'h-2 cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                                    selectedIndex === index ? 'w-8 bg-secondary' : 'w-2.5 bg-border hover:bg-muted-foreground/40',
                                )}
                                onClick={() => emblaApi?.scrollTo(index)}
                                aria-label={`Afficher l’étape ${index + 1}`}
                                aria-current={selectedIndex === index ? 'true' : undefined}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {snapCount > 1 ? (
                <div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map((step, index) => (
                        <button
                            key={`${step.label}-${step.title}`}
                            type="button"
                            className={cn(
                                'cursor-pointer rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                                selectedIndex === index
                                    ? 'border-secondary/35 bg-secondary/10 text-foreground'
                                    : 'border-border bg-background/70 text-muted-foreground hover:border-secondary/30 hover:bg-background',
                            )}
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Afficher ${step.label}`}
                            aria-current={selectedIndex === index ? 'true' : undefined}
                        >
                            <span className="block text-xs font-semibold uppercase tracking-wide">{step.label}</span>
                            <span className="mt-1 block truncate text-sm font-semibold">{step.title}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
