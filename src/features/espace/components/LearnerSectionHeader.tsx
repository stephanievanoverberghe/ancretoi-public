import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LearnerSectionHeaderProps = {
    id?: string;
    title: string;
    description?: string;
    /** Action alignée à droite du titre (lien « voir tout », bouton…). */
    action?: ReactNode;
    /** Niveau de titre sémantique (h1 pour la page, h2 pour les sections). */
    as?: 'h1' | 'h2' | 'h3';
    className?: string;
};

const titleSizes = {
    h1: 'font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl',
    h2: 'font-serif text-xl font-semibold leading-tight text-foreground sm:text-2xl',
    h3: 'font-serif text-lg font-semibold leading-tight text-foreground',
} as const;

/**
 * En-tête de section commun à l'espace apprenant : titre serif, description
 * optionnelle et action alignée à droite.
 */
export function LearnerSectionHeader({ id, title, description, action, as = 'h2', className }: LearnerSectionHeaderProps) {
    const Heading = as as ElementType;

    return (
        <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
            <div className="min-w-0">
                <Heading id={id} className={titleSizes[as]}>{title}</Heading>
                {description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
