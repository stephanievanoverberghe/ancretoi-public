import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { AuthAccessPage } from '@/features/auth/access';

export const metadata: Metadata = {
    title: 'Connexion',
    description: 'Connecte-toi à ton espace apprenant Ancre-toi.',
    alternates: { canonical: '/connexion' },
    robots: { index: false, follow: true },
};

export default function ConnexionRoutePage() {
    return (
        <Suspense fallback={<BrandedPageLoading contained title="Ton espace se prépare" message="On installe un cadre calme pour la suite." />}>
            <AuthAccessPage mode="login" />
        </Suspense>
    );
}
