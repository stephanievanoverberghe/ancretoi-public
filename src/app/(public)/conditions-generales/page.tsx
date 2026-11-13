import type { Metadata } from 'next';
import { ConditionsGeneralesPage } from '@/features/public/legal';

export const metadata: Metadata = {
    title: 'Conditions générales',
    description: "Conditions générales d'utilisation et de vente applicables au site et aux services Ancre-toi.",
    alternates: { canonical: '/conditions-generales' },
    openGraph: {
        title: 'Conditions générales',
        description: "Conditions générales d'utilisation et de vente applicables au site et aux services Ancre-toi.",
        url: '/conditions-generales',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function ConditionsGeneralesRoutePage() {
    return <ConditionsGeneralesPage />;
}