'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { isAdminTextEntryTarget, useAdminUrlState, writeAdminUrlParam, type AdminUrlStateCodec } from '../../shared';
import AdminPostQuickViewModal from './AdminPostQuickViewModal';
import AdminPostsCardsView from './AdminPostsCardsView';
import AdminPostsEmptyState from './AdminPostsEmptyState';
import AdminPostsTableView from './AdminPostsTableView';
import AdminPostsToolbar from './AdminPostsToolbar';
import type { AdminPostRow, CategoryOption, SortKey, StatusFilter, ViewMode } from './admin-posts-grid.types';
import { getCategoryNameMap, getFilteredPosts, getPostCounts } from './admin-posts-grid.utils';

export type { AdminPostRow, CategoryOption } from './admin-posts-grid.types';

type PostsUrlState = {
    q: string;
    status: StatusFilter;
    categoryFilter: string;
    sort: SortKey;
    view: ViewMode;
};

const postsUrlCodec: AdminUrlStateCodec<PostsUrlState> = {
    read: (params) => {
        const status = params.get('statut');
        const sort = params.get('tri');
        return {
            q: params.get('q') ?? '',
            status: status === 'draft' || status === 'published' ? status : 'all',
            categoryFilter: params.get('categorie') ?? '__all__',
            sort: sort === 'alpha' ? 'alpha' : 'recent',
            view: params.get('vue') === 'table' ? 'table' : 'cards',
        };
    },
    write: (state, params) => {
        writeAdminUrlParam(params, 'q', state.q.trim());
        writeAdminUrlParam(params, 'statut', state.status, 'all');
        writeAdminUrlParam(params, 'categorie', state.categoryFilter, '__all__');
        writeAdminUrlParam(params, 'tri', state.sort, 'recent');
        writeAdminUrlParam(params, 'vue', state.view, 'cards');
    },
};

export default function AdminPostsClient({ rows, categories }: { rows: AdminPostRow[]; categories: CategoryOption[] }) {
    const catNameBySlug = useMemo(() => getCategoryNameMap(categories), [categories]);
    const [filters, setFilters] = useAdminUrlState({ codec: postsUrlCodec });
    const { q, status, categoryFilter, sort, view } = filters;
    const searchRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (isAdminTextEntryTarget(event.target)) return;

            if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const counts = useMemo(() => getPostCounts(rows), [rows]);
    const normalizedQuery = q.trim().toLowerCase();
    const filtered = useMemo(() => getFilteredPosts(rows, catNameBySlug, { q: normalizedQuery, status, categoryFilter, sort }), [rows, catNameBySlug, normalizedQuery, status, categoryFilter, sort]);

    const [openSlug, setOpenSlug] = useState<string | null>(null);
    const current = useMemo(() => rows.find((row) => row.slug === openSlug) ?? null, [openSlug, rows]);
    const currentCatName = useMemo(() => (current?.category ? catNameBySlug.get(current.category) || current.category : null), [current, catNameBySlug]);

    return (
        <>
            <AdminPostsToolbar
                searchRef={searchRef}
                qRaw={q}
                onQueryRawChange={(value) => setFilters((current) => ({ ...current, q: value }))}
                onClearSearch={() => setFilters((current) => ({ ...current, q: '' }))}
                status={status}
                onStatusChange={(value) => setFilters((current) => ({ ...current, status: value }))}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={(value) => setFilters((current) => ({ ...current, categoryFilter: value }))}
                sort={sort}
                onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
                view={view}
                onViewChange={(value) => setFilters((current) => ({ ...current, view: value }))}
                counts={counts}
                categories={categories}
            />

            {filtered.length === 0 && <AdminPostsEmptyState filtered={rows.length > 0} />}

            <div className="@container/admin-collection">
            {filtered.length > 0 && view === 'cards' ? <AdminPostsCardsView items={filtered} catNameBySlug={catNameBySlug} onQuick={setOpenSlug} /> : null}

            {filtered.length > 0 && view === 'table' ? (
                <>
                    <div className="@min-[72rem]/admin-collection:hidden">
                        <AdminPostsCardsView items={filtered} catNameBySlug={catNameBySlug} onQuick={setOpenSlug} />
                    </div>
                    <div className="hidden @min-[72rem]/admin-collection:block">
                        <AdminPostsTableView items={filtered} catNameBySlug={catNameBySlug} onQuick={setOpenSlug} />
                    </div>
                </>
            ) : null}
            </div>

            <AdminPostQuickViewModal open={!!openSlug} onClose={() => setOpenSlug(null)} row={current} categoryName={currentCatName} />
        </>
    );
}
