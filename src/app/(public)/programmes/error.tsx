'use client';

import { AlertTriangle } from 'lucide-react';

import { Button, Card, CardContent, Container, LinkButton, Section } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export default function ProgramsError({ reset }: { reset: () => void }) {
    return (
        <Section spacing="lg" className="bg-background">
            <Container size="lg">
                <Card className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-elevated">
                    <CardContent className="p-6 text-center sm:p-8 lg:p-10">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-danger">
                            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-danger">Erreur de chargement</p>
                        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground">Impossible d’afficher les programmes</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Les parcours ne se chargent pas correctement pour le moment. Réessaie, ou reviens vers une page sûre.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button type="button" onClick={reset} className="w-full sm:w-fit">
                                Réessayer
                            </Button>
                            <LinkButton href={publicRoutes.home} variant="tertiary" className="w-full sm:w-fit">
                                Retour à l’accueil
                            </LinkButton>
                            <LinkButton href={publicRoutes.aide} variant="tertiary" className="w-full sm:w-fit">
                                Aller à l’aide
                            </LinkButton>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </Section>
    );
}
