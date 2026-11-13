import { AdministrationCategoriesPage } from '@/features/administration/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AdministrationCategoriesRoutePage() {
    return <AdministrationCategoriesPage />;
}
