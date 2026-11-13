import type { Metadata } from 'next';

import { PaiementPage } from '@/features/paiement/PaiementPage';

export const metadata: Metadata = {
    title: 'Paiement',
    description: 'Accède au paiement sécurisé depuis le programme Ancre-toi choisi.',
    alternates: { canonical: '/paiement' },
    robots: { index: false, follow: true },
};

export default function PaiementRoutePage() {
    return <PaiementPage />;
}
