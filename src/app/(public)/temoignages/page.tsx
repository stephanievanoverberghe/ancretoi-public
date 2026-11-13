import type { Metadata } from 'next';

import { publicRoutes } from '@/config/routes';
import { TemoignagesPage } from '@/features/public/temoignages';

export const metadata: Metadata = {
    title: 'Témoignages',
    description:
        'Retours d’expérience authentiques et publiés avec consentement sur les parcours Ancre-toi.',
    alternates: { canonical: publicRoutes.temoignages },
};

export default function TemoignagesRoutePage() {
    return <TemoignagesPage />;
}
