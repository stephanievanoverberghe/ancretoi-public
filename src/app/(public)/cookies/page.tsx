import type { Metadata } from 'next';
import { CookiesPage } from '@/features/public/legal';

export const metadata: Metadata = {
    title: 'Politique Cookies',
    description: 'Informations sur l’utilisation des cookies et traceurs, le paramétrage du consentement et vos droits.',
    alternates: { canonical: '/cookies' },
    openGraph: {
        title: 'Politique Cookies',
        description: 'Informations sur l’utilisation des cookies et traceurs, le paramétrage du consentement et vos droits.',
        url: '/cookies',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function CookiesRoutePage() {
    return <CookiesPage />;
}