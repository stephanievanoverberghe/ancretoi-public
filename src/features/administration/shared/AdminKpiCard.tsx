import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';

type AdminKpiCardProps = {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    href?: string;
    helper?: string;
    className?: string;
    tone?: 'primary' | 'secondary' | 'accent' | 'neutral';
};

const toneClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/15 text-accent-foreground',
    neutral: 'bg-surface-muted text-muted-foreground',
} as const;

export function AdminKpiCard({ label, value, icon: Icon, href, helper, className, tone = 'primary' }: AdminKpiCardProps) {
    const content = (
        <>
            <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium leading-snug text-muted-foreground">{label}</p>
                {Icon ? (
                    <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', toneClasses[tone])} aria-hidden="true">
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}
            </div>
            <p className="mt-5 font-serif text-3xl font-semibold tabular-nums leading-none text-foreground">{value}</p>
            {helper ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{helper}</p> : null}
        </>
    );
    const cardClassName = cn(
        'min-h-36 rounded-3xl border-border/80 p-5 shadow-soft sm:p-6',
        href && 'motion-safe:transition-[border-color,background-color,transform] motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none hover:border-primary/30 hover:bg-primary/[0.035] focus-within:border-primary/35',
        className,
    );

    return href ? (
        <Card className={cardClassName}>
            <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label={`${label} : ${String(value)}`}>
                {content}
            </Link>
        </Card>
    ) : (
        <Card className={cardClassName}>{content}</Card>
    );
}
