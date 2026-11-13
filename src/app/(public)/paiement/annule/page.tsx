import type { Metadata } from 'next';

import { PaiementAnnulePage } from '@/features/paiement/annule';

export const metadata: Metadata = {
    title: 'Paiement annulé',
    description: 'Ton paiement Ancre-toi a été annulé.',
    alternates: { canonical: '/paiement/annule' },
    robots: { index: false, follow: false },
};

export default function PaiementAnnuleRoutePage() {
    return <PaiementAnnulePage />;
}
