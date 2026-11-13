import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { publicRoutes } from '@/config/routes';

const publicationPrinciples = [
    'Accord explicite avant toute publication',
    'Contexte conservé pour éviter les promesses trompeuses',
    'Anonymisation possible à la demande',
] as const;

export function TemoignagesPage() {
    return (
        <div>
            <Section spacing="lg" className="relative overflow-hidden border-b border-border bg-surface">
                <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-secondary/12 blur-3xl" aria-hidden="true" />
                <Container size="xl" className="relative grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,0.7fr)] lg:items-center">
                    <div className="max-w-3xl">
                        <Badge variant="secondary" size="md">Retours d’expérience</Badge>
                        <h1 className="mt-5 max-w-[13ch] text-balance font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">Ici, aucune phrase n’est inventée.</h1>
                        <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">Cette page accueillera uniquement des retours authentiques, publiés avec accord et suffisamment de contexte pour rester justes.</p>
                    </div>

                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-border shadow-elevated">
                        <Image src={publicMedia.editorialFallback.src} alt="" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" style={{ objectPosition: publicMedia.editorialFallback.objectPosition }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <HeartHandshake className="h-7 w-7" aria-hidden="true" />
                            <p className="mt-3 max-w-[24ch] font-serif text-2xl leading-tight">La confiance avant la preuve sociale.</p>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section spacing="lg" className="bg-background">
                <Container size="xl">
                    <div className="grid gap-10 lg:grid-cols-[minmax(15rem,0.45fr)_minmax(0,1fr)] lg:gap-16">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">État de la collection</p>
                            <h2 className="mt-3 max-w-[13ch] font-serif text-3xl leading-tight text-foreground sm:text-4xl">Aucun retour public pour le moment.</h2>
                        </div>

                        <div>
                            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">Plutôt que de remplir cet espace avec des témoignages de démonstration, nous le laissons volontairement ouvert. Tu peux découvrir la méthode et le contenu des parcours sans promesse fabriquée.</p>
                            <ul className="mt-7 divide-y divide-border border-y border-border">
                                {publicationPrinciples.map((principle) => <li key={principle} className="flex items-start gap-3 py-4 text-sm leading-relaxed text-foreground sm:text-base"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{principle}</li>)}
                            </ul>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <LinkButton href={publicRoutes.methode} size="lg" className="w-full sm:w-fit">Découvrir la méthode<ArrowRight className="h-4 w-4" aria-hidden="true" /></LinkButton>
                                <LinkButton href={publicRoutes.programmes} variant="tertiary" size="lg" className="w-full sm:w-fit">Voir les programmes</LinkButton>
                            </div>
                            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />La confidentialité reste prioritaire, y compris lorsqu’un retour est partagé.</p>
                        </div>
                    </div>
                </Container>
            </Section>
        </div>
    );
}
