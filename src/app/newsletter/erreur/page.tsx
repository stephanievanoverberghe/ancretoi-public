import type { Metadata } from 'next';

import { newsletterRoutes } from '@/config/routes';
import { NewsletterErrorPage, type NewsletterErrorSearchParams } from '@/features/newsletter/error';

export const metadata: Metadata = {
    title: 'Erreur d’inscription',
    description: 'Impossible de confirmer ton adresse email.',
    alternates: { canonical: newsletterRoutes.erreur },
    robots: { index: false, follow: false },
};

export default function NewsletterErreurRoutePage({ searchParams }: { searchParams?: Promise<NewsletterErrorSearchParams> }) {
    return <NewsletterErrorPage searchParams={searchParams} />;
}
