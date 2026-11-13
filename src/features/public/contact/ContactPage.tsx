import { ArrowRight, CheckCircle2, HelpCircle, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/motion';
import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { publicRoutes } from '@/config/routes';
import { legalIdentity } from '@/content/legal/legal-identity';

const preparationItems = [
    'L’adresse ou la page concernée',
    'Ce que tu essayais de faire',
    'Une capture d’écran si elle est utile',
] as const;

export function ContactPage() {
    const mailtoHref = `mailto:${legalIdentity.email}?subject=${encodeURIComponent('Contact Ancre-toi')}`;

    return (
        <div>
            <Section spacing="lg" className="relative overflow-hidden border-b border-border bg-surface">
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/12 blur-3xl" aria-hidden="true" />
                <Container size="xl" className="relative grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(22rem,0.72fr)] lg:items-center">
                    <div className="max-w-3xl">
                        <Reveal y={14}><Badge variant="secondary" size="md">Contact</Badge></Reveal>
                        <Reveal delay={0.08}><h1 className="mt-5 max-w-[12ch] text-balance font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">Une question ? Écris-nous simplement.</h1></Reveal>
                        <Reveal delay={0.14}><p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">Compte, accès, programme ou précision : partage le contexte utile, sans avoir à trouver les mots parfaits.</p></Reveal>
                        <Reveal delay={0.2}>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <LinkButton href={mailtoHref} size="lg" className="w-full sm:w-fit">Ouvrir l’e-mail<ArrowRight className="h-4 w-4" aria-hidden="true" /></LinkButton>
                                <LinkButton href={publicRoutes.aide} variant="tertiary" size="lg" className="w-full sm:w-fit">Consulter l’aide</LinkButton>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal delay={0.12} className="relative">
                        <div className="relative aspect-[3/2] overflow-hidden rounded-[2.5rem] border border-border shadow-elevated">
                            <Image src={publicMedia.helpContact.src} alt={publicMedia.helpContact.alt} fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" style={{ objectPosition: publicMedia.helpContact.objectPosition }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
                            <p className="absolute bottom-5 left-5 right-5 max-w-[28ch] font-serif text-2xl leading-tight text-white sm:bottom-7 sm:left-7">Un point de contact clair, sans formulaire interminable.</p>
                        </div>
                    </Reveal>
                </Container>
            </Section>

            <Section spacing="lg" className="bg-background">
                <Container size="xl" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.5fr)] lg:items-start lg:gap-14">
                    <div className="rounded-[2.25rem] border border-border bg-surface p-6 shadow-soft sm:p-8 lg:p-10">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true"><Mail className="h-5 w-5" /></span>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Par e-mail</p>
                        <h2 className="mt-2 max-w-[18ch] font-serif text-3xl leading-tight text-foreground sm:text-4xl">Explique ce que tu vois, on reprend à partir de là.</h2>
                        <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">Le contact se fait directement par e-mail. Tu gardes ainsi une copie de ta demande et peux joindre les éléments utiles.</p>
                        <a href={`mailto:${legalIdentity.email}`} className="mt-6 inline-flex items-center gap-2 break-all text-base font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">{legalIdentity.email}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></a>
                    </div>

                    <aside className="border-y border-border py-6 lg:sticky lg:top-28">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/10 text-secondary" aria-hidden="true"><HelpCircle className="h-5 w-5" /></span>
                        <h2 className="mt-4 font-serif text-2xl text-foreground">Pour nous aider à comprendre</h2>
                        <ul className="mt-5 grid gap-3">
                            {preparationItems.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{item}</li>)}
                        </ul>
                        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Pour une question fréquente, le centre d’aide peut te donner une réponse immédiate.</p>
                        <Link href={publicRoutes.aide} className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary">Aller au centre d’aide<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
                    </aside>
                </Container>
            </Section>
        </div>
    );
}
