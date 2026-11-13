import { Compass, LifeBuoy } from 'lucide-react';

import { Card, CardContent, LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export default function NotFound() {
    return (
        <main
            id="main-content"
            tabIndex={-1}
            className="grid min-h-[70vh] place-items-center bg-background px-4 py-16 focus:outline-none"
        >
            <Card className="w-full max-w-2xl rounded-3xl text-center" variant="raised">
                <CardContent padding="lg">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                        Erreur 404
                    </p>
                    <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                        Cette page n’existe pas
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Le lien est peut-être incomplet. Reviens à une route sûre ou ouvre le centre
                        d’aide.
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <LinkButton
                            href={publicRoutes.home}
                            leftIcon={<Compass className="h-4 w-4" />}
                        >
                            Retour à l’accueil
                        </LinkButton>
                        <LinkButton
                            href={publicRoutes.aide}
                            variant="tertiary"
                            leftIcon={<LifeBuoy className="h-4 w-4" />}
                        >
                            Centre d’aide
                        </LinkButton>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
