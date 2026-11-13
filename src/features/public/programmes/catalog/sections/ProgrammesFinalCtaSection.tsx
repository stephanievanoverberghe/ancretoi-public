import { ArrowRight, Sparkles } from 'lucide-react';

import { CtaBand } from '@/components/marketing';
import { programmesContent } from '@/content/programmes';

export function ProgrammesFinalCtaSection() {
    return (
        <CtaBand
            eyebrow={programmesContent.finalCta.eyebrow}
            title={programmesContent.finalCta.title}
            description={programmesContent.finalCta.description}
            primaryAction={{
                label: programmesContent.finalCta.primaryLabel,
                href: programmesContent.finalCta.primaryHref,
                icon: <Sparkles aria-hidden="true" className="h-4 w-4" />,
                iconPosition: 'start',
            }}
            secondaryAction={{
                label: programmesContent.finalCta.secondaryLabel,
                href: programmesContent.finalCta.secondaryHref,
                variant: 'tertiary',
                icon: <ArrowRight aria-hidden="true" className="h-4 w-4" />,
            }}
            asideTitle={programmesContent.finalCta.asideTitle}
            asideItems={programmesContent.finalCta.asideItems}
        />
    );
}
