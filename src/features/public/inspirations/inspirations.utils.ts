export function getYoutubeId(url?: string | null) {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtube.com')) {
            const queryId = parsed.searchParams.get('v');
            if (queryId) return queryId;
            const [kind, pathId] = parsed.pathname.replace(/^\//, '').split('/');
            return ['embed', 'shorts', 'live'].includes(kind) ? pathId || null : null;
        }
        if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace(/^\//, '').split('/')[0] || null;
        return null;
    } catch {
        return null;
    }
}
