import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

type StatTileProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon?: LucideIcon;
    className?: string;
};

/**
 * Tuile de statistique commune à l'espace apprenant (KPI dashboard, bilan).
 */
export function StatTile({ label, value, hint, icon: Icon, className }: StatTileProps) {
    return (
        <div className={cn('rounded-2xl border border-border bg-surface p-4', className)}>
            <div className="flex items-center gap-2">
                {Icon ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="mt-2 font-serif text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            {hint ? <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
        </div>
    );
}
