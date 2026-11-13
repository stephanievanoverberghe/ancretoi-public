import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion';
import { Badge, Card, CardContent, Container, LinkButton, Section, type LinkButtonProps } from '@/components/ui';
import { cn } from '@/lib/cn';

type CtaBandAction = {
    label: string;
    href: string;
    variant?: LinkButtonProps['variant'];
    icon?: ReactNode;
    iconPosition?: 'start' | 'end';
};

export type CtaBandProps = {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction?: CtaBandAction;
    primaryActionSlot?: ReactNode;
    secondaryAction?: CtaBandAction;
    asideTitle?: string;
    asideItems?: readonly string[];
    /** Ligne de réassurance rendue sous les actions (paiement, conditions…). */
    footnote?: ReactNode;
    className?: string;
};

function CtaBandLink({ action }: { action: CtaBandAction }) {
    const iconPosition = action.iconPosition ?? 'end';

    return (
        <LinkButton href={action.href} variant={action.variant} size="lg" className="w-full sm:w-fit">
            {iconPosition === 'start' ? action.icon : null}
            {action.label}
            {iconPosition === 'end' ? action.icon : null}
        </LinkButton>
    );
}

/**
 * Bande CTA de fin de page commune aux pages publiques.
 */
export function CtaBand({
    eyebrow,
    title,
    description,
    primaryAction,
    primaryActionSlot,
    secondaryAction,
    asideTitle,
    asideItems,
    footnote,
    className,
}: CtaBandProps) {
    const hasAside = Boolean(asideTitle || asideItems?.length);

    return (
        <Section spacing="lg" className={className}>
            <Container size="xl">
                <Reveal>
                    <Card className="relative overflow-hidden rounded-[2rem] bg-surface-raised shadow-elevated">
                        <Image
                            src="/images/cta-halo.webp"
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 100vw, 88rem"
                            className="object-cover opacity-70 dark:opacity-35"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-surface-raised via-surface-raised/90 to-surface-raised/35" aria-hidden="true" />

                        <CardContent
                            className={cn(
                                'relative grid gap-8 p-6 sm:p-8 lg:p-10',
                                hasAside ? 'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)] lg:items-center' : 'mx-auto max-w-3xl text-center',
                            )}
                        >
                            <div className={cn(!hasAside && 'mx-auto max-w-3xl')}>
                                <Badge variant="secondary" size="md">
                                    {eyebrow}
                                </Badge>
                                <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
                                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>

                                <div className={cn('mt-8 flex flex-col gap-3 sm:flex-row', !hasAside && 'justify-center')}>
                                    {primaryActionSlot ?? (primaryAction ? <CtaBandLink action={primaryAction} /> : null)}
                                    {secondaryAction ? <CtaBandLink action={secondaryAction} /> : null}
                                </div>
                                {footnote ? <div className={cn('mt-5 text-sm text-muted-foreground', !hasAside && 'mx-auto')}>{footnote}</div> : null}
                            </div>

                            {hasAside ? (
                                <aside className="hidden rounded-3xl border border-border bg-background/78 p-5 backdrop-blur md:block sm:p-6">
                                    {asideTitle ? <p className="text-sm font-semibold text-foreground">{asideTitle}</p> : null}
                                    {asideItems?.length ? (
                                        <ul className="mt-5 grid gap-3">
                                            {asideItems.map((item) => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </aside>
                            ) : null}
                        </CardContent>
                    </Card>
                </Reveal>
            </Container>
        </Section>
    );
}
