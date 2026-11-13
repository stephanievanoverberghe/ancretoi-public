import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { AuthAccessPage } from '@/features/auth/access';

export const metadata: Metadata = {
    title: 'Mot de passe oublié',
    description: 'Demande un lien sécurisé pour réinitialiser ton mot de passe.',
    alternates: { canonical: '/mot-de-passe-oublie' },
    robots: { index: false, follow: true },
};

export default function MotDePasseOublieRoutePage() {
    return (
        <Suspense fallback={<BrandedPageLoading contained title="Ton espace se prépare" message="On installe un cadre calme pour la suite." />}>
            <AuthAccessPage mode="forgot" />
        </Suspense>
    );
}
