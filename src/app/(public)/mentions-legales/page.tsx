import type { Metadata } from 'next';
import { MentionsLegalesPage } from '@/features/public/legal';

export const metadata: Metadata = {
    title: 'Mentions légales',
    description: 'Mentions légales, informations éditeur, hébergeur, propriété intellectuelle et politique de protection des données.',
    alternates: { canonical: '/mentions-legales' },
    openGraph: {
        title: 'Mentions légales',
        description: 'Mentions légales, informations éditeur, hébergeur, propriété intellectuelle et politique de protection des données.',
        url: '/mentions-legales',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function MentionsLegalesRoutePage() {
    return <MentionsLegalesPage />;
}