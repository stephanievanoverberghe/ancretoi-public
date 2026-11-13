import { ArrowRight, BookOpenCheck, CalendarDays, ClipboardCheck, NotebookPen } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { homeContent } from '@/content/home';
import { cn } from '@/lib/cn';

const stepIcons = [BookOpenCheck, CalendarDays, NotebookPen, ClipboardCheck] as const;

export function HomeHowItWorks() {
    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
            <Container size="xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:items-start lg:gap-16">
                    <div className="lg:sticky lg:top-28">
                        <SectionHeader
                            eyebrowVariant="secondary"
                            align="left"
                            eyebrow={homeContent.howItWorks.eyebrow}
                            title={homeContent.howItWorks.title}
                            description={homeContent.howItWorks.description}
                        />

                        <div className="mt-8 border-l-2 border-secondary pl-5 sm:pl-6">
                            <Badge variant="info" className="text-foreground">Méthode guidée</Badge>
                            <h3 className="mt-4 font-serif text-2xl leading-tight text-foreground">Une seule étape utile à la fois.</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                La plateforme garde le fil : le catalogue présente le parcours, l’espace apprenant affiche la suite, puis le journal conserve tes repères.
                            </p>
                            <LinkButton href={homeContent.programmes.cta.href} variant="tertiary" size="sm" className="mt-5 w-full sm:w-fit">
                                Explorer les parcours
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </LinkButton>
                        </div>
                    </div>

                    <ol className="grid">
                        {homeContent.howItWorks.steps.map((step, index) => {
                            const Icon = stepIcons[index] ?? BookOpenCheck;

                            return (
                                <li
                                    key={step.number}
                                    className="relative grid gap-4 border-b border-border py-6 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:py-8"
                                >
                                    <div className="relative hidden justify-center sm:flex">
                                        <span className="z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-serif text-lg font-semibold text-primary">
                                            {step.number}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 sm:gap-5">
                                        <span
                                            className={cn(
                                                'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:mt-1',
                                                index === 0 ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-muted-foreground',
                                            )}
                                            aria-hidden="true"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary sm:hidden">
                                                    {step.number}
                                                </span>
                                                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Étape {index + 1}</span>
                                            </div>
                                            <h3 className="mt-3 font-serif text-2xl leading-tight text-foreground sm:text-3xl">{step.title}</h3>
                                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                                        </div>
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
