import Link from 'next/link';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui';

export type AdminBreadcrumb = {
    label: string;
    href?: string;
};

type AdminPageHeaderProps = {
    title: string;
    description: string;
    breadcrumbs?: readonly AdminBreadcrumb[];
    actions?: ReactNode;
    stats?: ReactNode;
    eyebrow?: string;
};

export function AdminPageHeader({ title, description, breadcrumbs, actions, stats, eyebrow }: AdminPageHeaderProps) {
    return (
        <Card className="relative overflow-hidden rounded-[2rem] border-primary/15 bg-gradient-to-br from-primary/12 via-surface to-secondary/10 shadow-soft">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
            <div className="relative p-6 sm:p-8 lg:p-10">
                {breadcrumbs?.length ? (
                    <nav aria-label="Fil d’Ariane" className="mb-3">
                        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            {breadcrumbs.map((item, index) => (
                                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="rounded-sm motion-safe:transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span aria-current="page" className="text-foreground">
                                            {item.label}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                ) : null}

                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
                        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{title}</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
                    </div>
                    {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
                </div>

                {stats ? <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-4">{stats}</div> : null}
            </div>
        </Card>
    );
}
