import Image from 'next/image';
import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';

import { heroTitleCompactClassName } from './hero-title';

const accentClasses = {
    violet: 'bg-primary',
    coral: 'bg-secondary',
    sage: 'bg-[var(--public-sage)]',
    gold: 'bg-[var(--public-gold)]',
} as const;

export type EditorialPageHeaderProps = {
    eyebrow: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
    media?: {
        src: string;
        alt?: string;
        priority?: boolean;
    };
    accent?: keyof typeof accentClasses;
    className?: string;
};

/** En-tête compact pour les pages support, éditoriales et transactionnelles. */
export function EditorialPageHeader({
    eyebrow,
    title,
    description,
    actions,
    meta,
    media,
    accent = 'violet',
    className,
}: EditorialPageHeaderProps) {
    return (
        <header className={cn('relative overflow-hidden border-b border-border/80 bg-surface/45', className)}>
            <div className="absolute inset-y-0 right-[12%] hidden w-px bg-[var(--public-rule)] lg:block" aria-hidden="true" />
            <Container size="xl" className="relative py-10 sm:py-14 lg:py-16">
                <div className={cn('grid gap-8 lg:items-center', media && 'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:gap-12')}>
                    <div className="max-w-3xl">
                        <Reveal y={12}>
                            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                <span className={cn('h-2 w-2 rounded-full', accentClasses[accent])} aria-hidden="true" />
                                <span>{eyebrow}</span>
                            </div>
                        </Reveal>
                        <Reveal delay={0.06}>
                            <h1 className={cn('mt-5 max-w-[20ch] text-balance', heroTitleCompactClassName)}>{title}</h1>
                        </Reveal>
                        {description ? (
                            <Reveal delay={0.12}>
                                <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
                            </Reveal>
                        ) : null}
                        {meta ? <div className="mt-5 text-sm text-muted-foreground">{meta}</div> : null}
                        {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row [&_a]:rounded-full [&_button]:rounded-full">{actions}</div> : null}
                    </div>

                    {media ? (
                        <Reveal delay={0.12} x={10} className="w-full">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface shadow-soft lg:aspect-[5/4]">
                                <Image
                                    src={media.src}
                                    alt={media.alt ?? ''}
                                    fill
                                    priority={media.priority}
                                    sizes="(min-width: 1024px) 32vw, 100vw"
                                    className="object-cover"
                                />
                            </div>
                        </Reveal>
                    ) : null}
                </div>
            </Container>
        </header>
    );
}
