'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link as LinkIcon, LoaderCircle, Lock, Mail, RotateCcw, ShieldCheck, User, Wand2 } from 'lucide-react';

import { Alert, Button } from '@/components/ui';
import { authRoutes, legalRoutes } from '@/config/routes';
import { authContent } from '@/content/auth';
import { assessPassword, generateStrongPassword } from '@/lib/password';

import { AuthPasswordField, AuthSubmitButton, AuthTextField, PasswordChecklist, PasswordStrength } from './AuthFormControls';
import { GoogleAuthButton } from './GoogleAuthButton';

function normalizeNextPath(value: string | null | undefined) {
    const raw = value || '/espace';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return '/espace';
    return raw;
}

function buildAuthNoticeRoute(
    pathname: string,
    email: string,
    reason: 'missing-account' | 'email-in-use',
) {
    const params = new URLSearchParams({ email, reason });
    return `${pathname}?${params.toString()}`;
}

/**
 * Charge un jeton CSRF côté client pour les formulaires auth modaux.
 * Le formulaire reste bloqué si le jeton n'est pas disponible.
 */
function useCsrfToken() {
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const response = await fetch('/api/auth/csrf', { method: 'GET', credentials: 'same-origin' });
            if (!response.ok) throw new Error('csrf-unavailable');
            const data = await response.json();
            const nextToken = String(data?.token || '');
            if (!nextToken) throw new Error('csrf-empty');
            setToken(nextToken);
            setStatus('ready');
        } catch {
            setToken('');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return { token, status, retry: load } as const;
}

function CsrfAvailability({ status, onRetry }: { status: 'loading' | 'ready' | 'error'; onRetry: () => void }) {
    if (status === 'ready') return null;

    if (status === 'loading') {
        return (
            <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
                <LoaderCircle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
                Préparation de la connexion sécurisée…
            </p>
        );
    }

    return (
        <Alert variant="danger" title="Connexion sécurisée indisponible">
            <p>La protection du formulaire n’a pas pu être préparée.</p>
            <Button type="button" variant="tertiary" size="sm" className="mt-3" onClick={onRetry} leftIcon={<RotateCcw className="h-4 w-4" />}>
                Réessayer
            </Button>
        </Alert>
    );
}

type AuthPanelProps = {
    compact?: boolean;
};

type LoginPanelProps = AuthPanelProps & {
    initialEmail?: string;
    notice?: string;
    nextPath?: string;
    onForgotPassword?: () => void;
    onMissingAccount?: (email: string) => void;
};

type RegisterPanelProps = AuthPanelProps & {
    initialEmail?: string;
    notice?: string;
    onExistingAccount?: (email: string) => void;
};

function getGoogleAuthNotice(reason: string | null, view: 'login' | 'register') {
    if (reason === 'account-not-found') {
        return view === 'register'
            ? 'Aucun compte n’est encore associé à cet e-mail Google. Inscris-toi d’abord pour créer ton espace.'
            : 'Aucun compte n’est associé à cet e-mail Google. Inscris-toi d’abord pour créer ton espace.';
    }

    if (reason === 'account-already-exists') {
        return view === 'login'
            ? 'Un compte existe déjà avec cet e-mail Google. Connecte-toi depuis cet écran.'
            : 'Un compte existe déjà avec cet e-mail Google. Utilise la connexion pour accéder à ton espace.';
    }

    if (reason === 'email-not-verified') {
        return 'Google n’a pas confirmé cet e-mail. Utilise un compte Google avec une adresse vérifiée.';
    }

    if (reason === 'account-unavailable') {
        return 'Ce compte n’est pas disponible. Contacte le support si tu penses qu’il s’agit d’une erreur.';
    }

    if (reason === 'unavailable') {
        return 'La connexion Google n’est pas configurée pour le moment. Utilise ton e-mail et ton mot de passe.';
    }

    if (reason) {
        return 'Connexion Google interrompue. Réessaie ou utilise ton e-mail.';
    }

    return '';
}

