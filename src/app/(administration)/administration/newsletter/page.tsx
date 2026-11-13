import { AdministrationNewsletterPage, type NewsletterSearchParams } from '@/features/administration/newsletter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdministrationNewsletterRoutePage({ searchParams }: { searchParams?: Promise<NewsletterSearchParams> }) {
    return <AdministrationNewsletterPage searchParams={searchParams} />;
}
