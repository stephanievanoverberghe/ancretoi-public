'use client';

import { useEffect } from 'react';

export const THEME_STORAGE_KEY = 'ancretoi-theme';
export const ACCESSIBILITY_STORAGE_KEY = 'a11y-prefs';

type ThemePreference = 'system' | 'light' | 'dark';

function readThemePreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    } catch {
        // Le thème clair reste le repli si le stockage est indisponible.
    }
    return 'light';
}

function applyThemePreference(theme: ThemePreference, prefersDark: boolean) {
    const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = theme;
    root.classList.toggle('dark', resolvedTheme === 'dark');
}

function applyAccessibilityPreferences() {
    const root = document.documentElement;

    try {
        const rawPreferences = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
        if (!rawPreferences) return;

        const preferences = JSON.parse(rawPreferences) as {
            textScale?: unknown;
            reduceMotion?: unknown;
        };
        const textScale = Number(preferences.textScale);
        if (textScale === 1 || textScale === 1.1 || textScale === 1.25) {
            root.style.setProperty('--text-scale', String(textScale));
        }
        root.classList.toggle('reduce-motion', Boolean(preferences.reduceMotion));
    } catch {
        root.style.setProperty('--text-scale', '1');
        root.classList.remove('reduce-motion');
    }
}

export function ClientPreferencesSync() {
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const syncTheme = () => {
            applyThemePreference(readThemePreference(), media.matches);
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY) {
                syncTheme();
            }
            if (event.key === ACCESSIBILITY_STORAGE_KEY) applyAccessibilityPreferences();
        };

        syncTheme();
        applyAccessibilityPreferences();
        media.addEventListener('change', syncTheme);
        window.addEventListener('storage', handleStorage);

        return () => {
            media.removeEventListener('change', syncTheme);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    return null;
}
