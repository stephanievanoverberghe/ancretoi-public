import type { RefObject } from 'react';
import { ChevronDown, LayoutGrid, ListFilter, Search, TableProperties, X } from 'lucide-react';

import { AdminToolbar } from '../../shared';
import type { LevelFilter, ProgramStats, SortKey, StatusFilter, ViewMode } from './admin-programs-grid.types';

type AdminProgramsToolbarProps = {
    searchRef: RefObject<HTMLInputElement | null>;
    qRaw: string;
    onQueryRawChange: (value: string) => void;
    onClearSearch: () => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    level: LevelFilter;
    onLevelChange: (value: LevelFilter) => void;
    tag: string;
    onTagChange: (value: string) => void;
    sort: SortKey;
    onSortChange: (value: SortKey) => void;
    view: ViewMode;
    onViewChange: (value: ViewMode) => void;
    stats: ProgramStats;
    uniqueTags: string[];
};

type ProgramFiltersProps = Omit<AdminProgramsToolbarProps, 'view' | 'onViewChange'>;

function ProgramFilters({ searchRef, qRaw, onQueryRawChange, onClearSearch, status, onStatusChange, level, onLevelChange, tag, onTagChange, sort, onSortChange, stats, uniqueTags }: ProgramFiltersProps) {
    const selectClassName = 'h-11 w-full appearance-none rounded-xl border border-border bg-surface py-2 pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25';

    return (
        <div className="space-y-3">
            <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input ref={searchRef} type="search" placeholder="Rechercher par titre, slug ou tag…" value={qRaw} onChange={(event) => onQueryRawChange(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-10 text-sm outline-none motion-safe:transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25" aria-label="Rechercher un programme" />
                {qRaw ? <button type="button" aria-label="Effacer la recherche" className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" onClick={onClearSearch}><X className="h-4 w-4" aria-hidden="true" /></button> : null}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <label className="relative"><span className="sr-only">Filtrer par statut</span><select value={status} onChange={(event) => onStatusChange(event.target.value as StatusFilter)} className={selectClassName}><option value="all">Tous les statuts ({stats.total})</option><option value="published">Publiés ({stats.published})</option><option value="preflight">Préparation ({stats.preflight})</option><option value="draft">Brouillons ({stats.draft})</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /></label>
                <label className="relative"><span className="sr-only">Filtrer par niveau</span><select value={level} onChange={(event) => onLevelChange(event.target.value as LevelFilter)} className={selectClassName}><option value="">Tous les niveaux</option><option value="Basique">Basique</option><option value="Cible">Cible</option><option value="Premium">Premium</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /></label>
                <label className="relative"><span className="sr-only">Filtrer par tag</span><select value={tag} onChange={(event) => onTagChange(event.target.value)} className={selectClassName}><option value="">Tous les tags</option>{uniqueTags.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /></label>
                <label className="relative"><span className="sr-only">Trier les programmes</span><select value={sort} onChange={(event) => onSortChange(event.target.value as SortKey)} className={selectClassName}><option value="recent">Récents</option><option value="alphaAsc">A → Z</option><option value="alphaDesc">Z → A</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /></label>
            </div>
        </div>
    );
}

export default function AdminProgramsToolbar(props: AdminProgramsToolbarProps) {
    return (
        <AdminToolbar ariaLabel="Filtrer les programmes" summary={`${props.stats.total} programme${props.stats.total > 1 ? 's' : ''} · ${props.stats.published} publié${props.stats.published > 1 ? 's' : ''}`}>
            <details className="group xl:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground"><span className="inline-flex items-center gap-2"><ListFilter className="h-4 w-4" aria-hidden="true" /> Recherche et filtres</span><ChevronDown className="h-4 w-4 motion-safe:transition-transform motion-safe:group-open:rotate-180" aria-hidden="true" /></summary>
                <div className="mt-3"><ProgramFilters {...props} /></div>
            </details>
            <div className="hidden xl:block"><ProgramFilters {...props} /></div>
            <div className="hidden justify-end gap-1 xl:flex" role="group" aria-label="Mode d’affichage">
                <button type="button" aria-pressed={props.view === 'cards'} onClick={() => props.onViewChange('cards')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${props.view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}><LayoutGrid className="h-4 w-4" aria-hidden="true" /> Cartes</button>
                <button type="button" aria-pressed={props.view === 'table'} onClick={() => props.onViewChange('table')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${props.view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}><TableProperties className="h-4 w-4" aria-hidden="true" /> Tableau</button>
            </div>
        </AdminToolbar>
    );
}
