'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { isAdminTextEntryTarget, useAdminUrlState, writeAdminUrlParam, type AdminUrlStateCodec } from '../../shared';
import { AdminInspirationsGridView } from './AdminInspirationsGridView';
import { AdminInspirationsToolbar } from './AdminInspirationsToolbar';
import { AdminInspirationsTableView } from './AdminInspirationsTableView';
import { InspirationQuickViewModal } from './InspirationQuickViewModal';
import type { AdminInspirationRow, InspirationSortKey, InspirationStatusFilter, InspirationViewMode } from './admin-inspirations.types';
import {
    filterAndSortInspirations,
    getInspirationStats,
    getInspirationTags,
} from './admin-inspirations.utils';

type InspirationsUrlState = {
    q: string;
    status: InspirationStatusFilter;
    tag: string;
    sort: InspirationSortKey;
    view: InspirationViewMode;
};

const inspirationsUrlCodec: AdminUrlStateCodec<InspirationsUrlState> = {
    read: (params) => {
        const status = params.get('statut');
        const sort = params.get('tri');
        return {
            q: params.get('q') ?? '',
            status: status === 'draft' || status === 'published' ? status : 'all',
            tag: params.get('tag') ?? '',
            sort: sort === 'alphaAsc' || sort === 'alphaDesc' ? sort : 'recent',
            view: params.get('vue') === 'table' ? 'table' : 'cards',
        };
    },
    write: (state, params) => {
        writeAdminUrlParam(params, 'q', state.q.trim());
        writeAdminUrlParam(params, 'statut', state.status, 'all');
        writeAdminUrlParam(params, 'tag', state.tag);
        writeAdminUrlParam(params, 'tri', state.sort, 'recent');
        writeAdminUrlParam(params, 'vue', state.view, 'cards');
    },
};

export default function AdminInspirationsGridClient({ rows }: { rows: AdminInspirationRow[] }) {
    const [filters, setFilters] = useAdminUrlState({ codec: inspirationsUrlCodec });
    const { q, status, tag, sort, view } = filters;
    const searchRef = useRef<HTMLInputElement | null>(null);

    const uniqueTags = useMemo(() => getInspirationTags(rows), [rows]);
    const stats = useMemo(() => getInspirationStats(rows), [rows]);
    const filtered = useMemo(() => filterAndSortInspirations(rows, q, status, sort, tag), [rows, q, status, sort, tag]);

    const [openSlug, setOpenSlug] = useState<string | null>(null);
    const current = useMemo(() => rows.find((row) => row.slug === openSlug) ?? null, [openSlug, rows]);

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

    return (
        <>
            <AdminInspirationsToolbar
                qRaw={q}
                onQueryChange={(value) => setFilters((current) => ({ ...current, q: value }))}
                onClearQuery={() => setFilters((current) => ({ ...current, q: '' }))}
                searchRef={searchRef}
                status={status}
                onStatusChange={(value) => setFilters((current) => ({ ...current, status: value }))}
                tag={tag}
                onTagChange={(value) => setFilters((current) => ({ ...current, tag: value }))}
                uniqueTags={uniqueTags}
                sort={sort}
                onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
                stats={stats}
                view={view}
                onViewChange={(value) => setFilters((current) => ({ ...current, view: value }))}
            />

            <div className="@container/admin-collection">
                {view === 'table' && filtered.length > 0 ? (
                    <>
                        <div className="@min-[72rem]/admin-collection:hidden"><AdminInspirationsGridView rows={filtered} allRowsCount={rows.length} selectedTag={tag} onTagToggle={(value) => setFilters((current) => ({ ...current, tag: current.tag === value ? '' : value }))} onPreview={setOpenSlug} /></div>
                        <div className="hidden @min-[72rem]/admin-collection:block"><AdminInspirationsTableView rows={filtered} onPreview={setOpenSlug} /></div>
                    </>
                ) : (
                    <AdminInspirationsGridView rows={filtered} allRowsCount={rows.length} selectedTag={tag} onTagToggle={(value) => setFilters((current) => ({ ...current, tag: current.tag === value ? '' : value }))} onPreview={setOpenSlug} />
                )}
            </div>

            <InspirationQuickViewModal open={!!openSlug} onClose={() => setOpenSlug(null)} row={current} />
        </>
    );
}
