import { ArrowRight, Sparkles } from 'lucide-react';

import { CtaBand } from '@/components/marketing';
import { methodeContent } from '@/content/methode';

export function MethodeFinalCtaSection() {
    return (
        <CtaBand
            eyebrow={methodeContent.finalCta.eyebrow}
            title={methodeContent.finalCta.title}
            description={methodeContent.finalCta.description}
            primaryAction={{
                label: methodeContent.finalCta.primaryLabel,
                href: methodeContent.finalCta.primaryHref,
                icon: <Sparkles aria-hidden="true" className="h-4 w-4" />,
                iconPosition: 'start',
            }}
            secondaryAction={{
                label: methodeContent.finalCta.secondaryLabel,
                href: methodeContent.finalCta.secondaryHref,
                variant: 'tertiary',
                icon: <ArrowRight aria-hidden="true" className="h-4 w-4" />,
            }}
            asideTitle={methodeContent.finalCta.asideTitle}
            asideItems={methodeContent.finalCta.asideItems}
        />
    );
}
