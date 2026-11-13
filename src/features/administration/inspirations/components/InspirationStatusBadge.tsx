import { Badge } from '@/components/ui';

import type { AdminInspirationRow } from './admin-inspirations.types';

type InspirationStatusBadgeProps = {
    status: AdminInspirationRow['status'];
};

export function InspirationStatusBadge({ status }: InspirationStatusBadgeProps) {
    const label = status === 'published' ? 'Publié' : 'Brouillon';

    return <Badge variant={status === 'published' ? 'success' : 'warning'}>{label}</Badge>;
}
