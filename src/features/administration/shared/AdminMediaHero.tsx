import Image from 'next/image';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui';

type AdminMediaHeroProps = {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt?: string;
    eyebrow?: string;
    actions?: ReactNode;
    footer?: ReactNode;
};

export function AdminMediaHero({ title, description, imageSrc, imageAlt = '', eyebrow, actions, footer }: AdminMediaHeroProps) {
    return (
        <Card className="relative overflow-hidden rounded-[2rem] border-primary/15 bg-gradient-to-br from-primary/12 via-surface to-secondary/10 shadow-elevated">
            <div className="pointer-events-none absolute -left-20 top-8 h-52 w-52 rounded-full bg-primary/12 blur-3xl" aria-hidden="true" />
            <div className="grid min-h-[24rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
                <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
                    {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
                    <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl xl:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
                    {actions ? <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div> : null}
                    {footer ? <div className="mt-8 border-t border-border/70 pt-5">{footer}</div> : null}
                </div>

                <div className="relative min-h-64 overflow-hidden border-t border-border/60 lg:min-h-full lg:border-l lg:border-t-0">
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        priority
                        sizes="(max-width: 1023px) 100vw, 38vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-primary/10" aria-hidden="true" />
                </div>
            </div>
        </Card>
    );
}
