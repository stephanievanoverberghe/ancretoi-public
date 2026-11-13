import type { AdminPostRow, CategoryOption, PostCounts, SortKey, StatusFilter } from './admin-posts-grid.types';

export const LS_KEY = 'adminPostsToolbar:v6';

export const cls = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function formatRelative(iso: string | null) {
    if (!iso) return '—';
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min`;
    if (diff < day) return `${Math.round(diff / hour)} h`;
    return date.toLocaleDateString('fr-FR');
}

export function getCategoryNameMap(categories: CategoryOption[]) {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.slug, category.name));
    return map;
}

export function getPostCounts(rows: AdminPostRow[]): PostCounts {
    let draft = 0;
    let published = 0;
    rows.forEach((row) => (row.status === 'draft' ? draft++ : published++));
    return { total: rows.length, draft, published };
}

export function getSeoOk(row: AdminPostRow) {
    return !!(row.seo?.title?.trim() && row.seo.description?.trim() && row.coverPath && row.coverAlt?.trim());
}

export function getCategoryName(row: AdminPostRow, catNameBySlug: Map<string, string>) {
    return row.category ? catNameBySlug.get(row.category) || row.category : null;
}

export function getFilteredPosts(
    rows: AdminPostRow[],
    catNameBySlug: Map<string, string>,
    filters: {
        q: string;
        status: StatusFilter;
        categoryFilter: string;
        sort: SortKey;
    }
) {
    let out = rows.slice();
    if (filters.status !== 'all') out = out.filter((row) => row.status === filters.status);
    if (filters.categoryFilter !== '__all__') out = out.filter((row) => (row.category || '').trim() === filters.categoryFilter);
    if (filters.q) {
        out = out.filter((row) => {
            const category = getCategoryName(row, catNameBySlug) || '';
            const hay = `${row.title} ${row.slug} ${row.summary ?? ''} ${category}`.toLowerCase();
            return hay.includes(filters.q);
        });
    }
    if (filters.sort === 'alpha') {
        out.sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
    } else {
        const key = (row: AdminPostRow) => row.timestamps.updatedAt || row.timestamps.createdAt || '';
        out.sort((a, b) => key(b).localeCompare(key(a)));
    }
    return out;
}
