import { HomePage } from '@/features/public/accueil';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    alternates: { canonical: '/' },
};

export default function HomeRoutePage() {
    return <HomePage />;
}
