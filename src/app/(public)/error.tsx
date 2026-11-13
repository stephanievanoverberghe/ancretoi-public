'use client';

import { Button, LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export default function PublicError({ reset }: { reset: () => void }) {
    return (
        <section className="grid min-h-[55vh] place-items-center bg-background px-4 py-16">
            <div
                role="alert"
                className="w-full max-w-2xl rounded-3xl border border-danger/25 bg-surface p-6 text-center shadow-elevated sm:p-8"
            >
                <p className="text-sm font-semibold text-danger">Page momentanément indisponible</p>
                <h1 className="mt-3 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                    Nous n’avons pas pu charger ce contenu
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    Réessaie dans un instant. Si le problème continue, le centre d’aide reste
                    accessible.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button type="button" onClick={reset}>
                        Réessayer
                    </Button>
                    <LinkButton href={publicRoutes.aide} variant="tertiary">
                        Centre d’aide
                    </LinkButton>
                </div>
            </div>
        </section>
    );
}
