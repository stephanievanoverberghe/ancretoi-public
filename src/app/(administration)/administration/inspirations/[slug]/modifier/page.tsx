import { ModifierInspirationPage } from '@/features/administration/inspirations/modifier';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ModifierInspirationRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    return <ModifierInspirationPage params={params} />;
}
