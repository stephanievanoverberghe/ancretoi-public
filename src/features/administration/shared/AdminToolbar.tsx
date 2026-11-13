import type { ReactNode } from 'react';

import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';

type AdminToolbarProps = {
    children: ReactNode;
    ariaLabel: string;
    summary?: ReactNode;
    className?: string;
    sticky?: boolean;
};

export function AdminToolbar({ children, ariaLabel, summary, className, sticky = true }: AdminToolbarProps) {
    return (
        <Card
            role="search"
            aria-label={ariaLabel}
            className={cn(
                'mb-6 rounded-3xl border-border/80 bg-surface/95 p-4 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-surface/88 sm:p-5',
                sticky && 'sticky top-16 z-30',
                className,
            )}
        >
            <div className="space-y-4">{children}</div>
            {summary ? <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">{summary}</div> : null}
        </Card>
    );
}
