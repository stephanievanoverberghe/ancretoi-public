import { AlertCircle, Check, Circle, LoaderCircle, PencilLine } from 'lucide-react';

import { cn } from '@/lib/cn';

export type AdminSaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

const statusContent = {
    clean: { label: 'Aucune modification', icon: Circle, className: 'text-muted-foreground' },
    dirty: { label: 'Modifications non enregistrées', icon: PencilLine, className: 'text-warning' },
    saving: { label: 'Enregistrement…', icon: LoaderCircle, className: 'text-primary' },
    saved: { label: 'Enregistré', icon: Check, className: 'text-success' },
    error: { label: 'Échec de l’enregistrement', icon: AlertCircle, className: 'text-danger' },
} as const;

type AdminSaveStatusProps = {
    state: AdminSaveState;
    label?: string;
    className?: string;
};

export function AdminSaveStatus({ state, label, className }: AdminSaveStatusProps) {
    const content = statusContent[state];
    const Icon = content.icon;

    return (
        <span className={cn('inline-flex min-h-9 items-center gap-2 rounded-full bg-surface-muted px-3 text-xs font-semibold', content.className, className)} role="status" aria-live="polite">
            <Icon className={cn('h-3.5 w-3.5', state === 'saving' && 'motion-safe:animate-spin motion-reduce:animate-none')} aria-hidden="true" />
            {label ?? content.label}
        </span>
    );
}
