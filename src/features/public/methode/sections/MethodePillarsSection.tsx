import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { SectionHeader } from '@/components/marketing';
import { Badge, Container, Section } from '@/components/ui';
import { methodeContent } from '@/content/methode';
import { cn } from '@/lib/cn';

export function MethodePillarsSection() {
    return (
        <Section spacing="lg" className="overflow-x-clip bg-background">
            <Container size="xl">
                <SectionHeader
                    align="center"
                    eyebrow={methodeContent.pillars.eyebrow}
                    title={methodeContent.pillars.title}
                    description={methodeContent.pillars.description}
                />

                <div className="mt-12 border-y border-border">
                    {methodeContent.pillars.items.map((pillar, index) => {
                        const isReversed = index % 2 === 1;

                        return (
                            <article
                                key={pillar.id}
                                id={pillar.id}
                                aria-labelledby={`${pillar.id}-title`}
                                className="grid scroll-mt-28 items-center gap-8 border-b border-border py-9 last:border-b-0 sm:py-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-16 lg:py-16"
                            >
                                <div className={cn(isReversed && 'lg:order-2')}>
                                    <div className="flex items-center gap-4">
                                        <span className="font-serif text-5xl font-semibold leading-none text-border" aria-hidden="true">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <Badge variant="outline" size="md">Pilier</Badge>
                                    </div>
                                    <h3 id={`${pillar.id}-title`} className="mt-6 font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl">
                                        {pillar.title}
                                    </h3>
                                    <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{pillar.description}</p>

                                    <ul className="mt-7 grid gap-3 border-t border-border pt-5">
                                        {pillar.points.map((point) => (
                                            <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:text-base">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={cn('relative aspect-[5/4] overflow-hidden rounded-[2.25rem] border border-border shadow-elevated', isReversed && 'lg:order-1')}>
                                    <Image
                                        src={pillar.image.src}
                                        alt={pillar.image.alt}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 56vw"
                                        className="object-cover transition duration-700 hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/35 to-transparent" aria-hidden="true" />
                                </div>
                            </article>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
