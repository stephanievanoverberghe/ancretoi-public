import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { AuthAccessPage } from '@/features/auth/access';

export const metadata: Metadata = {
    title: 'Inscription',
    description: 'Crée ton espace apprenant Ancre-toi.',
    alternates: { canonical: '/inscription' },
    robots: { index: false, follow: true },
};

export default function InscriptionRoutePage() {
    return (
        <Suspense fallback={<BrandedPageLoading contained title="Ton espace se prépare" message="On installe un cadre calme pour la suite." />}>
            <AuthAccessPage mode="register" />
        </Suspense>
    );
}
