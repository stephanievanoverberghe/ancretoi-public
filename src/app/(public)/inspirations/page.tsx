import type { Metadata } from 'next';

import { InspirationsPage } from '@/features/public/inspirations';

export const metadata: Metadata = {
    title: 'Inspirations',
    description: 'Videos et ressources inspirantes selectionnees par Ancre-toi.',
    alternates: { canonical: '/inspirations' },
    openGraph: {
        title: 'Inspirations - Ancre-toi',
        description: 'Videos et ressources inspirantes selectionnees par Ancre-toi.',
        url: '/inspirations',
    },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function InspirationsRoutePage() {
    return <InspirationsPage />;
}
