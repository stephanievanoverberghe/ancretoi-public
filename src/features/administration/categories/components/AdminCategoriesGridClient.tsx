'use client';

import { useEffect, useMemo, useRef } from 'react';

import { isAdminTextEntryTarget, useAdminUrlState, writeAdminUrlParam, type AdminUrlStateCodec } from '../../shared';
import { AdminCategoriesResults } from './AdminCategoriesResults';
import { AdminCategoriesToolbar } from './AdminCategoriesToolbar';
import type { AdminCategoryRow, CategorySortKey, CategoryViewMode } from './admin-categories.types';
import { filterAndSortCategories } from './admin-categories.utils';

type CategoriesUrlState = {
    q: string;
    sort: CategorySortKey;
    onlyUnused: boolean;
    view: CategoryViewMode;
};

const categoriesUrlCodec: AdminUrlStateCodec<CategoriesUrlState> = {
    read: (params) => {
        const sort = params.get('tri');
        return {
            q: params.get('q') ?? '',
            sort: sort === 'alphaDesc' || sort === 'usageDesc' || sort === 'recent' ? sort : 'alphaAsc',
            onlyUnused: params.get('inutilisees') === '1',
            view: params.get('vue') === 'table' ? 'table' : 'cards',
        };
    },
    write: (state, params) => {
        writeAdminUrlParam(params, 'q', state.q.trim());
        writeAdminUrlParam(params, 'tri', state.sort, 'alphaAsc');
        writeAdminUrlParam(params, 'inutilisees', state.onlyUnused ? '1' : '');
        writeAdminUrlParam(params, 'vue', state.view, 'cards');
    },
};

export default function AdminCategoriesGridClient({ rows }: { rows: AdminCategoryRow[] }) {
    const [filters, setFilters] = useAdminUrlState({ codec: categoriesUrlCodec });
    const { q, sort, onlyUnused, view } = filters;
    const searchRef = useRef<HTMLInputElement | null>(null);

    const filtered = useMemo(() => filterAndSortCategories(rows, q, sort, onlyUnused), [rows, q, sort, onlyUnused]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (isAdminTextEntryTarget(event.target)) return;

            if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                searchRef.current?.focus();
            }
            if (event.key.toLowerCase() === 'v' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                setFilters((current) => ({ ...current, view: current.view === 'cards' ? 'table' : 'cards' }));
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setFilters]);

    return (
        <>
            <AdminCategoriesToolbar
                qRaw={q}
                onQueryChange={(value) => setFilters((current) => ({ ...current, q: value }))}
                onClearQuery={() => setFilters((current) => ({ ...current, q: '' }))}
                searchRef={searchRef}
                sort={sort}
                onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
                onlyUnused={onlyUnused}
                onOnlyUnusedChange={(value) => setFilters((current) => ({ ...current, onlyUnused: value }))}
                view={view}
                onViewChange={(value) => setFilters((current) => ({ ...current, view: value }))}
            />

            <div className="@container/admin-collection">
                <AdminCategoriesResults rows={filtered} view={view} filtered={rows.length > 0} />
            </div>
        </>
    );
}
