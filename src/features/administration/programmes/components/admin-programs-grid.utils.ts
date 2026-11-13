import type { AdminProgramRow, LevelFilter, ProgramStats, SortKey, StatusFilter } from './admin-programs-grid.types';

export const LS_KEY = 'adminProgramsToolbar:v9';

export function formatPrice(p: AdminProgramRow['price']) {
    if (p.amountCents == null) return 'Bientôt';
    try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: (p.currency ?? 'EUR').toUpperCase(),
        }).format(p.amountCents / 100);
    } catch {
        const amount = (p.amountCents / 100).toFixed(2);
        return `${amount} ${(p.currency ?? 'EUR').toUpperCase()}`;
    }
}

export function getUniqueTags(rows: AdminProgramRow[]) {
    const set = new Set<string>();
    rows.forEach((row) => row.meta.tags?.forEach((tag) => tag && set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

export function getProgramStats(rows: AdminProgramRow[]): ProgramStats {
    const byStatus = rows.reduce(
        (acc, row) => {
            if (row.status === 'draft') acc.draft += 1;
            else if (row.status === 'preflight') acc.preflight += 1;
            else acc.published += 1;
            return acc;
        },
        { draft: 0, preflight: 0, published: 0 }
    );

    return { total: rows.length, ...byStatus };
}

export function getFilteredPrograms(
    rows: AdminProgramRow[],
    filters: {
        q: string;
        status: StatusFilter;
        level: LevelFilter;
        tag: string;
        sort: SortKey;
    }
) {
    const ql = filters.q.trim().toLowerCase();

    const out = rows.filter((row) => {
        if (filters.status !== 'all' && row.status !== filters.status) return false;
        if (filters.level && row.meta.level !== filters.level) return false;
        if (filters.tag && !row.meta.tags.includes(filters.tag)) return false;
        if (ql) {
            const hay = `${row.title} ${row.programSlug} ${row.meta.tags.join(' ')}`.toLowerCase();
            if (!hay.includes(ql)) return false;
        }
        return true;
    });

    out.sort((a, b) => {
        switch (filters.sort) {
            case 'alphaAsc':
                return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
            case 'alphaDesc':
                return b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' });
            case 'recent':
            default: {
                const aa = a.timestamps.updatedAt || a.timestamps.createdAt || '';
                const bb = b.timestamps.updatedAt || b.timestamps.createdAt || '';
                return bb.localeCompare(aa);
            }
        }
    });

    return out;
}
