import type { AdminCategoryRow, CategorySortKey } from './admin-categories.types';

export const ADMIN_CATEGORIES_STORAGE_KEY = 'adminCategoriesToolbar:v2';

export function formatCategoryRelativeDate(iso: string | null): string {
    if (!iso) return '—';

    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min`;
    if (diff < day) return `${Math.round(diff / hour)} h`;

    return date.toLocaleDateString('fr-FR');
}

export function cx(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}

export function filterAndSortCategories(rows: AdminCategoryRow[], query: string, sort: CategorySortKey, onlyUnused: boolean): AdminCategoryRow[] {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
        if (onlyUnused && row.usage.posts > 0) return false;

        if (normalizedQuery) {
            const haystack = `${row.name} ${row.slug} ${row.description ?? ''}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        }

        return true;
    });

    filtered.sort((a, b) => {
        switch (sort) {
            case 'alphaAsc':
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            case 'alphaDesc':
                return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' });
            case 'usageDesc':
                return b.usage.posts - a.usage.posts || a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            case 'recent':
            default: {
                const aDate = a.timestamps.updatedAt || a.timestamps.createdAt || '';
                const bDate = b.timestamps.updatedAt || b.timestamps.createdAt || '';
                return bDate.localeCompare(aDate);
            }
        }
    });

    return filtered;
}
