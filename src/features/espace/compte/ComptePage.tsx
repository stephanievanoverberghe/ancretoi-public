import 'server-only';

import { UserRound } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { LearnerEmptyState, LearnerPage } from '@/features/espace/components';
import { getAccountProfile } from '@/server/auth/account-profile';

import { AccountHeader, AccountSettingsTabs } from './components';

export async function ComptePage() {
    const user = await getAccountProfile();
    if (!user?.email) {
        return (
            <LearnerPage size="narrow" spacing="none">
                <LearnerEmptyState
                    icon={UserRound}
                    title="Ton profil est momentanément indisponible"
                    description="Nous n’avons pas retrouvé les informations de ton compte. Tes parcours ne sont pas supprimés."
                    actions={
                        <>
                            <LinkButton href={espaceRoutes.root}>Revenir à mon espace</LinkButton>
                            <LinkButton href={publicRoutes.aide} variant="tertiary">Consulter l’aide</LinkButton>
                        </>
                    }
                />
            </LearnerPage>
        );
    }

    return (
        <LearnerPage size="wide" spacing="relaxed" className="min-w-0">
            <AccountHeader user={user} />
            <AccountSettingsTabs user={user} />
        </LearnerPage>
    );
}
