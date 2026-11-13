export const cls = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function slugify(input: string) {
    return (input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function ytId(url: string) {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v');
        if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    } catch {
        // L'aperçu affiche son fallback pour une URL incomplète.
    }
    return null;
}

export function vimeoId(url: string) {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes('vimeo.com')) return null;
        const parts = parsed.pathname.split('/').filter(Boolean);
        return parts.pop() ?? null;
    } catch {
        // L'aperçu affiche son fallback pour une URL incomplète.
    }
    return null;
}

export function providerFromUrl(url: string) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtube') || parsed.hostname.includes('youtu.be')) return 'YouTube';
        if (parsed.hostname.includes('vimeo')) return 'Vimeo';
        if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) return 'MP4';
    } catch {
        // Une URL en cours de saisie reste un lien générique.
    }
    return 'Lien';
}
