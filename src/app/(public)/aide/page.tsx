import type { Metadata } from 'next';
import { AidePage } from '@/features/public/aide';

export const metadata: Metadata = {
    title: 'Aide',
    description: 'Centre d aide Ancre-toi : acces, parcours, notes, paiement et assistance.',
    alternates: { canonical: '/aide' },
    openGraph: {
        title: 'Aide - Ancre-toi',
        description: 'Centre d aide Ancre-toi : acces, parcours, notes, paiement et assistance.',
        url: '/aide',
    },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AideRoutePage() {
    return <AidePage />;
}