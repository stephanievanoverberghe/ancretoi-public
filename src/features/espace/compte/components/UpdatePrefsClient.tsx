'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

import { Alert, Button } from '@/components/ui';
import { Switch } from '@/components/ui/forms/client';
import { cn } from '@/lib/cn';

type Prefs = {
    theme: 'system' | 'light' | 'dark';
    marketing: boolean;
    productUpdates: boolean;
};

function applyTheme(theme: Prefs['theme']) {
    const root = document.documentElement;
    const resolvedTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

    window.localStorage.setItem('ancretoi-theme', theme);
    root.dataset.themePreference = theme;
    root.dataset.theme = resolvedTheme;
    root.classList.toggle('dark', resolvedTheme === 'dark');
}

const themeOptions = [
    { value: 'system', label: 'Système', description: 'Suit ton appareil' },
    { value: 'light', label: 'Clair', description: 'Interface lumineuse' },
    { value: 'dark', label: 'Sombre', description: 'Repos visuel' },
] as const;

export default function UpdatePrefsClient({ initial }: { initial: Prefs }) {
    const router = useRouter();
    const [prefs, setPrefs] = useState<Prefs>(initial);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        applyTheme(prefs.theme);
        if (prefs.theme !== 'system') return;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => applyTheme('system');
        media.addEventListener('change', handleSystemThemeChange);

        return () => media.removeEventListener('change', handleSystemThemeChange);
    }, [prefs.theme]);

    function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        setSuccess(null);
        setError(null);
        if (key === 'theme') applyTheme(value as Prefs['theme']);
    }

    async function save() {
        setSuccess(null);
        setError(null);
        applyTheme(prefs.theme);
        startTransition(async () => {
            const response = await fetch('/api/settings/prefs', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(prefs),
            });
            const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
            if (!response.ok || !data?.ok) {
                setError(data?.error || 'Préférences impossibles à enregistrer.');
                return;
            }

            setSuccess('Préférences enregistrées.');
            router.refresh();
        });
    }

    return (
        <div className="grid gap-5">
            <div className="grid gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Thème</h3>
                    <p className="text-sm text-muted-foreground">Le changement est appliqué immédiatement sur cet appareil.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => update('theme', option.value)}
                            aria-pressed={prefs.theme === option.value}
                            className={cn(
                                'min-h-20 cursor-pointer rounded-2xl border border-border bg-surface p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                prefs.theme === option.value ? 'border-primary bg-primary/10 text-foreground' : 'hover:bg-surface-muted',
                            )}
                        >
                            <span className="block font-semibold">{option.label}</span>
                            <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border bg-surface-muted p-4">
                <Switch
                    checked={prefs.marketing}
                    onCheckedChange={(checked) => update('marketing', checked)}
                    label="Conseils et offres"
                    description="Recevoir occasionnellement des contenus et offres liés aux parcours."
                />
                <Switch
                    checked={prefs.productUpdates}
                    onCheckedChange={(checked) => update('productUpdates', checked)}
                    label="Nouveautés produit"
                    description="Recevoir les informations importantes sur l’espace apprenant et les programmes."
                />
            </div>

            {success ? <Alert variant="success">{success}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="button" onClick={save} loading={pending} loadingLabel="Enregistrement" disabled={pending} leftIcon={<Save className="h-4 w-4" />}>
                Enregistrer les préférences
            </Button>
        </div>
    );
}
