import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { Badge, Container, Section } from '@/components/ui';
import { publicMedia, type PublicMediaAsset } from '@/config/public-media';
import { cn } from '@/lib/cn';

const tones = {
    success: { icon: CheckCircle2, iconClass: 'bg-success/12 text-success', eyebrow: 'Étape confirmée' },
    error: { icon: XCircle, iconClass: 'bg-danger/12 text-danger', eyebrow: 'Un contretemps' },
    warning: { icon: AlertTriangle, iconClass: 'bg-warning/12 text-warning', eyebrow: 'À vérifier' },
    info: { icon: Info, iconClass: 'bg-primary/12 text-primary', eyebrow: 'Point de passage' },
} as const;

export type StatusPanelProps = {
    tone: keyof typeof tones;
    title: string;
    message: ReactNode;
    /** Boutons ou liens d'action. */
    actions?: ReactNode;
    /** Petite ligne d'information sous les actions. */
    footnote?: ReactNode;
    eyebrow?: string;
    media?: PublicMediaAsset | false;
    className?: string;
};

/**
 * Panneau de statut centré (confirmation, erreur, annulation) pour les
 * pages de retour : newsletter, paiement, etc.
 */
export function StatusPanel({ tone, title, message, actions, footnote, eyebrow, media = publicMedia.transitionStudio, className }: StatusPanelProps) {
    const { icon: Icon, iconClass, eyebrow: defaultEyebrow } = tones[tone];

    return (
        <Section spacing="lg" className={cn('relative overflow-hidden bg-background', className)}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_12%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_50%),radial-gradient(circle_at_82%_20%,color-mix(in_srgb,var(--secondary)_10%,transparent),transparent_44%)]" aria-hidden="true" />
            <Container size="xl" className="relative">
                <div className={cn('mx-auto grid max-w-6xl overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-elevated sm:rounded-[2.25rem]', media && 'lg:grid-cols-[minmax(20rem,0.95fr)_minmax(25rem,1.05fr)]')}>
                    {media ? (
                        <div className="relative min-h-52 overflow-hidden sm:min-h-64 lg:min-h-[35rem]">
                            <Image
                                src={media.src}
                                alt={media.alt}
                                fill
                                priority={media.priorityHint === 'hero'}
                                sizes="(max-width: 1023px) 100vw, 46vw"
                                className="object-cover"
                                style={{ objectPosition: media.objectPosition }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#21162d]/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#21162d]/12" aria-hidden="true" />
                        </div>
                    ) : null}

                    <div
                        className="flex min-h-[25rem] flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16"
                        role={tone === 'error' ? 'alert' : 'status'}
                        aria-live={tone === 'error' ? 'assertive' : 'polite'}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl', iconClass)} aria-hidden="true">
                                <Icon className="h-5 w-5" />
                            </span>
                            <Badge variant="outline" size="md" className="bg-background/70">
                                {eyebrow ?? defaultEyebrow}
                            </Badge>
                        </div>
                        <h1 className="mt-6 max-w-[15ch] font-serif text-4xl font-semibold leading-[1.04] text-balance text-foreground sm:text-5xl">{title}</h1>
                        <div className="mt-5 max-w-[58ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{message}</div>
                        {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
                        {footnote ? <div className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">{footnote}</div> : null}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
