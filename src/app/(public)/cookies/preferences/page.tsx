import type { Metadata } from 'next';
import { CookiesPreferencesPage } from '@/features/public/legal/cookies-preferences';

export const metadata: Metadata = {
    title: 'Préférences Cookies',
    description: 'Gérez votre consentement et vos préférences de cookies sur le site Ancre-toi.',
    alternates: { canonical: '/cookies/preferences' },
    openGraph: {
        title: 'Préférences Cookies',
        description: 'Gérez votre consentement et vos préférences de cookies sur le site Ancre-toi.',
        url: '/cookies/preferences',
        siteName: 'Ancre-toi',
        type: 'website',
    },
};

export default function CookiesPreferencesRoutePage() {
    return <CookiesPreferencesPage />;
}
