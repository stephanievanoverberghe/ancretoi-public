'use client';

import { useEffect, useState } from 'react';

import { Switch } from '@/components/ui/forms/client';
import { cn } from '@/lib/cn';

type Prefs = { textScale: 1 | 1.1 | 1.25; reduceMotion: boolean };

const textScaleOptions = [
    { value: 1, label: 'Standard' },
    { value: 1.1, label: 'Confort' },
    { value: 1.25, label: 'Grand' },
] as const;

export default function AccessibilityPrefsClient() {
    const [prefs, setPrefs] = useState<Prefs>({ textScale: 1, reduceMotion: false });

    useEffect(() => {
        try {
            const raw = localStorage.getItem('a11y-prefs');
            if (raw) setPrefs(JSON.parse(raw) as Prefs);
        } catch {
            setPrefs({ textScale: 1, reduceMotion: false });
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--text-scale', String(prefs.textScale));
        document.documentElement.classList.toggle('reduce-motion', prefs.reduceMotion);
        try {
            localStorage.setItem('a11y-prefs', JSON.stringify(prefs));
        } catch {
            // Le réglage reste actif pendant la session si le stockage local est bloqué.
        }
    }, [prefs]);

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <p className="text-sm font-semibold text-foreground">Taille du texte</p>
                <div className="grid gap-2 sm:grid-cols-3">
                    {textScaleOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setPrefs((current) => ({ ...current, textScale: option.value }))}
                            aria-pressed={prefs.textScale === option.value}
                            className={cn(
                                'min-h-11 cursor-pointer rounded-xl border border-border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                prefs.textScale === option.value ? 'border-primary bg-primary/10 text-foreground' : 'bg-surface hover:bg-surface-muted',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                <Switch
                    checked={prefs.reduceMotion}
                    onCheckedChange={(checked) => setPrefs((current) => ({ ...current, reduceMotion: checked }))}
                    label="Réduire les animations"
                    description="Mémorisé sur cet appareil, utile si tu préfères limiter les transitions."
                />
            </div>
        </div>
    );
}
