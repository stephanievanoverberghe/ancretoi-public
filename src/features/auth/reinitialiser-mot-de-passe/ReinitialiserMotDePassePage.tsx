'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, LoaderCircle, Lock, RotateCcw } from 'lucide-react';

import { Alert, Button, LinkButton, Skeleton } from '@/components/ui';
import { authContent } from '@/content/auth';
import { authRoutes } from '@/config/routes';
import { assessPassword } from '@/lib/password';

import { AuthFrame } from '../components/AuthFrame';
import { AuthPasswordField, AuthSubmitButton, PasswordChecklist, PasswordStrength } from '../components/AuthFormControls';

export function ReinitialiserMotDePassePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [csrf, setCsrf] = useState('');
    const [csrfStatus, setCsrfStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [okToken, setOkToken] = useState<boolean | null>(null);
    const [done, setDone] = useState(false);

    const assessment = useMemo(() => assessPassword(password), [password]);
    const match = confirm.length > 0 && confirm === password;

    const strengthLabel = ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Excellente'][assessment.score]!;
    const strengthPct = [8, 25, 50, 75, 100][assessment.score]!;
    const strengthBarClass =
        assessment.score >= 4
            ? 'bg-success'
            : assessment.score === 3
              ? 'bg-secondary'
              : assessment.score === 2
                ? 'bg-warning'
                : assessment.score === 1
                  ? 'bg-accent'
                  : 'bg-danger';

    const checklistItems = [
        { ok: password.length >= 12, label: '12 caractères minimum' },
        { ok: /[a-z]/.test(password), label: '1 minuscule' },
        { ok: /[A-Z]/.test(password), label: '1 majuscule' },
        { ok: /[0-9]/.test(password), label: '1 chiffre' },
        { ok: /[^\w\s]/.test(password), label: '1 symbole' },
        { ok: !/(.)\1{2,}/.test(password), label: 'pas de répétitions' },
    ] as const;

    useEffect(() => {
        if (!token) {
            setOkToken(false);
            return;
        }
        fetch(`/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`, { credentials: 'same-origin' })
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => setOkToken(!!data?.ok))
            .catch(() => setOkToken(false));
    }, [token]);

    const loadCsrf = useCallback(async () => {
        setCsrfStatus('loading');
        try {
            const response = await fetch('/api/auth/csrf', { method: 'GET', credentials: 'same-origin' });
            if (!response.ok) throw new Error('csrf-unavailable');
            const data = await response.json();
            const nextCsrf = String(data?.token || '');
            if (!nextCsrf) throw new Error('csrf-empty');
            setCsrf(nextCsrf);
            setCsrfStatus('ready');
        } catch {
            setCsrf('');
            setCsrfStatus('error');
        }
    }, []);

    useEffect(() => {
        void loadCsrf();
    }, [loadCsrf]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError('');
        if (!csrf) {
            setError('La connexion sécurisée n’est pas encore disponible. Réessaie dans un instant.');
            return;
        }
        if (!match) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setPending(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
                body: JSON.stringify({ token, password }),
                credentials: 'same-origin',
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) setDone(true);
            else setError(data?.error || 'Impossible de réinitialiser.');
        } catch {
            setError('Erreur réseau. Réessaie.');
        } finally {
            setPending(false);
        }
    }

    if (okToken === null) {
        return (
            <AuthFrame
                eyebrow={authContent.resetPassword.eyebrow}
                title="Vérification du lien…"
                description="Nous vérifions que ce lien peut encore être utilisé avant d’afficher le formulaire."
            >
                <div className="grid gap-4" role="status" aria-label="Vérification du lien de réinitialisation">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                        Vérification en cours
                    </div>
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                </div>
            </AuthFrame>
        );
    }

    if (okToken === false) {
        return (
            <AuthFrame
                eyebrow={authContent.resetPassword.eyebrow}
                title={authContent.resetPassword.invalidTitle}
                description={authContent.resetPassword.invalidDescription}
            >
                <div className="grid gap-5">
                    <Alert variant="danger" icon={<AlertTriangle className="h-4 w-4" />} title="Lien inutilisable">
                        Le lien a expiré ou a déjà été consommé.
                    </Alert>
                    <LinkButton href={authRoutes.motDePasseOublie} size="lg" className="w-full">
                        Demander un nouveau lien
                    </LinkButton>
                </div>
            </AuthFrame>
        );
    }

    if (done) {
        return (
            <AuthFrame
                eyebrow={authContent.resetPassword.eyebrow}
                title={authContent.resetPassword.doneTitle}
                description={authContent.resetPassword.doneDescription}
            >
                <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />} title="C’est prêt">
                    Tu peux maintenant retourner à la connexion.
                </Alert>
                <LinkButton href={authRoutes.connexion} size="lg" className="mt-5 w-full">
                    Se connecter
                </LinkButton>
            </AuthFrame>
        );
    }

    return (
        <AuthFrame
            eyebrow={authContent.resetPassword.eyebrow}
            title={authContent.resetPassword.title}
            description={authContent.resetPassword.description}
            footer={
                <Link className="font-medium text-primary underline-offset-4 hover:underline" href={authRoutes.connexion}>
                    Retour à la connexion
                </Link>
            }
        >
            <form onSubmit={submit} className="grid gap-5">
                <AuthPasswordField
                    id="password"
                    label="Nouveau mot de passe"
                    icon={Lock}
                    required
                    placeholder="Au moins 12 caractères"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    visible={showPwd}
                    onToggleVisible={() => setShowPwd((value) => !value)}
                />

                <PasswordStrength score={assessment.score} label={strengthLabel} percent={strengthPct} barClass={strengthBarClass} />
                <PasswordChecklist items={checklistItems} />

                <AuthPasswordField
                    id="confirm"
                    label="Confirmer le mot de passe"
                    required
                    placeholder="Retape le mot de passe"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    visible={showPwd}
                    onToggleVisible={() => setShowPwd((value) => !value)}
                    error={confirm.length > 0 && !match ? 'Les mots de passe ne correspondent pas.' : undefined}
                />

                {error ? (
                    <Alert variant="danger" title="Mise à jour impossible">
                        {error}
                    </Alert>
                ) : null}

                {csrfStatus === 'loading' ? (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
                        <LoaderCircle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
                        Préparation de la connexion sécurisée…
                    </p>
                ) : null}

                {csrfStatus === 'error' ? (
                    <Alert variant="danger" title="Connexion sécurisée indisponible">
                        <Button type="button" variant="tertiary" size="sm" className="mt-2" onClick={() => void loadCsrf()} leftIcon={<RotateCcw className="h-4 w-4" />}>
                            Réessayer
                        </Button>
                    </Alert>
                ) : null}

                <AuthSubmitButton
                    pending={pending}
                    pendingLabel={authContent.resetPassword.pending}
                    disabled={pending || csrfStatus !== 'ready' || !match || password.length < 12 || assessment.score < 3}
                >
                    {authContent.resetPassword.submit}
                </AuthSubmitButton>
            </form>
        </AuthFrame>
    );
}
