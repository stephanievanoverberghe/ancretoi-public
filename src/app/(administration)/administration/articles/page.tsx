import { AdministrationArticlesPage } from '@/features/administration/articles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AdministrationArticlesRoutePage() {
    return <AdministrationArticlesPage />;
}
