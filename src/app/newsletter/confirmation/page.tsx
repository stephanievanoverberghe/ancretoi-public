import type { Metadata } from 'next';

import { newsletterRoutes } from '@/config/routes';
import { NewsletterConfirmedPage } from '@/features/newsletter/confirmed';

export const metadata: Metadata = {
    title: 'Inscription confirmée',
    description: 'Merci ! Ton adresse est bien confirmée.',
    alternates: { canonical: newsletterRoutes.confirmation },
    robots: { index: false, follow: false },
};

export default function NewsletterConfirmationRoutePage() {
    return <NewsletterConfirmedPage />;
}
