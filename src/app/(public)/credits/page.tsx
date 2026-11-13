import { CreditsPage } from '@/features/public/legal';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crédits',
    description: 'Crédits des contenus et ressources utilisés sur Ancre-toi.',
    alternates: { canonical: '/credits' },
};

export default function CreditsRoutePage() {
    return <CreditsPage />;
}
