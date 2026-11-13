import { BookOpenCheck, Compass, FileText, Gauge, Layers3, NotebookPen, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { SectionHeader } from '@/components/marketing';
import { Badge, Container, Section } from '@/components/ui';
import { getProgrammeVisualIdentity } from '@/features/public/programmes/programme-visuals';
import { cn } from '@/lib/cn';
import type { Program, ProgramDetailInsideItemKind } from '@/types/programmes.types';

type ProgrammeDetailInsideSectionProps = {
    program: Program;
};

const insideIcons: Partial<Record<ProgramDetailInsideItemKind, typeof BookOpenCheck>> = {
    steps: BookOpenCheck,
    practice: Gauge,
    journal: NotebookPen,
    resources: FileText,
    access: ShieldCheck,
    review: Layers3,
    direction: Compass,
    integration: Sparkles,
};

export function ProgrammeDetailInsideSection({ program }: ProgrammeDetailInsideSectionProps) {
    const inside = program.detail.inside;
    if (!inside.items.length) return null;

    const [featuredItem, ...secondaryItems] = inside.items;
    const FeaturedIcon = insideIcons[featuredItem.kind] ?? BookOpenCheck;
    const visual = getProgrammeVisualIdentity(program.slug);
    const imageSrc = program.cover || '/images/programs/hero-programs.webp';

    return (
        <Section spacing="lg" className="relative overflow-hidden border-y border-border bg-surface-muted/35">
            <Container size="xl" className="relative">
                <SectionHeader eyebrow={inside.eyebrow} title={inside.title} description={inside.description} align="center" />

                <div className="mt-12 grid overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-elevated lg:grid-cols-[minmax(22rem,0.78fr)_minmax(0,1.22fr)]">
                    <div className="relative min-h-[30rem] overflow-hidden p-6 sm:p-8 lg:min-h-[42rem] lg:p-10">
                        <Image src={imageSrc} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/62 to-background/8" aria-hidden="true" />
                        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-45', visual.washClassName)} aria-hidden="true" />

                        <div className="relative flex h-full min-h-[26rem] flex-col justify-end lg:min-h-[36rem]">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn('grid h-12 w-12 place-items-center rounded-full ring-1 backdrop-blur', visual.iconClassName)} aria-hidden="true">
                                    <FeaturedIcon className="h-5 w-5" />
                                </span>
                                <Badge variant="outline" className="bg-background/80 backdrop-blur">
                                    {program.title}
                                </Badge>
                            </div>
                            <h3 className="mt-6 max-w-md font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{featuredItem.title}</h3>
                            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{featuredItem.description}</p>
                        </div>
                    </div>

                    <ul className="divide-y divide-border p-5 sm:p-7 lg:flex lg:flex-col lg:justify-center lg:p-9">
                        {secondaryItems.map(({ kind, title, description }, index) => {
                            const Icon = insideIcons[kind] ?? BookOpenCheck;

                            return (
                                <li key={title} className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:py-6">
                                    <div className="flex items-center justify-between sm:block">
                                        <span className="font-serif text-xl font-semibold text-border sm:hidden">{String(index + 2).padStart(2, '0')}</span>
                                        <span className={cn('grid h-11 w-11 place-items-center rounded-full ring-1', visual.iconClassName)} aria-hidden="true">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold leading-tight text-foreground">{title}</h4>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Container>
        </Section>
    );
}
