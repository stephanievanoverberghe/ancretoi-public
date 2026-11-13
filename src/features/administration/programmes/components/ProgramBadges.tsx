import { Badge } from '@/components/ui';

import type { AdminProgramRow } from './admin-programs-grid.types';

export function StatusBadge({ s }: { s: AdminProgramRow['status'] }) {
    const label = s === 'draft' ? 'Brouillon' : s === 'preflight' ? 'Préflight' : 'Publié';
    const variant = s === 'published' ? 'success' : s === 'preflight' ? 'warning' : 'outline';

    return (
        <Badge variant={variant} className={variant === 'warning' ? 'border-warning/45 bg-warning/10 text-foreground' : undefined}>
            {label}
        </Badge>
    );
}

export function LevelBadge({ level }: { level: AdminProgramRow['meta']['level'] }) {
    if (!level) return null;

    const variant = level === 'Premium' ? 'warning' : level === 'Cible' ? 'secondary' : 'default';

    return (
        <Badge variant={variant} className={variant === 'warning' ? 'border-warning/45 bg-warning/10 text-foreground' : undefined}>
            {level}
        </Badge>
    );
}
