'use client';

import type { RefObject } from 'react';
import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, Table as TableIcon, X } from 'lucide-react';

import { AdminToolbar } from '../../shared';
import type { AdminUsersStats, RoleFilter, SortKey, StatusFilter, ViewMode } from './admin-users.types';
import { cls } from './admin-users.utils';

type Props = {
    qRaw: string;
    searchRef: RefObject<HTMLInputElement | null>;
    roleFilter: RoleFilter;
    statusFilter: StatusFilter;
    sort: SortKey;
    view: ViewMode;
    stats: AdminUsersStats;
    onQueryChange: (value: string) => void;
    onClearSearch: () => void;
    onRoleFilterChange: (value: RoleFilter) => void;
    onStatusFilterChange: (value: StatusFilter) => void;
    onSortChange: (value: SortKey) => void;
    onViewChange: (value: ViewMode) => void;
};

type FilterControlsProps = Pick<
    Props,
    | 'roleFilter'
    | 'statusFilter'
    | 'sort'
    | 'view'
    | 'stats'
    | 'onRoleFilterChange'
    | 'onStatusFilterChange'
    | 'onSortChange'
    | 'onViewChange'
> & {
    idPrefix: string;
    includeView?: boolean;
    className?: string;
};

export default function AdminUsersToolbar({
    qRaw,
    searchRef,
    roleFilter,
    statusFilter,
    sort,
    view,
    stats,
    onQueryChange,
    onClearSearch,
    onRoleFilterChange,
    onStatusFilterChange,
    onSortChange,
    onViewChange,
}: Props) {
    const filterProps = {
        roleFilter,
        statusFilter,
        sort,
        view,
        stats,
        onRoleFilterChange,
        onStatusFilterChange,
        onSortChange,
        onViewChange,
    };

    return (
        <AdminToolbar
            ariaLabel="Filtrer les apprenants"
            summary={`${stats.total} compte${stats.total > 1 ? 's' : ''} · ${stats.active} actif${stats.active > 1 ? 's' : ''} · ${stats.suspended} suspendu${stats.suspended > 1 ? 's' : ''}`}
        >
            <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Rechercher par nom ou email…"
                    value={qRaw}
                    onChange={(event) => onQueryChange(event.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-10 text-sm text-foreground outline-none motion-safe:transition-colors motion-reduce:transition-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                    aria-label="Rechercher un utilisateur"
                />
                {qRaw ? (
                    <button
                        aria-label="Effacer la recherche"
                        type="button"
                        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={onClearSearch}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                ) : null}
            </div>

            <details className="group rounded-xl border border-border bg-surface lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30">
                    <span className="inline-flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
                        Filtres et tri
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground motion-safe:transition-transform motion-safe:group-open:rotate-180 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <FilterControls {...filterProps} idPrefix="users-mobile" className="grid gap-3 border-t border-border p-3" />
            </details>

            <FilterControls
                {...filterProps}
                idPrefix="users-desktop"
                includeView
                className="hidden gap-3 lg:grid lg:grid-cols-2 2xl:grid-cols-[minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(12rem,1fr)_minmax(15rem,1.25fr)]"
            />
        </AdminToolbar>
    );
}

function FilterControls({
    idPrefix,
    includeView = false,
    className,
    roleFilter,
    statusFilter,
    sort,
    view,
    stats,
    onRoleFilterChange,
    onStatusFilterChange,
    onSortChange,
    onViewChange,
}: FilterControlsProps) {
    return (
        <div className={className}>
            <SelectControl
                id={`${idPrefix}-role`}
                label="Filtrer par rôle"
                value={roleFilter}
                onChange={(value) => onRoleFilterChange(value as RoleFilter)}
                options={[
                    ['all', `Tous les rôles (${stats.total})`],
                    ['admin', `Administrateurs (${stats.admins})`],
                    ['user', `Apprenants (${stats.usersCount})`],
                ]}
            />
            <SelectControl
                id={`${idPrefix}-status`}
                label="Filtrer par état"
                value={statusFilter}
                onChange={(value) => onStatusFilterChange(value as StatusFilter)}
                options={[
                    ['all', `Tous les états (${stats.total})`],
                    ['active', `Actifs (${stats.active})`],
                    ['archived', `Archivés (${stats.archived})`],
                    ['suspended', `Suspendus (${stats.suspended})`],
                ]}
            />
            <SelectControl
                id={`${idPrefix}-sort`}
                label="Trier les apprenants"
                value={sort}
                onChange={(value) => onSortChange(value as SortKey)}
                options={[
                    ['recent', 'Inscription récente'],
                    ['lastLogin', 'Dernière connexion'],
                    ['progress', 'Progression décroissante'],
                    ['alpha', 'Nom A → Z'],
                ]}
            />

            {includeView ? (
                <div role="group" aria-label="Mode d’affichage" className="inline-flex h-11 items-center rounded-xl border border-border bg-surface p-1">
                    <ViewButton active={view === 'cards'} onClick={() => onViewChange('cards')} icon={<LayoutGrid className="h-4 w-4" />}>
                        Cartes
                    </ViewButton>
                    <ViewButton active={view === 'table'} onClick={() => onViewChange('table')} icon={<TableIcon className="h-4 w-4" />}>
                        Tableau
                    </ViewButton>
                </div>
            ) : null}
        </div>
    );
}

function SelectControl({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
    return (
        <div className="relative">
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-border bg-surface py-2 pl-3 pr-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
    );
}

function ViewButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cls(
                'flex h-full flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
            )}
        >
            {icon}
            {children}
        </button>
    );
}
