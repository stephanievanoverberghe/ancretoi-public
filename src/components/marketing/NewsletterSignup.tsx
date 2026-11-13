'use client';

import { CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

type NewsletterSignupProps = {
    source?: string;
    className?: string;
};

type SignupStatus = 'idle' | 'loading' | 'ok' | 'error';

/**
 * Formulaire d'inscription newsletter (double opt-in : l'API envoie un
 * email de confirmation).
 */
export function NewsletterSignup({ source = 'footer', className }: NewsletterSignupProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<SignupStatus>('idle');

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!email.trim() || status === 'loading') return;

        setStatus('loading');
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, source }),
            });
            setStatus(response.ok ? 'ok' : 'error');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'ok') {
        return (
            <p className={cn('flex items-start gap-2 text-sm leading-relaxed text-foreground', className)} role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Presque fini ! Confirme ton inscription depuis l’email qu’on vient de t’envoyer.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className={className}>
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="ton@email.fr"
                        aria-label="Ton adresse e-mail"
                        className="pl-10"
                    />
                </div>
                <Button type="submit" loading={status === 'loading'} loadingLabel="Inscription…" className="shrink-0">
                    Recevoir l’inspiration
                </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {status === 'error'
                    ? 'Inscription impossible pour le moment. Vérifie ton adresse puis réessaie.'
                    : 'Un email de confirmation t’est envoyé. Désinscription possible à tout moment.'}
            </p>
        </form>
    );
}
