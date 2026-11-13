import { Star } from 'lucide-react';

import { Badge } from '@/components/ui';

export function StatusBadge({ s }: { s: 'draft' | 'published' }) {
    const label = s === 'published' ? 'Publié' : 'Brouillon';

    return <Badge variant={s === 'published' ? 'success' : 'warning'}>{label}</Badge>;
}

export function FeatureBadge() {
    return (
        <Badge variant="info" className="gap-1">
            <Star className="h-3.5 w-3.5" /> mis en avant
        </Badge>
    );
}

export function SeoBadge({ ok }: { ok: boolean }) {
    return <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'SEO prêt' : 'SEO incomplet'}</Badge>;
}
