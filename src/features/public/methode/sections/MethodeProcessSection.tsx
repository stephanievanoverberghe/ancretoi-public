import { Anchor, ArrowRight, Compass, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { SectionHeader } from '@/components/marketing';
import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { methodeContent } from '@/content/methode';
import { cn } from '@/lib/cn';

const stepIcons = [Anchor, Compass, Sparkles] as const;
const stepTones = ['bg-success/10 text-success', 'bg-primary/10 text-primary', 'bg-accent/12 text-accent'] as const;

export function MethodeProcessSection() {
    return (
        <Section id="processus" spacing="lg" className="relative scroll-mt-28 overflow-hidden border-y border-border bg-surface-muted/35">
            <Container size="xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:items-start lg:gap-16">
                    <div className="lg:sticky lg:top-28">
                        <SectionHeader
                            align="left"
                            eyebrow={methodeContent.process.eyebrow}
                            title={methodeContent.process.title}
                            description={methodeContent.process.description}
                        />

                        <div className="mt-8 border-l-2 border-secondary pl-5 sm:pl-6">
                            <Badge variant="info">{methodeContent.process.asideBadge}</Badge>
                            <h3 className="mt-4 font-serif text-2xl leading-tight text-foreground">{methodeContent.process.asideTitle}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{methodeContent.process.asideDescription}</p>
                            <LinkButton href={methodeContent.process.asideCta.href} variant="tertiary" size="sm" className="mt-5 w-full sm:w-fit">
                                {methodeContent.process.asideCta.label}
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </LinkButton>
                        </div>

                        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[2rem] border border-border shadow-elevated">
                            <Image
                                src="/images/hero-amethyste.webp"
                                alt=""
                                fill
                                sizes="(max-width: 1024px) 100vw, 34vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" aria-hidden="true" />
                        </div>
                    </div>

                    <ol className="border-y border-border">
                        {methodeContent.process.steps.map((step, index) => {
                            const Icon = stepIcons[index] ?? Sparkles;

                            return (
                                <li key={step.number} className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:grid-cols-[5rem_minmax(0,1fr)] sm:py-9">
                                    <div className="flex items-center justify-between sm:block">
                                        <span className="font-serif text-3xl font-semibold text-border">{step.number}</span>
                                        <span className={cn('grid h-12 w-12 place-items-center rounded-full sm:mt-4', stepTones[index] ?? stepTones[1])} aria-hidden="true">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Étape {index + 1}</p>
                                        <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{step.title}</h3>
                                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </Container>
        </Section>
    );
}
