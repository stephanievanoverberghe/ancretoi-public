import type { Metadata } from 'next';

import { ProgrammesPage } from '@/features/public/programmes/catalog';

export const metadata: Metadata = {
    title: 'Programmes',
    description: 'Parcours bien-être courts, simples et tenables.',
    alternates: { canonical: '/programmes' },
    openGraph: {
        title: 'Programmes — Ancre-toi',
        description: 'Parcours bien-être courts, simples et tenables.',
        url: '/programmes',
    },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ProgrammesRoutePage() {
    return <ProgrammesPage />;
}
