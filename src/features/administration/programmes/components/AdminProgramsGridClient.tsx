'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { isAdminTextEntryTarget, useAdminUrlState, writeAdminUrlParam, type AdminUrlStateCodec } from '../../shared';
import AdminProgramCard from './AdminProgramCard';
import AdminProgramQuickViewModal from './AdminProgramQuickViewModal';
import AdminProgramsEmptyState from './AdminProgramsEmptyState';
import AdminProgramsToolbar from './AdminProgramsToolbar';
import AdminProgramsTableView from './AdminProgramsTableView';
import CreationSuccessModal from './CreationSuccessModal';
import ProgramDeletionSuccessModal from './ProgramDeletionSuccessModal';
import type { AdminProgramRow, LevelFilter, SortKey, StatusFilter, ViewMode } from './admin-programs-grid.types';
import { getFilteredPrograms, getProgramStats, getUniqueTags } from './admin-programs-grid.utils';

export type { AdminProgramRow } from './admin-programs-grid.types';

type ProgramUrlState = {
    q: string;
    status: StatusFilter;
    level: LevelFilter;
    tag: string;
    sort: SortKey;
    view: ViewMode;
};

function readProgramFilters(params: URLSearchParams): ProgramUrlState {
    const statusValue = params.get('statut');
    const levelValue = params.get('niveau');
    const sortValue = params.get('tri');

    return {
        q: params.get('q') ?? '',
        status: (statusValue === 'draft' || statusValue === 'preflight' || statusValue === 'published' ? statusValue : 'all') as StatusFilter,
        level: (levelValue === 'Basique' || levelValue === 'Cible' || levelValue === 'Premium' ? levelValue : '') as LevelFilter,
        tag: params.get('tag') ?? '',
        sort: (sortValue === 'alphaAsc' || sortValue === 'alphaDesc' ? sortValue : 'recent') as SortKey,
        view: (params.get('vue') === 'table' ? 'table' : 'cards') as ViewMode,
    };
}

const programUrlCodec: AdminUrlStateCodec<ProgramUrlState> = {
    read: readProgramFilters,
    write: (state, params) => {
        writeAdminUrlParam(params, 'q', state.q.trim());
        writeAdminUrlParam(params, 'statut', state.status, 'all');
        writeAdminUrlParam(params, 'niveau', state.level);
        writeAdminUrlParam(params, 'tag', state.tag);
        writeAdminUrlParam(params, 'tri', state.sort, 'recent');
        writeAdminUrlParam(params, 'vue', state.view, 'cards');
    },
};

export default function AdminProgramsGridClient({ rows }: { rows: AdminProgramRow[] }) {
    const [filters, setFilters] = useAdminUrlState({ codec: programUrlCodec });
    const { q, status, level, tag, sort, view } = filters;
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

    const uniqueTags = useMemo(() => getUniqueTags(rows), [rows]);

    const stats = useMemo(() => getProgramStats(rows), [rows]);
    const filtered = useMemo(() => getFilteredPrograms(rows, { q, status, level, tag, sort }), [rows, q, status, level, tag, sort]);

    const [openSlug, setOpenSlug] = useState<string | null>(null);
    const current = useMemo(() => rows.find((row) => row.programSlug === openSlug) ?? null, [openSlug, rows]);

    return (
        <>
            <CreationSuccessModal />
            <ProgramDeletionSuccessModal />

            <AdminProgramsToolbar
                searchRef={searchRef}
                qRaw={q}
                onQueryRawChange={(value) => setFilters((current) => ({ ...current, q: value }))}
                onClearSearch={() => setFilters((current) => ({ ...current, q: '' }))}
                status={status}
                onStatusChange={(value) => setFilters((current) => ({ ...current, status: value }))}
                level={level}
                onLevelChange={(value) => setFilters((current) => ({ ...current, level: value }))}
                tag={tag}
                onTagChange={(value) => setFilters((current) => ({ ...current, tag: value }))}
                sort={sort}
                onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
                view={view}
                onViewChange={(value) => setFilters((current) => ({ ...current, view: value }))}
                stats={stats}
                uniqueTags={uniqueTags}
            />

            <div className="@container/admin-collection">
                {filtered.length === 0 ? (
                    <AdminProgramsEmptyState filtered={rows.length > 0} />
                ) : view === 'table' ? (
                    <>
                        <ul className="grid grid-cols-1 gap-5 @min-[40rem]/admin-collection:grid-cols-2 @min-[72rem]/admin-collection:hidden">
                            {filtered.map((row) => <AdminProgramCard key={row.programSlug} row={row} onPreview={setOpenSlug} />)}
                        </ul>
                        <div className="hidden @min-[72rem]/admin-collection:block">
                            <AdminProgramsTableView rows={filtered} onPreview={setOpenSlug} />
                        </div>
                    </>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 @min-[40rem]/admin-collection:grid-cols-2 @min-[72rem]/admin-collection:grid-cols-3">
                        {filtered.map((row) => <AdminProgramCard key={row.programSlug} row={row} onPreview={setOpenSlug} />)}
                    </ul>
                )}
            </div>

            <AdminProgramQuickViewModal open={!!openSlug} onClose={() => setOpenSlug(null)} row={current} />
        </>
    );
}
