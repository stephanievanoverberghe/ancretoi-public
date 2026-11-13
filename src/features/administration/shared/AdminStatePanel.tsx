import { AlertTriangle, Inbox, LoaderCircle, SearchX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type AdminStateKind = 'loading' | 'error' | 'empty' | 'filtered-empty';

const stateIcons: Record<AdminStateKind, LucideIcon> = {
    loading: LoaderCircle,
    error: AlertTriangle,
    empty: Inbox,
    'filtered-empty': SearchX,
};

type AdminStatePanelProps = {
    kind: AdminStateKind;
    title: string;
    description: string;
    action?: ReactNode;
    icon?: LucideIcon;
    compact?: boolean;
    className?: string;
    headingAs?: 'h2' | 'h3';
};

export function AdminStatePanel({ kind, title, description, action, icon, compact = false, className, headingAs = 'h2' }: AdminStatePanelProps) {
    const Icon = icon ?? stateIcons[kind];
    const Heading = headingAs;
    const isError = kind === 'error';

    return (
        <div
            className={cn(
                'grid place-items-center rounded-3xl border border-dashed border-border bg-surface-muted/45 text-center',
                compact ? 'min-h-36 p-4' : 'min-h-56 p-6 sm:p-8',
                className,
            )}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            aria-busy={kind === 'loading' || undefined}
        >
            <div className="max-w-md">
                <span className={cn('mx-auto inline-flex items-center justify-center rounded-full bg-primary/10 text-primary', compact ? 'h-10 w-10' : 'h-12 w-12')} aria-hidden="true">
                    <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5', kind === 'loading' && 'motion-safe:animate-spin motion-reduce:animate-none')} />
                </span>
                <Heading className={cn('font-serif font-semibold text-foreground', compact ? 'mt-3 text-base' : 'mt-4 text-xl')}>{title}</Heading>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
            </div>
        </div>
    );
}
