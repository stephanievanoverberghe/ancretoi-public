// src/features/administration/apprenants/AdministrationApprenantsPage.tsx
import { Archive, ShieldCheck, TriangleAlert, UserCheck, Users } from 'lucide-react';

import { requireAdmin } from '@/server/auth/authz';
import { getAdministrationApprenantsData } from '@/server/administration/apprenants.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../shared';
import { AdminUsersClient, type AdminUsersFilterState, type RoleFilter, type SortKey, type StatusFilter, type UiUser, type ViewMode } from './components';
import AdminUsersPagination from './components/AdminUsersPagination';

export type AdministrationApprenantsSearchParams = {
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
    view?: string;
    page?: string;
};

function parseFilters(params: AdministrationApprenantsSearchParams): AdminUsersFilterState {
    const roles: RoleFilter[] = ['all', 'admin', 'user'];
    const statuses: StatusFilter[] = ['all', 'active', 'archived', 'suspended'];
    const sorts: SortKey[] = ['recent', 'alpha', 'lastLogin', 'progress'];
    const views: ViewMode[] = ['cards', 'table'];

    return {
        q: (params.q ?? '').trim(),
        role: roles.includes(params.role as RoleFilter) ? (params.role as RoleFilter) : 'all',
        status: statuses.includes(params.status as StatusFilter) ? (params.status as StatusFilter) : 'all',
        sort: sorts.includes(params.sort as SortKey) ? (params.sort as SortKey) : 'recent',
        view: views.includes(params.view as ViewMode) ? (params.view as ViewMode) : 'cards',
    };
}

function serializeSearchParams(params: AdministrationApprenantsSearchParams) {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value) search.set(key, value);
    }

    return search.toString();
}

export async function AdministrationApprenantsPage({ searchParams }: { searchParams?: Promise<AdministrationApprenantsSearchParams> }) {
    const me = await requireAdmin();
    const params = (await searchParams) ?? {};
    const filters = parseFilters(params);
    const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
    let data: Awaited<ReturnType<typeof getAdministrationApprenantsData>>;

    try {
        data = await getAdministrationApprenantsData(me.email, { ...filters, page });
    } catch {
        return (
            <div className="mx-auto max-w-[88rem] space-y-8">
                <AdminPageHeader
                    title="Apprenants"
                    description="Comptes, accès et progression pédagogique."
                    breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Apprenants' }]}
                />
                <AdminStatePanel
                    kind="error"
                    title="Impossible de charger les apprenants"
                    description="Les données sont momentanément indisponibles. Réessayez dans quelques instants."
                    icon={TriangleAlert}
                />
            </div>
        );
    }

    const { users, stats, pagination } = data;

    return (
        <div className="mx-auto max-w-[88rem] space-y-8">
            <AdminPageHeader
                title="Apprenants"
                eyebrow="Audience"
                description="Retrouvez chaque compte, sa dernière activité et l’avancement réel de ses parcours."
                breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Apprenants' }]}
                stats={
                    <>
                        <AdminKpiCard label="Total" value={stats.total} icon={Users} />
                        <AdminKpiCard label="Administrateurs" value={stats.admins} icon={ShieldCheck} />
                        <AdminKpiCard label="Actifs" value={stats.active} icon={UserCheck} />
                        <AdminKpiCard label="Archivés" value={stats.archived} icon={Archive} />
                    </>
                }
            />

            <AdminUsersClient users={users as UiUser[]} initialFilters={filters} stats={stats} />
            <AdminUsersPagination {...pagination} currentSearch={serializeSearchParams(params)} />
        </div>
    );
}
