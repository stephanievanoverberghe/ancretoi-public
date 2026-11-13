import { CheckCircle2, CreditCard, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Container, Section } from '@/components/ui';
import { homeContent } from '@/content/home';
import { cn } from '@/lib/cn';

const trustIcons = [LockKeyhole, CreditCard, ShieldCheck, HeartHandshake] as const;

const trustDescriptions = [
    'Ton espace reste personnel et séparé des pages publiques.',
    'Le paiement ouvre un accès formation, sans mélanger achat et progression.',
    'Chaque programme donne un cadre clair pour avancer sans surcharge.',
    'Les liens utiles restent accessibles pour revenir, demander de l’aide ou sortir.',
] as const;

export function HomeTrust() {
    return (
        <Section spacing="lg" className="bg-background">
            <Container size="xl">
                <div className="grid gap-10 border-y border-border py-8 sm:py-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16 lg:py-14">
                    <div>
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/14 text-accent" aria-hidden="true">
                            <ShieldCheck className="h-7 w-7" />
                        </span>
                        <div className="mt-7">
                            <SectionHeader
                                eyebrowVariant="secondary"
                                align="left"
                                eyebrow={homeContent.trust.eyebrow}
                                title={homeContent.trust.title}
                                description={homeContent.trust.description}
                            />
                        </div>
                    </div>

                    <ol className="grid sm:grid-cols-2">
                        {homeContent.trust.items.map((item, index) => {
                            const Icon = trustIcons[index] ?? CheckCircle2;
                            const description = trustDescriptions[index] ?? 'Un repère clair pour garder une expérience simple.';

                            return (
                                <li
                                    key={item}
                                    className={cn(
                                        'border-b border-border py-5 sm:px-6',
                                        index % 2 === 0 && 'sm:border-r',
                                        index < 2 && 'sm:pt-0',
                                        index >= 2 && 'sm:border-b-0 sm:pb-0',
                                    )}
                                >
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden="true">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <p className="mt-4 text-sm font-semibold text-foreground">{item}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </Container>
        </Section>
    );
}
