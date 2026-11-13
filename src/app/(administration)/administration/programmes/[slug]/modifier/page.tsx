import { ModifierProgrammePage } from '@/features/administration/programmes/modifier';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ModifierProgrammeRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    return <ModifierProgrammePage params={params} />;
}
