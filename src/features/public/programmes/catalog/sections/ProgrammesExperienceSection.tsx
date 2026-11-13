import { Container, Section } from '@/components/ui';
import { programmesContent } from '@/content/programmes';

import { ProgrammesExperienceSlider } from './ProgrammesExperienceSlider';
import { SectionHeader } from '@/components/marketing';

export function ProgrammesExperienceSection() {
    const { preview } = programmesContent.experience;

    return (
        <Section spacing="lg" className="border-y border-border bg-surface-muted/40">
            <Container size="xl">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
                    <div className="lg:pr-8">
                        <SectionHeader
                            eyebrow={programmesContent.experience.eyebrow}
                            title={programmesContent.experience.title}
                            description={programmesContent.experience.description}
                        />

                        <p className="mt-6 border-l-2 border-secondary pl-5 text-sm leading-relaxed text-muted-foreground">
                            {preview.note}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-elevated sm:p-4">
                        <ProgrammesExperienceSlider slides={preview.slides} ariaLabel={preview.sliderAriaLabel} />
                    </div>
                </div>
            </Container>
        </Section>
    );
}
