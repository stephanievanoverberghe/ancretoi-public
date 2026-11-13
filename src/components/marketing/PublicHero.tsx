import Image from 'next/image';
import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion';
import { Badge, Container, type BadgeProps } from '@/components/ui';
import { cn } from '@/lib/cn';

import { heroTitleCompactClassName } from './hero-title';

const heroHeights = {
    tall: 'min-h-[clamp(38rem,78svh,50rem)]',
    standard: 'min-h-[clamp(30rem,60svh,40rem)]',
    compact: '',
} as const;

export type PublicHeroProps = {
    eyebrow: string;
    eyebrowVariant?: BadgeProps['variant'];
    title: string;
    description?: string;
    /** Boutons ou liens d'action rendus sous la description. */
    actions?: ReactNode;
    /** Panneau latéral (carte à la une, piliers, repères de choix…). */
    aside?: ReactNode;
    image?: {
        src: string;
        alt?: string;
    };
    height?: keyof typeof heroHeights;
    className?: string;
};

/**
 * Héros plein écran commun aux pages publiques : image de fond voilée,
 * contenu en entrée animée et panneau latéral optionnel.
 */
export function PublicHero({ eyebrow, eyebrowVariant = 'secondary', title, description, actions, aside, image, height = 'standard', className }: PublicHeroProps) {
    const heightClass = heroHeights[height];
    const hasVisual = Boolean(image || aside);

    return (
        <section className={cn('relative mx-[calc(50%-50vw)] w-screen overflow-hidden border-b border-border/80 bg-background', heightClass, className)}>
            <div className="absolute -left-24 top-20 h-64 w-64 rounded-full border border-primary/10" aria-hidden="true" />
            <div className="absolute right-[8%] top-0 h-56 w-56 rounded-full bg-[var(--public-sage)]/8 blur-3xl" aria-hidden="true" />
            <div className="absolute inset-y-0 left-[9%] hidden w-px bg-[var(--public-rule)] xl:block" aria-hidden="true" />

            <Container size="xl" className={cn('relative flex items-center py-12 sm:py-16 lg:py-20', heightClass)}>
                <div className={cn('grid w-full gap-10 lg:gap-14', hasVisual ? 'lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,0.72fr)] lg:items-center' : undefined)}>
                    <div className="max-w-3xl lg:pl-[5%]">
                        <Reveal y={16}>
                            <Badge variant={eyebrowVariant} size="md" className="rounded-none border-x-0 border-t-0 bg-transparent px-0 pb-2 text-xs font-semibold uppercase tracking-[0.2em]">
                                {eyebrow}
                            </Badge>
                        </Reveal>
                        <Reveal delay={0.08}>
                            <h1 className={`mt-6 max-w-[18ch] text-balance ${heroTitleCompactClassName}`}>{title}</h1>
                        </Reveal>
                        {description ? (
                            <Reveal delay={0.16}>
                                <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
                            </Reveal>
                        ) : null}
                        {actions ? (
                            <Reveal delay={0.24}>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row [&_a]:rounded-full [&_button]:rounded-full">{actions}</div>
                            </Reveal>
                        ) : null}
                    </div>

                    {hasVisual ? (
                        <Reveal delay={0.2} x={12} className="mx-auto w-full max-w-2xl lg:mx-0">
                            <div className="relative">
                                <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-elevated sm:aspect-[4/3] sm:rounded-[2.25rem] lg:aspect-[4/5] lg:max-h-[38rem]">
                                    {image ? (
                                        <Image
                                            src={image.src}
                                            alt={image.alt ?? ''}
                                            fill
                                            priority
                                            sizes="(min-width: 1024px) 42vw, 100vw"
                                            className="object-cover object-center transition-transform duration-700 hover:scale-[1.015]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,color-mix(in_srgb,var(--primary)_24%,transparent),transparent_44%),linear-gradient(145deg,var(--surface),var(--surface-muted))]" aria-hidden="true" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/32 via-transparent to-background/5" aria-hidden="true" />
                                </div>

                                {aside ? (
                                    <aside className="relative mx-3 -mt-7 rounded-[1.5rem] border border-border/80 bg-surface/96 p-5 shadow-elevated backdrop-blur-xl sm:mx-6 sm:-mt-10 sm:p-6 lg:ml-[-2.5rem] lg:mr-8">
                                        {aside}
                                    </aside>
                                ) : null}
                            </div>
                        </Reveal>
                    ) : null}
                </div>
            </Container>
        </section>
    );
}
