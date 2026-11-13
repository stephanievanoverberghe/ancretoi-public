import { NotesPage } from '@/features/espace/journal';
import { espaceRoutes } from '@/config/routes';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function NotesRoutePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    await requirePaidEspaceAccess(espaceRoutes.notes);

    return <NotesPage searchParams={searchParams} />;
}
