'use client';

import { useEffect, useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';

import { Alert, Button, Input } from '@/components/ui';

type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string };

function estimateStrength(password: string): Strength {
    let score = 0;
    const classes = [/[a-z]/.test(password), /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (classes >= 3) score++;
    if (classes === 4) score++;
    if (/([a-z])\1{2,}|([A-Z])\2{2,}|([0-9])\3{2,}/.test(password)) score = Math.max(0, score - 1);
    if (/0123|1234|abcd|qwerty|azerty|password|motdepasse/i.test(password)) score = Math.max(0, score - 2);

    const label = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][Math.min(score, 4)]!;
    return { score: Math.min(score, 4) as Strength['score'], label };
}

export default function PasswordChangeClient() {
    const [csrf, setCsrf] = useState('');
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/auth/csrf', { credentials: 'same-origin' })
            .then((response) => response.json())
            .then((data) => setCsrf(String(data?.token || '')))
            .catch(() => setCsrf(''));
    }, []);

    const strength = useMemo(() => estimateStrength(next), [next]);
    const canSubmit = Boolean(csrf && current && next.length >= 12 && next === confirm && strength.score >= 3 && !busy);

    async function save(event: React.FormEvent) {
        event.preventDefault();
        setMessage(null);
        setError(null);

        if (!canSubmit) {
            setError('Vérifie le mot de passe actuel, la force du nouveau mot de passe et la confirmation.');
            return;
        }

        setBusy(true);
        try {
            const response = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
                body: JSON.stringify({ current, password: next }),
                credentials: 'same-origin',
            });
            const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
            if (!response.ok || !data?.ok) throw new Error(data?.error || 'Impossible de changer le mot de passe.');

            setMessage('Mot de passe mis à jour.');
            setCurrent('');
            setNext('');
            setConfirm('');
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Erreur inconnue.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={save} className="grid gap-4">
            <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Mot de passe actuel</span>
                <Input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" />
            </label>
            <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Nouveau mot de passe</span>
                <Input type="password" value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" placeholder="12 caractères, Aa0!" />
            </label>

            {next ? (
                <div className="grid gap-2">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(strength.score + 1) * 20}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">Force : {strength.label}</p>
                </div>
            ) : null}

            <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Confirmer le nouveau mot de passe</span>
                <Input
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    invalid={confirm.length > 0 && confirm !== next}
                />
            </label>

            {message ? <Alert variant="success">{message}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="submit" loading={busy} loadingLabel="Mise à jour" disabled={!canSubmit} leftIcon={<KeyRound className="h-4 w-4" />}>
                Mettre à jour le mot de passe
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">Utilise au moins 12 caractères avec minuscules, majuscules, chiffres et symbole.</p>
        </form>
    );
}
