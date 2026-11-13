import { Info } from 'lucide-react';

import { SectionHeader } from '@/components/marketing';
import { Reveal } from '@/components/motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Container, Section } from '@/components/ui';
import { programmesContent } from '@/content/programmes';
import type { ProgramCurriculumDay } from '@/server/programmes';

type ProgrammeDetailCurriculumSectionProps = {
    curriculum: ProgramCurriculumDay[];
};

const WEEK_SIZE = 7;
const FLAT_LIST_MAX_DAYS = 14;

function chunkByWeek(days: ProgramCurriculumDay[]) {
    const weeks: ProgramCurriculumDay[][] = [];
    for (let i = 0; i < days.length; i += WEEK_SIZE) {
        weeks.push(days.slice(i, i + WEEK_SIZE));
    }
    return weeks;
}

function DayRow({ day }: { day: ProgramCurriculumDay }) {
    const copy = programmesContent.detailCurriculum;

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                {String(day.index).padStart(2, '0')}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {copy.dayLabel} {day.index}
                </p>
                <p className="truncate text-sm font-medium text-foreground sm:text-base">{day.title || copy.fallbackDayTitle}</p>
            </div>
        </div>
    );
}

export function ProgrammeDetailCurriculumSection({ curriculum }: ProgrammeDetailCurriculumSectionProps) {
    if (!curriculum.length) return null;

    const copy = programmesContent.detailCurriculum;
    const useFlatList = curriculum.length <= FLAT_LIST_MAX_DAYS;
    const weeks = useFlatList ? [] : chunkByWeek(curriculum);

    return (
        <Section id="curriculum" spacing="lg" className="scroll-mt-28 border-y border-border bg-surface-muted/40">
            <Container size="xl">
                <SectionHeader align="center" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

                {useFlatList ? (
                    <div className="mt-12 grid gap-3 sm:grid-cols-2">
                        {curriculum.map((day, index) => (
                            <Reveal key={day.index} delay={Math.min(index * 0.04, 0.32)} y={16}>
                                <DayRow day={day} />
                            </Reveal>
                        ))}
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="mt-12 grid gap-3">
                        {weeks.map((week, weekIndex) => {
                            const first = week[0]?.index;
                            const last = week[week.length - 1]?.index;

                            return (
                                <AccordionItem key={`week-${weekIndex + 1}`} value={`week-${weekIndex + 1}`}>
                                    <AccordionTrigger>
                                        {copy.weekLabel} {weekIndex + 1} · {copy.dayLabel.toLowerCase()}s {first} à {last}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {week.map((day) => (
                                                <DayRow key={day.index} day={day} />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}

                <Reveal delay={0.1}>
                    <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm leading-relaxed text-muted-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        {copy.note}
                    </p>
                </Reveal>
            </Container>
        </Section>
    );
}
