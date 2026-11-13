import { ModifierCategoriePage } from '@/features/administration/categories/modifier';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ModifierCategorieRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    return <ModifierCategoriePage params={params} />;
}
