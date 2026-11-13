import type { RefObject } from 'react';
import { ChevronDown, LayoutGrid, Search, TableProperties, X } from 'lucide-react';

import { AdminToolbar } from '../../shared';
import type { AdminInspirationsStats, InspirationSortKey, InspirationStatusFilter, InspirationViewMode } from './admin-inspirations.types';

type AdminInspirationsToolbarProps = {
    qRaw: string;
    onQueryChange: (value: string) => void;
    onClearQuery: () => void;
    searchRef: RefObject<HTMLInputElement | null>;
    status: InspirationStatusFilter;
    onStatusChange: (value: InspirationStatusFilter) => void;
    tag: string;
    onTagChange: (value: string) => void;
    uniqueTags: string[];
    sort: InspirationSortKey;
    onSortChange: (value: InspirationSortKey) => void;
    stats: AdminInspirationsStats;
    view: InspirationViewMode;
    onViewChange: (value: InspirationViewMode) => void;
};

export function AdminInspirationsToolbar({
    qRaw,
    onQueryChange,
    onClearQuery,
    searchRef,
    status,
    onStatusChange,
    tag,
    onTagChange,
    uniqueTags,
    sort,
    onSortChange,
    stats,
    view,
    onViewChange,
}: AdminInspirationsToolbarProps) {
    return (
        <AdminToolbar
            ariaLabel="Filtrer les inspirations"
            summary={`${stats.total} inspiration${stats.total > 1 ? 's' : ''} · ${stats.published} publiée${stats.published > 1 ? 's' : ''}`}
        >
            <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Rechercher par titre, slug, tag ou résumé…"
                    value={qRaw}
                    onChange={(event) => onQueryChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm outline-none motion-safe:transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                    aria-label="Rechercher une inspiration"
                />
                {qRaw && (
                    <button
                        type="button"
                        aria-label="Effacer la recherche"
                        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground motion-safe:transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={onClearQuery}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <details className="group rounded-xl border border-border bg-background xl:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                    Filtres et tri
                    <ChevronDown className="h-4 w-4 text-muted-foreground motion-safe:transition motion-safe:group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-3">
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Statut
                        <select
                            value={status}
                            onChange={(event) => onStatusChange(event.target.value as InspirationStatusFilter)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="all">Tous ({stats.total})</option>
                            <option value="published">Publiés ({stats.published})</option>
                            <option value="draft">Brouillons ({stats.draft})</option>
                        </select>
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Tag
                        <select
                            value={tag}
                            onChange={(event) => onTagChange(event.target.value)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="">Tous les tags</option>
                            {uniqueTags.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Trier
                        <select
                            value={sort}
                            onChange={(event) => onSortChange(event.target.value as InspirationSortKey)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="recent">Récents</option>
                            <option value="alphaAsc">A → Z</option>
                            <option value="alphaDesc">Z → A</option>
                        </select>
                    </label>
                </div>
            </details>

            <div className="hidden grid-cols-3 gap-2 xl:grid">
                <div className="relative">
                    <label htmlFor="insp-status" className="sr-only">
                        Filtrer par statut
                    </label>
                    <select
                        id="insp-status"
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as InspirationStatusFilter)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="all">Tous les statuts ({stats.total})</option>
                        <option value="published">Publiés ({stats.published})</option>
                        <option value="draft">Brouillons ({stats.draft})</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                    <label htmlFor="insp-tag" className="sr-only">
                        Filtrer par tag
                    </label>
                    <select
                        id="insp-tag"
                        value={tag}
                        onChange={(event) => onTagChange(event.target.value)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="">Tous les tags</option>
                        {uniqueTags.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                    <label htmlFor="insp-sort" className="sr-only">
                        Trier les inspirations
                    </label>
                    <select
                        id="insp-sort"
                        value={sort}
                        onChange={(event) => onSortChange(event.target.value as InspirationSortKey)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="recent">Récents</option>
                        <option value="alphaAsc">A → Z</option>
                        <option value="alphaDesc">Z → A</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            <div className="hidden justify-end gap-1 xl:flex" role="group" aria-label="Mode d’affichage">
                <button type="button" aria-pressed={view === 'cards'} onClick={() => onViewChange('cards')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}><LayoutGrid className="h-4 w-4" aria-hidden="true" /> Cartes</button>
                <button type="button" aria-pressed={view === 'table'} onClick={() => onViewChange('table')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}><TableProperties className="h-4 w-4" aria-hidden="true" /> Tableau</button>
            </div>
        </AdminToolbar>
    );
}
