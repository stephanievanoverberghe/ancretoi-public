import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/cn';

type AdminPanelProps = {
    children: ReactNode;
    title?: string;
    description?: string;
    eyebrow?: string;
    actions?: ReactNode;
    className?: string;
    contentClassName?: string;
    titleAs?: 'h2' | 'h3' | 'h4';
};

export function AdminPanel({
    children,
    title,
    description,
    eyebrow,
    actions,
    className,
    contentClassName,
    titleAs = 'h2',
}: AdminPanelProps) {
    const hasHeader = title || description || eyebrow || actions;

    return (
        <Card className={cn('overflow-hidden rounded-3xl border-border/80 bg-surface', className)}>
            {hasHeader ? (
                <CardHeader className="flex flex-col gap-4 border-b border-border/70 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between lg:p-7">
                    <div className="min-w-0">
                        {eyebrow ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
                        {title ? <CardTitle as={titleAs} className="font-serif text-xl sm:text-2xl">{title}</CardTitle> : null}
                        {description ? <CardDescription className="mt-1 max-w-2xl">{description}</CardDescription> : null}
                    </div>
                    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
                </CardHeader>
            ) : null}
            <CardContent className={cn(hasHeader ? 'p-5 sm:p-6 lg:p-7' : 'p-5 sm:p-6 lg:p-7', contentClassName)}>{children}</CardContent>
        </Card>
    );
}
