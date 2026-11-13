import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { PaiementSuccesPage } from '@/features/paiement/succes';

export const metadata: Metadata = {
    title: 'Confirmation du paiement',
    description: 'Confirmation sécurisée de ton paiement Ancre-toi.',
    alternates: { canonical: '/paiement/succes' },
    robots: { index: false, follow: false },
};

export default function PaiementSuccesRoutePage() {
    return (
        <Suspense fallback={<BrandedPageLoading contained title="La transition se prépare" message="Nous vérifions les derniers détails en toute sécurité." />}>
            <PaiementSuccesPage />
        </Suspense>
    );
}
