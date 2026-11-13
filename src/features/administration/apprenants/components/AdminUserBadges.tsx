import { Badge } from '@/components/ui';

import type { UiUser } from './admin-users.types';

const warningBadgeClassName = 'gap-1.5 border-warning/45 bg-warning/10 text-foreground';

function WarningDot() {
    return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />;
}

export function RoleBadge({ role }: { role: UiUser['role'] }) {
    if (role === 'admin') {
        return (
            <Badge variant="warning" className={warningBadgeClassName}>
                <WarningDot />
                Admin
            </Badge>
        );
    }

    return <Badge variant="outline">Apprenant</Badge>;
}

export function StateBadges({ archived, suspended }: { archived?: boolean; suspended?: boolean }) {
    return (
        <div className="flex items-center gap-1">
            {suspended && (
                <Badge variant="warning" className={warningBadgeClassName}>
                    <WarningDot />
                    Suspendu
                </Badge>
            )}
            {archived && <Badge variant="outline">Archivé</Badge>}
        </div>
    );
}
