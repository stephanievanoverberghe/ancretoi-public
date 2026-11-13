import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LearnerEmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description: string;
    /** Boutons ou liens d'action rendus sous la description. */
    actions?: ReactNode;
    className?: string;
};

/**
 * État vide commun à l'espace apprenant (aucun cours, aucune note, aucune
 * ressource) : icône, titre, description et actions.
 */
export function LearnerEmptyState({ icon: Icon, title, description, actions, className }: LearnerEmptyStateProps) {
    return (
        <div role="status" className={cn('rounded-3xl border border-dashed border-border bg-surface p-8 text-center sm:p-10', className)}>
            {Icon ? (
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
                    <Icon className="h-6 w-6" />
                </span>
            ) : null}
            <h3 className="mt-4 font-serif text-xl font-semibold leading-tight text-foreground">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
            {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
        </div>
    );
}
