'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { Alert, Button, type ButtonProps } from '@/components/ui';
import { routeBuilders } from '@/config/routes';

type StartOkRedirect = { ok: true; redirectTo: string; enrollmentId?: string; devBypass?: boolean };
type StartOkStripe = { url: string };
type StartAuth = { error: string; redirectTo: string };
type CheckoutButtonProps = {
    slug: string;
    isFree: boolean;
    className?: string;
    size?: ButtonProps['size'];
    label?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function hasString(object: Record<string, unknown>, key: string): object is Record<string, string> {
    return typeof object[key] === 'string';
}

function isStartAuth(value: unknown): value is StartAuth {
    return isRecord(value) && hasString(value, 'error') && hasString(value, 'redirectTo');
}

function isStartOkRedirect(value: unknown): value is StartOkRedirect {
    return isRecord(value) && value.ok === true && hasString(value, 'redirectTo');
}

function isStartOkStripe(value: unknown): value is StartOkStripe {
    return isRecord(value) && hasString(value, 'url');
}

function extractError(value: unknown): string | null {
    return isRecord(value) && typeof value.error === 'string' ? value.error : null;
}

export default function CheckoutButton({ slug, isFree, className, size = 'md', label }: CheckoutButtonProps) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const idleLabel = label ?? (isFree ? 'Commencer' : 'Acheter');
    const pendingLabel = isFree ? 'Ouverture...' : 'Redirection...';

    async function click() {
        if (pending) return;
        setError(null);
        setPending(true);
        try {
            const response = await fetch('/api/checkout/start', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ slug }),
            });
            const data: unknown = await response.json().catch(() => ({}));

            if (response.status === 401) {
                location.href = isStartAuth(data)
                    ? data.redirectTo
                    : routeBuilders.connexionWithNext(`/programmes/${slug}#commencer`);
                return;
            }

            if (!response.ok) {
                setError(extractError(data) || 'Cette action est momentanément indisponible.');
                return;
            }

            if (isStartOkRedirect(data)) {
                location.href = data.redirectTo;
                return;
            }

            if (isStartOkStripe(data)) {
                location.href = data.url;
                return;
            }

            setError('La réponse reçue est incomplète. Réessaie dans un instant.');
        } catch {
            setError('La connexion a été interrompue. Vérifie ton réseau puis réessaie.');
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="grid min-w-0 shrink-0 gap-2">
            <Button
                size={size}
                onClick={click}
                loading={pending}
                loadingLabel={pendingLabel}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className={className}
            >
                {pending ? pendingLabel : idleLabel}
            </Button>
            {error ? (
                <Alert variant="danger" className="max-w-sm py-2 text-xs">
                    {error}
                </Alert>
            ) : null}
        </div>
    );
}
