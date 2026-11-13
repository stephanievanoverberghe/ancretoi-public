import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { ReinitialiserMotDePassePage } from '@/features/auth/reinitialiser-mot-de-passe';

export const metadata: Metadata = {
    title: 'Réinitialiser le mot de passe',
    description: 'Choisis un nouveau mot de passe pour ton compte Ancre-toi.',
    alternates: { canonical: '/reinitialiser-mot-de-passe' },
    robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePasseRoutePage() {
    return (
        <Suspense fallback={<BrandedPageLoading contained title="Ton espace se prépare" message="On installe un cadre calme pour la suite." />}>
            <ReinitialiserMotDePassePage />
        </Suspense>
    );
}
