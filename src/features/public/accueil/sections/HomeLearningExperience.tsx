import { LockKeyhole, NotebookPen, PlayCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { SectionHeader } from '@/components/marketing';
import { Container, Section } from '@/components/ui';
import { homeContent } from '@/content/home';

const experienceIcons = {
    journal: NotebookPen,
    lock: LockKeyhole,
    sparkles: Sparkles,
    video: PlayCircle,
} as const;

export function HomeLearningExperience() {
    return (
        <Section spacing="lg" className="border-y border-border bg-surface-muted/35">
            <Container size="xl">
                <div className="grid overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-elevated lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)]">
                    <div className="relative min-h-[24rem] overflow-hidden lg:min-h-[42rem]">
                        <Image
                            src="/images/espace/rituel-quotidien.webp"
                            alt="Composition tactile avec améthyste, ruban corail et formes en papier ivoire"
                            fill
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/82 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/20" aria-hidden="true" />
                        <div className="absolute bottom-6 left-6 right-6 max-w-md sm:bottom-8 sm:left-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/75">L’espace après l’achat</p>
                            <p className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Un lieu calme pour garder le fil.</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
                        <SectionHeader
                            eyebrowVariant="secondary"
                            align="left"
                            eyebrow={homeContent.learningExperience.eyebrow}
                            title={homeContent.learningExperience.title}
                            description={homeContent.learningExperience.description}
                        />

                        <ul className="mt-8 divide-y divide-border border-y border-border">
                            {homeContent.learningExperience.highlights.map((item) => {
                                const Icon = experienceIcons[item.icon];

                                return (
                                    <li key={item.title} className="flex gap-4 py-5">
                                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary" aria-hidden="true">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
