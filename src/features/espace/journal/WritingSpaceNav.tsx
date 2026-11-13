import { BookHeart, StickyNote } from 'lucide-react';
import Link from 'next/link';

import { espaceRoutes } from '@/config/routes';
import { cn } from '@/lib/cn';

type WritingSpaceNavProps = {
    active: 'journal' | 'notes';
};

const items = [
    {
        key: 'journal',
        href: espaceRoutes.journal,
        label: 'Journal guidé',
        description: 'Tes réponses aux exercices',
        icon: BookHeart,
    },
    {
        key: 'notes',
        href: espaceRoutes.notes,
        label: 'Notes libres',
        description: 'Tes mots écrits sans consigne',
        icon: StickyNote,
    },
] as const;

export function WritingSpaceNav({ active }: WritingSpaceNavProps) {
    return (
        <nav aria-label="Mes espaces d’écriture" className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                const selected = item.key === active;

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        aria-current={selected ? 'page' : undefined}
                        className={cn(
                            'flex min-h-18 items-center gap-4 rounded-2xl border px-5 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                            selected
                                ? 'border-primary/30 bg-primary/10 text-foreground'
                                : 'border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                        )}
                    >
                        <span
                            className={cn(
                                'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                                selected ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-primary',
                            )}
                            aria-hidden="true"
                        >
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
