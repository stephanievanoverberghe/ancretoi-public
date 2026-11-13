import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Container, Section } from '@/components/ui';
import { cn } from '@/lib/cn';

import { SectionHeader } from './SectionHeader';

export type FaqItem = {
    question: string;
    answer: string;
};

export type FaqBlockProps = {
    eyebrow: string;
    title: string;
    description?: string;
    items: readonly FaqItem[];
    id?: string;
    className?: string;
};

/**
 * Section FAQ commune : en-tête centré + accordéon.
 */
export function FaqBlock({ eyebrow, title, description, items, id, className }: FaqBlockProps) {
    return (
        <Section id={id} spacing="lg" className={cn('scroll-mt-28 bg-surface', className)}>
            <Container size="lg">
                <SectionHeader align="center" eyebrow={eyebrow} title={title} description={description} />

                <Accordion type="single" collapsible className="mt-10 grid gap-3">
                    {items.map((item, index) => (
                        <AccordionItem key={item.question} value={`question-${index + 1}`}>
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>
                                <p>{item.answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Container>
        </Section>
    );
}
