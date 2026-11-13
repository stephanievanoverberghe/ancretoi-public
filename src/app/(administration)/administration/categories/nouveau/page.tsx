import { NouvelleCategoriePage } from '@/features/administration/categories/nouveau';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function NouvelleCategorieRoutePage() {
    return <NouvelleCategoriePage />;
}
