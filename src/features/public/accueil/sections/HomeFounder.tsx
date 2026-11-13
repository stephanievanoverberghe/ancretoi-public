import { CheckCircle2, Quote } from 'lucide-react';
import Image from 'next/image';

import { Badge, Container, Section } from '@/components/ui';
import { homeContent } from '@/content/home';

export function HomeFounder() {
    const founder = homeContent.founder;

    return (
        <Section spacing="lg" className="relative overflow-hidden bg-surface">
            <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
            <Container size="xl" className="relative">
                <article className="grid items-stretch overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-elevated lg:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
                    <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[40rem]">
                        <Image
                            src={founder.image.src}
                            alt={founder.image.alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 38vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/15" aria-hidden="true" />
                        <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
                            <p className="font-serif text-3xl font-semibold text-foreground">{founder.name}</p>
                            <p className="mt-1 text-sm text-foreground/75">{founder.role}</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12 xl:p-14">
                        <Badge variant="secondary" size="md" className="w-fit">
                            {founder.eyebrow}
                        </Badge>
                        <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">{founder.title}</h2>

                        <blockquote className="mt-8 border-l-2 border-secondary pl-5 sm:pl-7">
                            <Quote className="h-5 w-5 text-secondary" aria-hidden="true" />
                            <p className="mt-4 font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl lg:text-2xl">{founder.quote}</p>
                        </blockquote>

                        <ul className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
                            {founder.points.map((point) => (
                                <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>
            </Container>
        </Section>
    );
}
