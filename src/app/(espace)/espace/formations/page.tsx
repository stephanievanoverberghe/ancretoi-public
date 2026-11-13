import 'server-only';

import { espaceRoutes } from '@/config/routes';
import { FormationsPage } from '@/features/espace/formations';
import { getEspaceDashboardData } from '@/server/apprentissage/espace-pages.service';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';

export default async function FormationsRoutePage() {
    const user = await requirePaidEspaceAccess(espaceRoutes.formations);
    const data = await getEspaceDashboardData(user);

    return <FormationsPage courses={data?.rows ?? []} />;
}
