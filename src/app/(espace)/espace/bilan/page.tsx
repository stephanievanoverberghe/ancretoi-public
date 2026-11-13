import { BilanPage } from '@/features/espace/bilan';
import { espaceRoutes } from '@/config/routes';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function BilanRoutePage() {
    const user = await requirePaidEspaceAccess(espaceRoutes.bilan);

    return <BilanPage learnerUserId={user.learnerUserId} />;
}
