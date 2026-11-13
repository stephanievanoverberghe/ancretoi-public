import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

export type Crumb = {
    label: string;
    href?: string;
};

type BreadcrumbsVariant = 'default' | 'hero';

type BreadcrumbsProps = {
    items: readonly Crumb[];
    variant?: BreadcrumbsVariant;
    className?: string;
};

const breadcrumbVariants: Record<BreadcrumbsVariant, string> = {
    default: 'mb-4 text-sm text-muted-foreground',
    hero: 'mb-4 inline-flex rounded-full border border-border bg-background/66 px-3 py-2 text-sm text-muted-foreground shadow-soft backdrop-blur',
};

/**
 * Fil d'Ariane server-safe pour les pages publiques et les surfaces internes.
 * Un item sans `href`, ou le dernier item, est rendu comme page courante.
 */
export default function Breadcrumbs({ items, variant = 'default', className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Fil d'Ariane" className={cn(breadcrumbVariants[variant], className)}>
            <ol className="flex flex-wrap items-center gap-1.5">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <li key={`${item.href ?? item.label}-${i}`} className="flex items-center gap-1">
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={isLast ? 'page' : undefined} className={cn('font-medium', isLast ? 'text-foreground' : 'text-foreground/80')}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
