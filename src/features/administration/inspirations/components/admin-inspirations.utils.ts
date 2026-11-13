import type { AdminInspirationRow, AdminInspirationsStats, InspirationSortKey, InspirationStatusFilter, InspirationVideoThumb } from './admin-inspirations.types';

export const ADMIN_INSPIRATIONS_STORAGE_KEY = 'adminInspirationsToolbar:v2';

export function formatInspirationRelativeDate(iso: string | null): string {
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

export function getInspirationVideoThumb(videoUrl: string | null): InspirationVideoThumb {
    if (!videoUrl) return { src: null, alt: 'Aucun visuel' };

    try {
        const url = new URL(videoUrl);

        if (['www.youtube.com', 'youtube.com'].includes(url.hostname)) {
            const id = url.searchParams.get('v');
            if (id) return { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: 'Miniature YouTube' };
        }

        if (url.hostname === 'youtu.be') {
            const id = url.pathname.replace('/', '');
            if (id) return { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: 'Miniature YouTube' };
        }

        return { src: null, alt: 'Aucun visuel' };
    } catch {
        return { src: null, alt: 'Aucun visuel' };
    }
}

export function getInspirationTags(rows: AdminInspirationRow[]): string[] {
    const tags = new Set<string>();

    rows.forEach((row) => row.tags?.forEach((tag) => tag && tags.add(tag)));

    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

export function getInspirationStats(rows: AdminInspirationRow[]): AdminInspirationsStats {
    return rows.reduce(
        (stats, row) => {
            if (row.status === 'draft') stats.draft += 1;
            else stats.published += 1;
            return stats;
        },
        { total: rows.length, draft: 0, published: 0 },
    );
}

export function filterAndSortInspirations(
    rows: AdminInspirationRow[],
    query: string,
    status: InspirationStatusFilter,
    sort: InspirationSortKey,
    tag: string,
): AdminInspirationRow[] {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
        if (status !== 'all' && row.status !== status) return false;
        if (tag && !row.tags.includes(tag)) return false;

        if (normalizedQuery) {
            const haystack = `${row.title} ${row.slug} ${(row.tags || []).join(' ')} ${row.summary ?? ''}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        }

        return true;
    });

    filtered.sort((a, b) => {
        switch (sort) {
            case 'alphaAsc':
                return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
            case 'alphaDesc':
                return b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' });
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
