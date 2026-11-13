import { HelpCircle, MessageCircleQuestion } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Card, CardContent, Container, Section } from '@/components/ui';
import type { Program } from '@/types/programmes.types';

import { SectionHeader } from '@/components/marketing';

type ProgrammeDetailFaqSectionProps = {
    program: Program;
};

export function ProgrammeDetailFaqSection({ program }: ProgrammeDetailFaqSectionProps) {
    const faqItems = program.detail.faq;
    const faqContent = program.detail.faq_section;
    if (!faqItems.length) return null;

    return (
        <Section spacing="lg" className="mt-8 border-y border-border bg-surface-muted/35 sm:mt-10 lg:mt-12">
            <Container size="xl">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-start">
                    <Card className="overflow-hidden rounded-[2rem] border-primary/15 bg-surface">
                        <CardContent className="relative p-6 sm:p-8">
                            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
                            <div className="relative">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                                    <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />
                                </span>

                                <div className="mt-6">
                                    <SectionHeader
                                        eyebrow={faqContent.eyebrow}
                                        title={faqContent.title}
                                        description={faqContent.description}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Accordion type="single" collapsible className="grid gap-3">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={item.q} value={`question-${index + 1}`} className="rounded-[1.5rem]">
                                <AccordionTrigger className="gap-5 px-5 py-4 sm:px-6">
                                    <span className="flex min-w-0 items-start gap-4">
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <HelpCircle className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span className="pt-1">{item.q}</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="max-w-3xl text-base leading-relaxed">{item.a}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </Container>
        </Section>
    );
}
