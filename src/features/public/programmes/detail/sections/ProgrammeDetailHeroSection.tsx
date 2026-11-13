import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, Gauge, NotebookPen, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Badge, Breadcrumbs, Container, LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';
import { CheckoutButton } from '@/features/paiement/components';
import { getProgrammeVisualIdentity } from '@/features/public/programmes/programme-visuals';
import { formatPrice } from '@/features/public/programmes/programmes.utils';
import { cn } from '@/lib/cn';
import type { Program } from '@/types/programmes.types';

type ProgrammeDetailHeroSectionProps = {
    program: Program;
    dailyLoadLabel?: string;
};

const reassuranceItems = [
    { label: 'Accès personnel', icon: ShieldCheck },
    { label: 'Journal guidé', icon: NotebookPen },
    { label: 'Progression claire', icon: BookOpenCheck },
] as const;

function getHeroBenefits(program: Program) {
    const goals = program.detail?.goals ?? [];
    const includes = program.detail?.includes ?? [];
    const source = goals.length ? goals : includes;

    return source.length
        ? source.slice(0, 3)
        : ['Un cadre simple pour avancer sans te disperser.', 'Des étapes guidées à suivre à ton rythme.', 'Un espace clair pour garder le fil de ta progression.'];
}

export function ProgrammeDetailHeroSection({ program, dailyLoadLabel }: ProgrammeDetailHeroSectionProps) {
    const priceLabel = formatPrice(program.price);
    const isAvailable = program.price?.amount_cents != null;
    const isFree = program.price?.amount_cents === 0;
    const heroSrc = program.cover || '/images/programs/hero-programs.webp';
    const charge = dailyLoadLabel ?? 'Rythme guidé';
    const heroBenefits = getHeroBenefits(program);
    const finalCta = program.detail.final_cta;
    const checkoutLabel = isFree ? finalCta.free_label : finalCta.purchase_label;
    const visual = getProgrammeVisualIdentity(program.slug);

    return (
        <section id="commencer" aria-labelledby="programme-detail-title" className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden border-b border-border bg-background">
            <div className={cn('pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br blur-3xl', visual.washClassName)} aria-hidden="true" />

            <Container size="xl" className="relative py-8 sm:py-12 lg:py-16">
                <Breadcrumbs
                    variant="hero"
                    items={[
                        { label: 'Accueil', href: publicRoutes.home },
                        { label: 'Programmes', href: publicRoutes.programmes },
                        { label: program.title },
                    ]}
                />

                <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.72fr)] lg:items-center lg:gap-16">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold', visual.labelClassName)}>Parcours {visual.index}</span>
                            <Badge variant={isAvailable ? 'success' : 'outline'} size="md">
                                {isAvailable ? 'Disponible maintenant' : 'En préparation'}
                            </Badge>
                        </div>

                        <h1 id="programme-detail-title" className="mt-6 font-serif text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-foreground">
                            {program.title}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">{program.tagline}</p>

                        <dl className="mt-8 grid gap-4 border-y border-border py-5 sm:grid-cols-3">
                            <div>
                                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" /> Durée
                                </dt>
                                <dd className="mt-2 font-semibold text-foreground">{program.duration_days} jours</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    <Gauge className="h-4 w-4 text-primary" aria-hidden="true" /> Rythme
                                </dt>
                                <dd className="mt-2 font-semibold text-foreground">{charge}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Niveau
                                </dt>
                                <dd className="mt-2 font-semibold text-foreground">{program.level}</dd>
                            </div>
                        </dl>

                        <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
                            <p className="font-serif text-3xl font-semibold leading-none text-foreground">{priceLabel ?? 'Prix à venir'}</p>
                            <span className="pb-0.5 text-sm text-muted-foreground">{isAvailable ? 'accès personnel après achat' : 'ouverture prochaine'}</span>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {isAvailable ? (
                                <CheckoutButton slug={program.slug} isFree={isFree} size="lg" label={checkoutLabel} className="w-full rounded-xl px-6 sm:w-fit" />
                            ) : (
                                <LinkButton href={publicRoutes.contact} size="lg" className="w-full sm:w-fit">
                                    {finalCta.unavailable_label}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </LinkButton>
                            )}
                            <LinkButton href={publicRoutes.programmes} variant="tertiary" size="lg" className="w-full sm:w-fit">
                                Comparer les programmes
                            </LinkButton>
                        </div>

                        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                            {reassuranceItems.map(({ label, icon: Icon }) => (
                                <li key={label} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <aside className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end" aria-label="Résumé du programme">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-elevated sm:aspect-[5/6]">
                            <Image src={heroSrc} alt="" fill sizes="(max-width: 1024px) 92vw, 40vw" priority className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" aria-hidden="true" />

                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                                <div className="rounded-[1.75rem] border border-border bg-background/88 p-5 shadow-soft backdrop-blur-md">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ce parcours t’accompagne pour</p>
                                    <ul className="mt-4 grid gap-3">
                                        {heroBenefits.map((item) => (
                                            <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </Container>
        </section>
    );
}
