'use client';

import { useEffect, useState } from 'react';

type ThemeState = {
    preference: 'system' | 'light' | 'dark';
    resolved: 'light' | 'dark';
};

const defaultState: ThemeState = { preference: 'system', resolved: 'light' };

function readThemeState(): ThemeState {
    if (typeof document === 'undefined') return defaultState;

    const root = document.documentElement;
    const stored = window.localStorage.getItem('ancretoi-theme');
    const preferenceValue = root.dataset.themePreference ?? stored;
    const preference = preferenceValue === 'light' || preferenceValue === 'dark' ? preferenceValue : 'system';
    const resolved = root.dataset.theme === 'dark' || root.classList.contains('dark') ? 'dark' : 'light';
    return { preference, resolved };
}

function formatPreference(state: ThemeState) {
    if (state.preference === 'light') return 'Clair';
    if (state.preference === 'dark') return 'Sombre';
    return `Système · interface ${state.resolved === 'dark' ? 'sombre' : 'claire'}`;
}

export default function ThemeLivePreview() {
    const [theme, setTheme] = useState<ThemeState>(defaultState);

    useEffect(() => {
        const refresh = () => setTheme(readThemeState());
        refresh();
        if (typeof MutationObserver === 'undefined') return;

        const observer = new MutationObserver(refresh);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'data-theme-preference', 'class'],
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="text-sm font-semibold text-foreground">Aperçu actif : {formatPreference(theme)}</div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
                <div className="h-12 rounded-2xl border border-border bg-background" />
                <div className="h-12 rounded-2xl border border-border bg-surface" />
                <div className="h-12 rounded-2xl border border-primary/20 bg-primary/15" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                En mode système, l’interface suit automatiquement le réglage clair ou sombre de ton appareil.
            </p>
        </div>
    );
}
