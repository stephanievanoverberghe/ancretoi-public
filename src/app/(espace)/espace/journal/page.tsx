import { JournalPage } from '@/features/espace/journal';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function JournalRoutePage() {
    await requirePaidEspaceAccess('/espace/journal');

    return <JournalPage />;
}
