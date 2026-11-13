import { SearchX } from 'lucide-react';

import { Card, CardContent, Container, LinkButton, Section } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export default function ProgramNotFound() {
    return (
        <Section spacing="lg" className="bg-background">
            <Container size="lg">
                <Card className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-elevated">
                    <CardContent className="p-6 text-center sm:p-8 lg:p-10">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <SearchX className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primary">Programme indisponible</p>
                        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground">Ce programme n’est pas accessible</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Il peut être en préparation, non publié ou déplacé. Reviens au catalogue pour choisir un parcours disponible.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <LinkButton href={publicRoutes.programmes} className="w-full sm:w-fit">
                                Voir les programmes
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
