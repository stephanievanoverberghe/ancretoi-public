'use client';

import { useEffect, useMemo, useRef } from 'react';
import { SearchX, Users } from 'lucide-react';

import { AdminStatePanel, isAdminTextEntryTarget, useAdminUrlState, writeAdminUrlParam, type AdminUrlStateCodec } from '../../shared';
import type { AdminUsersFilterState, AdminUsersStats, UiUser } from './admin-users.types';
import AdminUsersCardsView from './AdminUsersCardsView';
import AdminUsersTableView from './AdminUsersTableView';
import AdminUsersToolbar from './AdminUsersToolbar';
import { filterAdminUsers } from './admin-users.utils';

type Props = { users: UiUser[]; initialFilters: AdminUsersFilterState; stats: AdminUsersStats };

const usersUrlCodec: AdminUrlStateCodec<AdminUsersFilterState> = {
    read: (params) => {
        const role = params.get('role');
        const status = params.get('status');
        const sort = params.get('sort');
        return {
            q: params.get('q') ?? '',
            role: role === 'admin' || role === 'user' ? role : 'all',
            status: status === 'active' || status === 'archived' || status === 'suspended' ? status : 'all',
            sort: sort === 'alpha' || sort === 'lastLogin' || sort === 'progress' ? sort : 'recent',
            view: params.get('view') === 'table' ? 'table' : 'cards',
        };
    },
    write: (state, params, previousState) => {
        if (
            state.q.trim() !== previousState.q.trim()
            || state.role !== previousState.role
            || state.status !== previousState.status
            || state.sort !== previousState.sort
        ) {
            params.delete('page');
        }
        writeAdminUrlParam(params, 'q', state.q.trim());
        writeAdminUrlParam(params, 'role', state.role, 'all');
        writeAdminUrlParam(params, 'status', state.status, 'all');
        writeAdminUrlParam(params, 'sort', state.sort, 'recent');
        writeAdminUrlParam(params, 'view', state.view, 'cards');
    },
};

export default function AdminUsersClient({ users, initialFilters, stats }: Props) {
    const [filters, setFilters] = useAdminUrlState({
        codec: usersUrlCodec,
        initialState: initialFilters,
        commitMode: 'router',
    });
    const { q, role: roleFilter, status: statusFilter, sort, view } = filters;

    const searchRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (isAdminTextEntryTarget(e.target)) return;

            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (isAdminTextEntryTarget(e.target)) return;

            if (e.key.toLowerCase() === 'v' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                setFilters((current) => ({ ...current, view: current.view === 'cards' ? 'table' : 'cards' }));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setFilters]);

    const normalizedQuery = q.trim().toLowerCase();
    const filtered = useMemo(() => filterAdminUsers({ users, q: normalizedQuery, roleFilter, statusFilter, sort }), [users, normalizedQuery, roleFilter, statusFilter, sort]);
    const hasFilters = Boolean(q || roleFilter !== 'all' || statusFilter !== 'all');

    return (
        <>
            <AdminUsersToolbar
                qRaw={q}
                searchRef={searchRef}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                sort={sort}
                view={view}
                stats={stats}
                onQueryChange={(value) => setFilters((current) => ({ ...current, q: value }))}
                onClearSearch={() => setFilters((current) => ({ ...current, q: '' }))}
                onRoleFilterChange={(value) => setFilters((current) => ({ ...current, role: value }))}
                onStatusFilterChange={(value) => setFilters((current) => ({ ...current, status: value }))}
                onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
                onViewChange={(value) => setFilters((current) => ({ ...current, view: value }))}
            />

            <div className="@container/admin-users">
                {users.length === 0 ? (
                    <AdminStatePanel
                        kind={hasFilters ? 'filtered-empty' : 'empty'}
                        title={hasFilters ? 'Aucun résultat' : 'Aucun compte apprenant'}
                        description={hasFilters ? 'Modifiez la recherche ou les filtres pour élargir les résultats.' : 'Les nouveaux comptes apparaîtront ici dès leur création.'}
                        icon={hasFilters ? SearchX : Users}
                    />
                ) : filtered.length === 0 ? (
                    <AdminStatePanel
                        kind="filtered-empty"
                        title="Aucun résultat"
                        description={hasFilters ? 'Modifiez la recherche ou les filtres pour élargir les résultats.' : 'Aucun compte ne correspond à cette vue.'}
                        icon={SearchX}
                    />
                ) : view === 'cards' ? (
                    <AdminUsersCardsView users={filtered} />
                ) : (
                    <>
                        <div className="hidden @max-[72rem]/admin-users:block">
                            <AdminUsersCardsView users={filtered} />
                        </div>
                        <div className="hidden @min-[72rem]/admin-users:block">
                            <AdminUsersTableView users={filtered} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
