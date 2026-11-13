import type { RefObject } from 'react';
import { ChevronDown, LayoutGrid, Search, Table as TableIcon, X } from 'lucide-react';

import { AdminToolbar } from '../../shared';
import type { CategoryOption, PostCounts, SortKey, StatusFilter, ViewMode } from './admin-posts-grid.types';
import { cls } from './admin-posts-grid.utils';

type AdminPostsToolbarProps = {
    searchRef: RefObject<HTMLInputElement | null>;
    qRaw: string;
    onQueryRawChange: (value: string) => void;
    onClearSearch: () => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    sort: SortKey;
    onSortChange: (value: SortKey) => void;
    view: ViewMode;
    onViewChange: (value: ViewMode) => void;
    counts: PostCounts;
    categories: CategoryOption[];
};

export default function AdminPostsToolbar({
    searchRef,
    qRaw,
    onQueryRawChange,
    onClearSearch,
    status,
    onStatusChange,
    categoryFilter,
    onCategoryFilterChange,
    sort,
    onSortChange,
    view,
    onViewChange,
    counts,
    categories,
}: AdminPostsToolbarProps) {
    return (
        <AdminToolbar
            ariaLabel="Filtrer les articles"
            summary={`${counts.total} article${counts.total > 1 ? 's' : ''} · ${counts.published} publié${counts.published > 1 ? 's' : ''} · ${counts.draft} brouillon${counts.draft > 1 ? 's' : ''}`}
        >
            <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Rechercher par titre, slug, résumé ou catégorie…"
                    value={qRaw}
                    onChange={(event) => onQueryRawChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm outline-none motion-safe:transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                    aria-label="Rechercher un article"
                />
                {qRaw && (
                    <button
                        type="button"
                        aria-label="Effacer la recherche"
                        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground motion-safe:transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={onClearSearch}
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
                            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="all">Tous ({counts.total})</option>
                            <option value="published">Publiés ({counts.published})</option>
                            <option value="draft">Brouillons ({counts.draft})</option>
                        </select>
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Catégorie
                        <select
                            value={categoryFilter}
                            onChange={(event) => onCategoryFilterChange(event.target.value)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="__all__">Toutes les catégories</option>
                            {categories.map((category) => (
                                <option key={category.slug} value={category.slug}>{category.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                        Trier
                        <select
                            value={sort}
                            onChange={(event) => onSortChange(event.target.value as SortKey)}
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                        >
                            <option value="recent">Récents</option>
                            <option value="alpha">A → Z</option>
                        </select>
                    </label>
                </div>
            </details>

            <div className="hidden items-stretch gap-2 xl:grid xl:grid-cols-4">
                <div className="relative">
                    <label htmlFor="post-status" className="sr-only">
                        Filtrer par statut
                    </label>
                    <select
                        id="post-status"
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="all">Tous ({counts.total})</option>
                        <option value="published">Publiés ({counts.published})</option>
                        <option value="draft">Brouillons ({counts.draft})</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                    <label htmlFor="post-category" className="sr-only">
                        Filtrer par catégorie
                    </label>
                    <select
                        id="post-category"
                        value={categoryFilter}
                        onChange={(event) => onCategoryFilterChange(event.target.value)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="__all__">Toutes les catégories</option>
                        {categories.map((category) => (
                            <option key={category.slug} value={category.slug}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                    <label htmlFor="post-sort" className="sr-only">
                        Trier
                    </label>
                    <select
                        id="post-sort"
                        value={sort}
                        onChange={(event) => onSortChange(event.target.value as SortKey)}
                        className="h-11 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                        <option value="recent">Récents</option>
                        <option value="alpha">A → Z</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="hidden items-stretch md:flex">
                    <div role="tablist" aria-label="Mode d’affichage" className="inline-flex h-11 w-full items-center rounded-lg border border-border bg-background p-1">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'cards'}
                            onClick={() => onViewChange('cards')}
                            className={cls(
                                'flex h-full w-full items-center justify-center gap-1 rounded-md px-3 text-sm lg:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
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
                            className={cls(
                                'ml-1 flex h-full w-full items-center justify-center gap-1 rounded-md px-3 text-sm lg:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
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