/** Panneau de connexion e-mail/mot de passe utilisé dans la modale auth unique. */
export function AuthLoginPanel({ initialEmail, notice, nextPath, onForgotPassword, onMissingAccount, compact = false }: LoginPanelProps) {
    const searchParams = useSearchParams();
    const queryEmail = searchParams.get('email') || '';
    const queryReason = searchParams.get('reason');

    const [email, setEmail] = useState(initialEmail || queryEmail);
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const csrf = useCsrfToken();

    const next = useMemo(() => normalizeNextPath(nextPath ?? searchParams.get('next')), [nextPath, searchParams]);
    const googleError = searchParams.get('google');
    const queryNotice =
        queryReason === 'email-in-use' ? 'Un compte existe déjà avec cette adresse. Connecte-toi pour continuer.' : undefined;
    const googleNotice = getGoogleAuthNotice(googleError, 'login');
    const displayedNotice = notice || googleNotice || queryNotice;

    useEffect(() => {
        if (initialEmail) setEmail(initialEmail);
    }, [initialEmail]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError('');
        if (!csrf.token) {
            setError('La connexion sécurisée n’est pas encore disponible. Réessaie dans un instant.');
            return;
        }
        setPending(true);
        try {
            const response = await fetch('/api/auth/login-password', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-csrf-token': csrf.token,
                },
                body: JSON.stringify({ email, password, next }),
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json().catch(() => ({ redirectTo: '/espace' }));
                location.href = data.redirectTo || '/espace';
                return;
            }

            const data = await response.json().catch(() => ({}));
            if (data?.code === 'USER_NOT_FOUND') {
                if (onMissingAccount) {
                    onMissingAccount(email);
                } else {
                    location.href = buildAuthNoticeRoute(
                        authRoutes.inscription,
                        email,
                        'missing-account',
                    );
                }
                return;
            }

            if (response.status === 429 && data?.retryAfter) {
                setError(`Trop de tentatives. Réessaie dans ${data.retryAfter}s.`);
            } else {
                setError(data?.error || 'Connexion impossible.');
            }
        } catch {
            setError('Erreur réseau. Réessaie.');
        } finally {
            setPending(false);
        }
    }

    return (
        <div className={compact ? 'grid gap-4' : 'grid gap-5'}>
            <GoogleAuthButton nextPath={next} />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                ou avec ton e-mail
                <span className="h-px flex-1 bg-border" />
            </div>

            {displayedNotice ? (
                <Alert variant="warning" icon={<ShieldCheck className="h-4 w-4" />} title="Connexion requise">
                    {displayedNotice}
                </Alert>
            ) : null}

            <form onSubmit={submit} className="grid gap-3 sm:gap-4">
                <AuthTextField
                    id="email"
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    placeholder="email@domaine.fr"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <AuthPasswordField
                    id="password"
                    label="Mot de passe"
                    icon={Lock}
                    placeholder="Ton mot de passe"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    visible={showPwd}
                    onToggleVisible={() => setShowPwd((value) => !value)}
                />

                <div className="flex justify-end">
                    {onForgotPassword ? (
                        <button
                            type="button"
                            className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                            onClick={onForgotPassword}
                        >
                            {authContent.connexion.forgotPassword}
                        </button>
                    ) : (
                        <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={authContent.connexion.forgotPasswordHref}>
                            {authContent.connexion.forgotPassword}
                        </Link>
                    )}
                </div>

                {error ? (
                    <Alert variant="danger" title="Connexion impossible">
                        {error}
                    </Alert>
                ) : null}

                <CsrfAvailability status={csrf.status} onRetry={() => void csrf.retry()} />

                <AuthSubmitButton pending={pending} pendingLabel={authContent.connexion.pending} disabled={pending || csrf.status !== 'ready' || !email || !password}>
                    {authContent.connexion.submit}
                </AuthSubmitButton>
            </form>
        </div>
    );
}

