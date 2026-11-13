import type { Metadata } from 'next';

import { newsletterRoutes } from '@/config/routes';
import { NewsletterUnsubscribedPage } from '@/features/newsletter/unsubscribed';

export const metadata: Metadata = {
    title: 'Désinscription confirmée',
    description: 'Tu as bien été désinscrit(e) de la newsletter.',
    alternates: { canonical: newsletterRoutes.desinscription },
    robots: { index: false, follow: false },
};

export default function NewsletterDesinscriptionRoutePage() {
    return <NewsletterUnsubscribedPage />;
}
