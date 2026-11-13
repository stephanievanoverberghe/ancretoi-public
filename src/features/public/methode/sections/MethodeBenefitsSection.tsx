import { HeartHandshake } from 'lucide-react';
import Image from 'next/image';

import { Container, Section } from '@/components/ui';
import { methodeContent } from '@/content/methode';
import { cn } from '@/lib/cn';

import { SectionHeader } from '@/components/marketing';

export function MethodeBenefitsSection() {
    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <Image
                src="/images/texture-soft.webp"
                alt=""
                fill
                sizes="100vw"
                className="pointer-events-none object-cover opacity-[0.18] mix-blend-multiply dark:opacity-[0.1] dark:mix-blend-soft-light"
            />
            <Container size="xl" className="relative">
                <SectionHeader
                    align="center"
                    eyebrow={methodeContent.benefits.eyebrow}
                    title={methodeContent.benefits.title}
                    description={methodeContent.benefits.description}
                />

                <ul className="mt-12 grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
                    {methodeContent.benefits.items.map((item, index) => (
                        <li
                            key={item.title}
                            className={cn(
                                'border-b border-border py-7 sm:px-7 lg:min-h-52 lg:px-8 lg:py-8',
                                index % 3 !== 2 && 'lg:border-r',
                                index >= 3 && 'lg:border-b-0',
                            )}
                        >
                            <span className="font-serif text-3xl font-semibold text-border" aria-hidden="true">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-7 font-serif text-2xl font-semibold leading-tight text-foreground">{item.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        </li>
                    ))}
                </ul>

                <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 border-l-2 border-primary pl-5 text-sm leading-relaxed text-muted-foreground sm:pl-6">
                    <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <p>{methodeContent.benefits.note}</p>
                </div>
            </Container>
        </Section>
    );
}
