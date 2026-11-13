import { ArrowRight, BookOpenCheck, CheckCircle2, Compass, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

import { Badge, Container, LinkButton } from '@/components/ui';
import { programmesContent } from '@/content/programmes';

const decisionIcons = [Compass, BookOpenCheck, ShieldCheck] as const;

export function ProgrammesHeroSection() {
    const hero = programmesContent.hero;

    return (
        <section className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden border-b border-border bg-background">
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/9 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

            <Container
                size="xl"
                className="relative grid min-h-[clamp(42rem,84svh,56rem)] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(25rem,0.76fr)] lg:gap-16"
            >
                <div className="max-w-3xl lg:py-10">
                    <Badge variant="secondary" size="md">
                        {hero.eyebrow}
                    </Badge>
                    <h1 className="mt-6 font-serif text-[clamp(2.75rem,6.4vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-foreground">
                        {hero.title}
                    </h1>
                    <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">{hero.description}</p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <LinkButton href={hero.primaryCta.href} size="lg" className="w-full sm:w-fit">
                            {hero.primaryCta.label}
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </LinkButton>
                        <LinkButton href={hero.secondaryCta.href} variant="tertiary" size="lg" className="w-full sm:w-fit">
                            {hero.secondaryCta.label}
                        </LinkButton>
                    </div>

                    <p className="mt-8 max-w-xl border-l-2 border-secondary pl-5 text-sm leading-relaxed text-muted-foreground">{hero.decisionPanel.description}</p>
                </div>

                <aside className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end" aria-labelledby="programmes-choice-title">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-elevated sm:aspect-[5/6]">
                        <Image src={hero.image.src} alt="" fill priority sizes="(max-width: 1024px) 92vw, 42vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/12 to-transparent" aria-hidden="true" />

                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                            <div className="rounded-[1.75rem] border border-border bg-background/88 p-5 shadow-soft backdrop-blur-md sm:p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">{hero.decisionPanel.eyebrow}</p>
                                <h2 id="programmes-choice-title" className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                                    {hero.decisionPanel.title}
                                </h2>
                                <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {hero.decisionPanel.items.map((item, index) => {
                                        const Icon = decisionIcons[index] ?? CheckCircle2;

                                        return (
                                            <li key={item} className="flex items-center gap-2 text-sm font-medium text-foreground sm:block">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="sm:mt-2 sm:block">{item}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            </Container>
        </section>
    );
}