/**
 * Panneau d'inscription compact. Il peut reprendre l'e-mail saisi lors d'une
 * tentative de connexion sans compte pour éviter une redirection vers une page dédiée.
 */
export function AuthRegisterPanel({ compact = false, initialEmail, notice, onExistingAccount }: RegisterPanelProps = {}) {
    const searchParams = useSearchParams();
    const queryEmail = searchParams.get('email') || '';
    const queryReason = searchParams.get('reason');
    const googleError = searchParams.get('google');
    const googleNotice = getGoogleAuthNotice(googleError, 'register');
    const defaultNotice =
        googleNotice ||
        (queryReason === 'missing-account'
            ? 'Aucun compte n’est associé à cette adresse. Tu peux créer ton accès ici en gardant le même e-mail.'
            : undefined);

    const [email, setEmail] = useState(initialEmail || queryEmail);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [capsOn, setCapsOn] = useState(false);
    const csrf = useCsrfToken();

    useEffect(() => {
        if (initialEmail) setEmail(initialEmail);
    }, [initialEmail]);

    const assessment = useMemo(() => assessPassword(password, email, name), [password, email, name]);
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

    function onPwdKey(event: React.KeyboardEvent<HTMLInputElement>) {
        setCapsOn(event.getModifierState && event.getModifierState('CapsLock'));
    }

    function fillStrong() {
        const nextPassword = generateStrongPassword(16);
        setPassword(nextPassword);
        setConfirm(nextPassword);
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError('');
        if (!csrf.token) {
            setError('La connexion sécurisée n’est pas encore disponible. Réessaie dans un instant.');
            return;
        }
        if (!match) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setPending(true);
        try {
            const response = await fetch('/api/auth/register-password', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-csrf-token': csrf.token },
                body: JSON.stringify({ email, name, password }),
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json().catch(() => ({ redirectTo: '/espace' }));
                location.href = data.redirectTo || '/espace';
                return;
            }
            const data = await response.json().catch(() => ({}));
            if (data?.code === 'EMAIL_IN_USE') {
                if (onExistingAccount) {
                    onExistingAccount(email);
                } else {
                    location.href = buildAuthNoticeRoute(
                        authRoutes.connexion,
                        email,
                        'email-in-use',
                    );
                }
                return;
            }
            setError(data?.error || 'Impossible de créer le compte.');
        } catch {
            setError('Erreur réseau. Réessaie.');
        } finally {
            setPending(false);
        }
    }

    const canSubmit = csrf.status === 'ready' && !!email && password.length >= 12 && assessment.score >= 3 && match && !pending;

    return (
        <div className={compact ? 'grid gap-4' : 'grid gap-5'}>
            <GoogleAuthButton label="S’inscrire avec Google" mode="register" />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                ou créer un accès e-mail
                <span className="h-px flex-1 bg-border" />
            </div>

            {notice || defaultNotice ? (
                <Alert variant="info" title="Créer ton compte">
                    {notice || defaultNotice}
                </Alert>
            ) : null}

            <form onSubmit={submit} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <AuthTextField
                        id="name"
                        label="Prénom"
                        icon={User}
                        type="text"
                        placeholder="Stéphanie"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                    />

                    <AuthTextField
                        id="email"
                        label="Adresse e-mail"
                        icon={Mail}
                        type="email"
                        placeholder="email@domaine.fr"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                    />
                </div>

                <div className="grid gap-4">
                    <AuthPasswordField
                        id="password"
                        label="Mot de passe"
                        icon={Lock}
                        placeholder="Au moins 12 caractères"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyUp={onPwdKey}
                        autoComplete="new-password"
                        visible={showPwd}
                        onToggleVisible={() => setShowPwd((value) => !value)}
                    />
                    <Button type="button" variant="tertiary" size="sm" className="w-full sm:w-fit" onClick={fillStrong} leftIcon={<Wand2 className="h-4 w-4" />}>
                        Générer un mot de passe solide
                    </Button>
                    {capsOn ? <p className="text-xs font-medium text-warning">Verr. Maj activé</p> : null}
                    {password ? (
                        <>
                            <PasswordStrength score={assessment.score} label={strengthLabel} percent={strengthPct} barClass={strengthBarClass} />
                            <PasswordChecklist items={checklistItems} />
                        </>
                    ) : null}
                </div>

                <div className="pt-1">
                    <AuthPasswordField
                        id="confirm"
                        label="Confirmer le mot de passe"
                        placeholder="Retaper le mot de passe"
                        required
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        autoComplete="new-password"
                        visible={showPwd}
                        onToggleVisible={() => setShowPwd((value) => !value)}
                        error={confirm.length > 0 && !match ? 'Les mots de passe ne correspondent pas.' : undefined}
                    />
                </div>

                {error ? (
                    <Alert variant="danger" title="Inscription impossible">
                        {error}
                    </Alert>
                ) : null}

                {!compact ? (
                    <Alert variant="info" icon={<CheckCircle2 className="h-4 w-4" />} title="À savoir">
                        Le compte donne accès à l’espace apprenant. Les formations deviennent disponibles après achat ou attribution.
                    </Alert>
                ) : null}

                <p className="text-xs leading-relaxed text-muted-foreground">
                    En créant ton compte, tu reconnais avoir lu les{' '}
                    <Link className="font-medium text-foreground underline underline-offset-4" href={legalRoutes.conditionsGenerales}>
                        conditions générales
                    </Link>{' '}
                    et la{' '}
                    <Link className="font-medium text-foreground underline underline-offset-4" href={legalRoutes.confidentialite}>
                        politique de confidentialité
                    </Link>.
                </p>

                <CsrfAvailability status={csrf.status} onRetry={() => void csrf.retry()} />

                <AuthSubmitButton pending={pending} pendingLabel={authContent.inscription.pending} disabled={!canSubmit} sticky={compact}>
                    {authContent.inscription.submit}
                </AuthSubmitButton>
            </form>
        </div>
    );
}

