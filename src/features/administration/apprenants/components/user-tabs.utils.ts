export const cls = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export function toFr(d?: string | Date | null) {
    if (!d) return '—';
    const dt = new Date(d);
    return Number.isNaN(+dt) ? '—' : dt.toLocaleString('fr-FR');
}

export function toDate(d?: string | Date | null) {
    if (!d) return '—';
    const dt = new Date(d);
    return Number.isNaN(+dt) ? '—' : dt.toLocaleDateString('fr-FR');
}

export function round1(n: number) {
    return Math.round(n * 10) / 10;
}
