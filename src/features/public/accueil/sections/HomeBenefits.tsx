import { NotebookPen, ShieldCheck, Target } from 'lucide-react';

import { Container, Section } from '@/components/ui';
import { homeContent } from '@/content/home';

import { SectionHeader } from '@/components/marketing';

const benefitIcons = {
    journal: NotebookPen,
    shield: ShieldCheck,
    target: Target,
} as const;

export function HomeBenefits() {
    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <Container size="xl">
                <SectionHeader eyebrowVariant="secondary" align="center"
                    eyebrow={homeContent.benefits.eyebrow}
                    title={homeContent.benefits.title}
                    description={homeContent.benefits.description}
                />

                <ol className="mt-12 grid border-y border-border md:grid-cols-3">
                    {homeContent.benefits.items.map((item, index) => {
                        const Icon = benefitIcons[item.icon];

                        return (
                            <li key={item.title} className="group relative py-7 md:border-l md:border-border md:px-7 md:first:border-l-0 lg:px-10 lg:py-10">
                                <div className="flex items-start justify-between gap-5">
                                    <span className="font-serif text-4xl font-semibold leading-none text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                </div>
                                <h3 className="mt-8 max-w-xs font-serif text-2xl leading-tight text-foreground">{item.title}</h3>
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">{item.description}</p>
                            </li>
                        );
                    })}
                </ol>
            </Container>
        </Section>
    );
}
