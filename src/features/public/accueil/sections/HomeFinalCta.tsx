import { ArrowRight, Compass, RotateCcw } from 'lucide-react';

import { CtaBand } from '@/components/marketing';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { homeContent } from '@/content/home';

type HomeFinalCtaProps = {
    hasActiveProgram?: boolean;
};

const reassuranceItems = ['Choisir le bon format', 'Avancer à ton rythme', 'Retrouver ton espace après connexion'] as const;

export function HomeFinalCta({ hasActiveProgram = false }: HomeFinalCtaProps) {
    const primaryHref = hasActiveProgram ? espaceRoutes.continuer : publicRoutes.programmes;
    const primaryLabel = hasActiveProgram ? homeContent.finalCta.activeProgramLabel : homeContent.finalCta.primaryLabel;
    const PrimaryIcon = hasActiveProgram ? RotateCcw : Compass;

    return (
        <CtaBand
            eyebrow={homeContent.finalCta.eyebrow}
            title={homeContent.finalCta.title}
            description={homeContent.finalCta.description}
            primaryAction={{
                label: primaryLabel,
                href: primaryHref,
                icon: <PrimaryIcon aria-hidden="true" className="h-4 w-4" />,
                iconPosition: 'start',
            }}
            secondaryAction={{
                label: homeContent.finalCta.secondaryLabel,
                href: publicRoutes.methode,
                variant: 'tertiary',
                icon: <ArrowRight aria-hidden="true" className="h-4 w-4" />,
            }}
            asideTitle={hasActiveProgram ? 'Ton parcours t’attend dans l’espace apprenant.' : 'Tu peux commencer par comparer les programmes.'}
            asideItems={reassuranceItems}
        />
    );
}
