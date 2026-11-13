import type { Metadata } from 'next';
import { MethodePage } from '@/features/public/methode';

export const metadata: Metadata = {
    title: 'Methode',
    description: 'La methode Ancre-toi : ancrage, boussole et alchimie pour avancer avec des rituels courts et tenables.',
    alternates: { canonical: '/methode' },
    openGraph: {
        title: 'Methode - Ancre-toi',
        description: 'La methode Ancre-toi : ancrage, boussole et alchimie pour avancer avec des rituels courts et tenables.',
        url: '/methode',
    },
};

export default function MethodeRoutePage() {
    return <MethodePage />;
}