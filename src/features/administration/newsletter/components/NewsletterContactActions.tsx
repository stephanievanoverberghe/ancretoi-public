'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui';

export default function NewsletterContactActions({ email, unsubscribeToken }: { email: string; unsubscribeToken?: string | null }) {
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

    if (!unsubscribeToken) return <span className="text-xs text-muted-foreground">Lien indisponible</span>;

    const copyUnsubscribeLink = async () => {
        const path = `/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
        const url = new URL(path, window.location.origin).toString();

        try {
            await navigator.clipboard.writeText(url);
            setCopyState('copied');
            window.setTimeout(() => setCopyState('idle'), 2000);
        } catch {
            setCopyState('error');
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={copyUnsubscribeLink}
                aria-label={`Copier le lien de désinscription de ${email}`}
                leftIcon={copyState === 'copied' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            >
                {copyState === 'copied' ? 'Lien copié' : copyState === 'error' ? 'Copie impossible' : 'Copier le lien'}
            </Button>
            <span className="sr-only" role="status" aria-live="polite">
                {copyState === 'copied' ? 'Lien de désinscription copié.' : copyState === 'error' ? 'La copie du lien a échoué.' : ''}
            </span>
        </div>
    );
}
