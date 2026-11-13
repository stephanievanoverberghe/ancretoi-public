import 'server-only';

import { ArrowRight, CheckCircle2, Compass, LifeBuoy, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Container, LinkButton, Section } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { espaceRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import { aideArticles } from '@/content/aide-articles';
import { aideContent } from '@/content/aide';

const contactIcons = { mail: Mail, compass: Compass, lifebuoy: LifeBuoy } as const;

const faqItems: { question: string; answer: ReactNode }[] = [
    {
        question: 'Je ne peux pas accéder au jour suivant',
        answer: <p>Le parcours est séquentiel. Pour débloquer le jour suivant, coche <strong>« Pratique faite »</strong>, écris au moins une réponse dans le journal, puis valide la journée depuis la leçon.</p>,
    },
    {
        question: 'Comment réinitialiser un jour ou tout le programme ?',
        answer: <p>Dans la page d’une leçon, utilise le bouton <strong>« Effacer »</strong> : une confirmation t’est demandée. Depuis le <Link href={espaceRoutes.bilan} className="font-medium text-primary underline underline-offset-2 hover:no-underline">bilan</Link>, tu peux réinitialiser tout le programme ; toutes les données du parcours seront alors supprimées.</p>,
    },
    {
        question: 'Où retrouver ou exporter mes notes ?',
        answer: <p>Rends-toi dans <Link href={espaceRoutes.notes} className="font-medium text-primary underline underline-offset-2 hover:no-underline">ton carnet</Link> pour relire tes réponses et les exporter en <strong>PDF</strong> ou <strong>JSON</strong>.</p>,
    },
    {
        question: 'Problème d’affichage ou bug',
        answer: <p>Vide le cache du navigateur, réessaye en navigation privée, puis change de navigateur si besoin. Si le problème persiste, <Link href={publicRoutes.contact} className="font-medium text-primary underline underline-offset-2 hover:no-underline">contacte-nous</Link> avec une capture d’écran et l’URL concernée.</p>,
    },
    {
        question: 'Paiement ou accès aux programmes',
        answer: <p>Si un achat ne s’affiche pas, déconnecte-toi puis reconnecte-toi et vérifie que tu utilises le bon e-mail. Sinon, <Link href={publicRoutes.contact} className="font-medium text-primary underline underline-offset-2 hover:no-underline">écris-nous</Link> en indiquant la date de l’achat et les quatre derniers chiffres de la carte utilisée.</p>,
    },
];

export async function AidePage() {
    return (
        <div>
            <Section spacing="lg" className="relative overflow-hidden border-b border-border bg-surface">
                <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/12 blur-3xl" aria-hidden="true" />
                <Container size="xl" className="relative grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.72fr)] lg:items-center">
                    <div className="max-w-3xl">
                        <Reveal y={14}><Badge variant="secondary" size="md">{aideContent.hero.eyebrow}</Badge></Reveal>
                        <Reveal delay={0.08}><h1 className="mt-5 max-w-[13ch] text-balance font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">{aideContent.hero.title}</h1></Reveal>
                        <Reveal delay={0.14}><p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{aideContent.hero.description}</p></Reveal>
                        <Reveal delay={0.2}>
                            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                                {aideContent.hero.meta.map((item) => <li key={item} className="inline-flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />{item}</li>)}
                            </ul>
                        </Reveal>
                    </div>

                    <Reveal delay={0.12} className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-border shadow-elevated">
                            <Image src={publicMedia.helpContact.src} alt={publicMedia.helpContact.alt} fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" style={{ objectPosition: publicMedia.helpContact.objectPosition }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
                            <p className="absolute bottom-5 left-5 right-5 max-w-[28ch] font-serif text-2xl leading-tight text-white sm:bottom-7 sm:left-7">Commence par la situation qui te bloque aujourd’hui.</p>
                        </div>
                    </Reveal>
                </Container>
            </Section>

            <Section spacing="lg" className="bg-background">
                <Container size="xl">
                    <div className="grid gap-8 lg:grid-cols-[minmax(14rem,0.45fr)_minmax(0,1fr)] lg:gap-14">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Par où commencer</p>
                            <h2 className="mt-3 max-w-[12ch] font-serif text-3xl leading-tight text-foreground sm:text-4xl">Choisis ton besoin, pas un menu.</h2>
                        </div>
                        <div className="divide-y divide-border border-y border-border">
                            {aideContent.contactCards.map((card, index) => {
                                const Icon = contactIcons[card.icon];
                                return (
                                    <Reveal key={card.title} delay={index * 0.06}>
                                        <Link href={card.href} className="group grid gap-4 py-6 transition sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:py-7">
                                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true"><Icon className="h-5 w-5" /></span>
                                            <span>
                                                <span className="block font-serif text-2xl leading-tight text-foreground transition group-hover:text-primary">{card.title}</span>
                                                <span className="mt-2 block max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{card.description}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">{card.ctaLabel}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                                        </Link>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </Section>

            <Section spacing="lg" className="border-y border-border bg-surface">
                <Container size="xl" className="grid gap-8 lg:grid-cols-[minmax(15rem,0.48fr)_minmax(0,1fr)] lg:gap-16">
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{aideContent.faq.eyebrow}</p>
                        <h2 className="mt-3 max-w-[13ch] font-serif text-3xl leading-tight text-foreground sm:text-4xl">{aideContent.faq.title}</h2>
                        <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">Ouvre uniquement la question qui ressemble à ta situation.</p>
                    </div>
                    <Accordion type="single" collapsible className="grid gap-3">
                        {faqItems.map((item, index) => <AccordionItem key={item.question} value={`question-${index + 1}`}><AccordionTrigger>{item.question}</AccordionTrigger><AccordionContent>{item.answer}</AccordionContent></AccordionItem>)}
                    </Accordion>
                </Container>
            </Section>

            <Section spacing="lg" className="bg-background">
                <Container size="xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Guides pratiques</p>
                    <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">Une réponse claire, étape par étape.</h2>
                    <ol className="mt-9 grid border-t border-border md:grid-cols-2">
                        {aideArticles.map((article, index) => (
                            <li key={article.slug} className="border-b border-border py-6 md:odd:pr-8 md:even:border-l md:even:pl-8">
                                <p className="text-xs font-semibold tabular-nums text-secondary">{String(index + 1).padStart(2, '0')}</p>
                                <h3 className="mt-2 font-serif text-2xl leading-tight text-foreground">{article.title}</h3>
                                <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{article.description}</p>
                                <Link href={routeBuilders.aideArticle(article.slug)} className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary">Lire le guide<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
                            </li>
                        ))}
                    </ol>
                </Container>
            </Section>

            <Section id="depannage" spacing="lg" className="scroll-mt-28 bg-surface-muted">
                <Container size="xl" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)] lg:items-start lg:gap-14">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{aideContent.troubleshooting.eyebrow}</p>
                        <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">{aideContent.troubleshooting.title}</h2>
                        <ol className="mt-8 border-t border-border">
                            {aideContent.troubleshooting.steps.map((step, index) => (
                                <li key={step} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 border-b border-border py-5">
                                    <span className="font-serif text-2xl text-primary">{index + 1}</span>
                                    <span className="pt-1 text-sm leading-relaxed text-foreground sm:text-base">{step}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-6 flex flex-col items-start gap-4 rounded-[1.75rem] border border-primary/20 bg-primary/8 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-[58ch] text-sm leading-relaxed text-foreground">{aideContent.troubleshooting.stillStuck}</p>
                            <LinkButton href={publicRoutes.contact} size="sm" className="shrink-0">{aideContent.troubleshooting.contactCta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></LinkButton>
                        </div>
                    </div>

                    <aside className="rounded-[2rem] border border-border bg-surface p-6 shadow-soft">
                        <h2 className="font-serif text-2xl text-foreground">{aideContent.quickLinks.title}</h2>
                        <ul className="mt-5 divide-y divide-border border-y border-border">
                            {aideContent.quickLinks.items.map((link) => <li key={link.href}><Link href={link.href} className="group flex items-center justify-between gap-3 py-4 text-sm font-medium text-foreground transition hover:text-primary">{link.label}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link></li>)}
                        </ul>
                    </aside>
                </Container>
            </Section>
        </div>
    );
}
