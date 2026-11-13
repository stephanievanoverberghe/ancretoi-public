import type { Metadata } from 'next';
import { RetractationPage } from '@/features/public/legal';

export const metadata: Metadata = {
    title: 'Droit de rétractation',
    description: 'Informations sur l’exercice du droit de rétractation (14 jours), modalités, exceptions et modèle de formulaire.',
    alternates: { canonical: '/retractation' },
    openGraph: {
        title: 'Droit de rétractation',
        description: 'Informations sur l’exercice du droit de rétractation (14 jours), modalités, exceptions et modèle de formulaire.',
        url: '/retractation',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function RetractationRoutePage() {
    return <RetractationPage />;
}