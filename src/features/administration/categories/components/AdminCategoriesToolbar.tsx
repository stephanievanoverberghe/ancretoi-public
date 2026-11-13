import type { RefObject } from 'react';
import { ChevronDown, LayoutGrid, Search, Table as TableIcon, X } from 'lucide-react';

import { AdminToolbar } from '../../shared';
import type { CategorySortKey, CategoryViewMode } from './admin-categories.types';
import { cx } from './admin-categories.utils';

type AdminCategoriesToolbarProps = {
    qRaw: string;
    onQueryChange: (value: string) => void;
    onClearQuery: () => void;
    searchRef: RefObject<HTMLInputElement | null>;
    sort: CategorySortKey;
    onSortChange: (value: CategorySortKey) => void;
    onlyUnused: boolean;
    onOnlyUnusedChange: (value: boolean) => void;
    view: CategoryViewMode;
    onViewChange: (value: CategoryViewMode) => void;
};

export function AdminCategoriesToolbar({
    qRaw,
    onQueryChange,
    onClearQuery,
    searchRef,
    sort,
    onSortChange,
    onlyUnused,
    onOnlyUnusedChange,
    view,
    onViewChange,
}: AdminCategoriesToolbarProps) {
    return (
        <AdminToolbar ariaLabel="Filtrer les catégories">
            <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Rechercher par nom, slug ou description…"
                    value={qRaw}
                    onChange={(event) => onQueryChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm outline-none motion-safe:transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                    aria-label="Rechercher une catégorie"
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
                <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2">
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Trier
                        <select
                            value={sort}
                            onChange={(event) => onSortChange(event.target.value as CategorySortKey)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="alphaAsc">A → Z</option>
                            <option value="alphaDesc">Z → A</option>
                            <option value="usageDesc">Plus utilisées</option>
                            <option value="recent">Récentes</option>
                        </select>
                    </label>
                    <label className="mt-5 flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring/20">
                        <input type="checkbox" checked={onlyUnused} onChange={(event) => onOnlyUnusedChange(event.target.checked)} />
                        <span>Masquer les utilisées</span>
                    </label>
                </div>
            </details>

            <div className="hidden items-stretch gap-2 xl:grid xl:grid-cols-3">
                <div className="relative">
                    <label htmlFor="cat-sort" className="sr-only">
                        Trier
                    </label>
                    <select
                        id="cat-sort"
                        value={sort}
                        onChange={(event) => onSortChange(event.target.value as CategorySortKey)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="alphaAsc">A → Z</option>
                        <option value="alphaDesc">Z → A</option>
                        <option value="usageDesc">Plus utilisées</option>
                        <option value="recent">Récentes</option>
                    </select>
                </div>

                <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring/20">
                    <input type="checkbox" checked={onlyUnused} onChange={(event) => onOnlyUnusedChange(event.target.checked)} />
                    <span>Masquer les utilisées</span>
                </label>

                <div className="hidden items-stretch md:flex">
                    <div role="tablist" aria-label="Mode d’affichage" className="inline-flex h-11 w-full items-center rounded-lg border border-border bg-background p-1">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'cards'}
                            onClick={() => onViewChange('cards')}
                            className={cx(
                                'flex h-full w-full items-center justify-center gap-1 rounded-md px-3 text-sm lg:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                            )}
                            title="Vue cartes (V)"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span>Cartes</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'table'}
                            onClick={() => onViewChange('table')}
                            className={cx(
                                'ml-1 flex h-full w-full items-center justify-center gap-1 rounded-md px-3 text-sm lg:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                            )}
                            title="Vue tableau (V)"
                        >
                            <TableIcon className="h-4 w-4" />
                            <span>Tableau</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminToolbar>
    );
}
