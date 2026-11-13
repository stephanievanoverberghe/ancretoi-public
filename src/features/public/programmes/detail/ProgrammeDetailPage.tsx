import type { Program, ProgramCurriculumDay } from '@/server/programmes';

import { formatPrice } from '@/features/public/programmes/programmes.utils';

import {
    ProgrammeDetailCurriculumSection,
    ProgrammeDetailFaqSection,
    ProgrammeDetailFinalCtaSection,
    ProgrammeDetailHeroSection,
    ProgrammeDetailInsideSection,
    ProgrammeDetailOutcomesSection,
    ProgrammeDetailOverviewSection,
    ProgrammeDetailPathSection,
    ProgrammeDetailStickyBar,
} from './sections';

type ProgrammeDetailPageProps = {
    program: Program;
    curriculum: ProgramCurriculumDay[];
    dailyLoadLabel?: string;
    schemaOrg: Record<string, unknown>;
};

export function ProgrammeDetailPage({ program, curriculum, dailyLoadLabel, schemaOrg }: ProgrammeDetailPageProps) {
    const isAvailable = program.price?.amount_cents != null;
    const isFree = program.price?.amount_cents === 0;
    const finalCta = program.detail.final_cta;

    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />

            <ProgrammeDetailHeroSection program={program} dailyLoadLabel={dailyLoadLabel} />
            <ProgrammeDetailOverviewSection program={program} />
            <ProgrammeDetailInsideSection program={program} />
            <ProgrammeDetailPathSection program={program} />
            <ProgrammeDetailCurriculumSection curriculum={curriculum} />
            <ProgrammeDetailOutcomesSection program={program} />
            <ProgrammeDetailFaqSection program={program} />
            <ProgrammeDetailFinalCtaSection program={program} />

            {isAvailable ? (
                <ProgrammeDetailStickyBar
                    title={program.title}
                    priceLabel={formatPrice(program.price)}
                    slug={program.slug}
                    isFree={isFree}
                    checkoutLabel={isFree ? finalCta.free_label : finalCta.purchase_label}
                />
            ) : null}
        </div>
    );
}
