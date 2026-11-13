import type { AdminUsersStats, RoleFilter, SortKey, StatusFilter, UiUser } from './admin-users.types';

export function formatRelative(iso: string) {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;

    if (diff < hr) return `${Math.max(1, Math.round(diff / min))} min`;
    if (diff < day) return `${Math.round(diff / hr)} h`;
    return d.toLocaleDateString('fr-FR');
}

export function formatActivity(iso: string | null) {
    return iso ? formatRelative(iso) : 'Jamais';
}

export function getUserInitials(user: Pick<UiUser, 'name' | 'email'>) {
    const source = user.name?.trim() || user.email.split('@')[0] || '?';
    const words = source.split(/[\s._-]+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || '?';
}

export const cls = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export function getAdminUsersStats(users: UiUser[]): AdminUsersStats {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const usersCount = total - admins;
    const active = users.filter((u) => !u.isArchived && !u.isSuspended).length;
    const archived = users.filter((u) => !!u.isArchived).length;
    const suspended = users.filter((u) => !!u.isSuspended).length;

    return { total, admins, usersCount, active, archived, suspended };
}

export function filterAdminUsers({
    users,
    q,
    roleFilter,
    statusFilter,
    sort,
}: {
    users: UiUser[];
    q: string;
    roleFilter: RoleFilter;
    statusFilter: StatusFilter;
    sort: SortKey;
}) {
    let list = users.slice();

    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') {
        list = list.filter((u) => {
            if (statusFilter === 'active') return !u.isArchived && !u.isSuspended;
            if (statusFilter === 'archived') return !!u.isArchived;
            if (statusFilter === 'suspended') return !!u.isSuspended;
            return true;
        });
    }
    if (q) list = list.filter((u) => `${u.name || ''} ${u.email}`.toLowerCase().includes(q));

    if (sort === 'alpha') {
        list.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email, 'fr', { sensitivity: 'base' }));
    } else if (sort === 'lastLogin') {
        list.sort((a, b) => new Date(b.lastLoginAtIso ?? 0).getTime() - new Date(a.lastLoginAtIso ?? 0).getTime());
    } else if (sort === 'progress') {
        list.sort((a, b) => b.averageProgressPct - a.averageProgressPct);
    } else {
        list.sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
    }

    return list;
}
