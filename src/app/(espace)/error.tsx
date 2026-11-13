'use client';

import { Button, LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { LearnerPage, LearnerState } from '@/features/espace/components';

export default function LearnerError({ reset }: { reset: () => void }) {
    return (
        <LearnerPage size="narrow" className="grid min-h-[55vh] place-items-center py-10">
            <LearnerState
                kind="error"
                className="w-full"
                title="Impossible de charger cette page"
                description="Tes données ne sont pas supprimées. Réessaie dans un instant, ou reviens à un endroit sûr de ton espace."
                actions={
                    <>
                    <Button type="button" onClick={reset}>
                        Réessayer
                    </Button>
                    <LinkButton href={espaceRoutes.root} variant="tertiary">
                        Tableau de bord
                    </LinkButton>
                    <LinkButton href={publicRoutes.aide} variant="tertiary">
                        Aller à l’aide
                    </LinkButton>
                    </>
                }
            />
        </LearnerPage>
    );
}
