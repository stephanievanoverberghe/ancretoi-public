'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, LayoutDashboard, RotateCcw } from 'lucide-react';

import { Button, LinkButton } from '@/components/ui';

export default function AdministrationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const panelRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        panelRef.current?.focus();
    }, []);

    return (
        <div className="mx-auto grid min-h-[55vh] w-full max-w-[var(--container-max)] place-items-center py-6 sm:py-10">
            <section
                ref={panelRef}
                role="alert"
                aria-labelledby="administration-error-title"
                aria-describedby="administration-error-description"
                tabIndex={-1}
                className="w-full max-w-2xl rounded-3xl border border-danger/25 bg-surface p-5 text-center shadow-soft outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:p-8"
            >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger" aria-hidden="true">
                    <AlertTriangle className="h-5 w-5" />
                </span>
                <h1 id="administration-error-title" className="mt-5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                    Impossible d’afficher cette page
                </h1>
                <p id="administration-error-description" className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Un problème temporaire empêche le chargement. Réessayez maintenant ou revenez au tableau de bord de l’administration.
                </p>
                <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
                    <LinkButton href="/administration" variant="secondary" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                        Tableau de bord
                    </LinkButton>
                    <Button type="button" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
                        Réessayer
                    </Button>
                </div>
            </section>
        </div>
    );
}
