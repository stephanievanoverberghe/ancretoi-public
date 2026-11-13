import type { Metadata } from 'next';
import { ConfidentialitePage } from '@/features/public/legal';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    description: 'Comment nous collectons, utilisons, stockons et protégeons vos données personnelles (RGPD).',
    alternates: { canonical: '/confidentialite' },
    openGraph: {
        title: 'Politique de confidentialité',
        description: 'Comment nous collectons, utilisons, stockons et protégeons vos données personnelles (RGPD).',
        url: '/confidentialite',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function ConfidentialiteRoutePage() {
    return <ConfidentialitePage />;
}