/** Panneau de demande de réinitialisation utilisé dans la modale auth. */
export function AuthForgotPasswordPanel({ compact = false }: AuthPanelProps = {}) {
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [sent, setSent] = useState<string | null>(null);
    const [error, setError] = useState('');
    const csrf = useCsrfToken();

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError('');
        setSent(null);
        if (!csrf.token) {
            setError('La connexion sécurisée n’est pas encore disponible. Réessaie dans un instant.');
            return;
        }
        setPending(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-csrf-token': csrf.token },
                body: JSON.stringify({ email }),
                credentials: 'same-origin',
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) setSent(data.devResetUrl || 'ok');
            else setSent('ok');
        } catch {
            setError('Erreur réseau. Réessaie.');
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={submit} className={compact ? 'grid gap-4' : 'grid gap-5'}>
            <AuthTextField
                id="email"
                label="Adresse e-mail"
                icon={Mail}
                type="email"
                required
                placeholder="email@domaine.fr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
            />

            {error ? (
                <Alert variant="danger" title="Demande impossible">
                    {error}
                </Alert>
            ) : null}

            {sent ? (
                <Alert variant="success" icon={<ShieldCheck className="h-4 w-4" />} title={authContent.forgotPassword.successTitle}>
                    {authContent.forgotPassword.successDescription}
                    {sent !== 'ok' ? (
                        <div className="mt-2 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <a className="break-all underline underline-offset-4" href={sent}>
                                {sent}
                            </a>
                        </div>
                    ) : null}
                </Alert>
            ) : null}

            <CsrfAvailability status={csrf.status} onRetry={() => void csrf.retry()} />

            <AuthSubmitButton pending={pending} pendingLabel={authContent.forgotPassword.pending} disabled={pending || csrf.status !== 'ready' || !email}>
                {authContent.forgotPassword.submit}
            </AuthSubmitButton>
        </form>
    );
}
