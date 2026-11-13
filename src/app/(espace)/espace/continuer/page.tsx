import 'server-only';
import { redirect } from 'next/navigation';

import { espaceRoutes, routeBuilders } from '@/config/routes';
import { ContinuerPage } from '@/features/espace/continuer';
import { getLearnerUserIdByEmail } from '@/server/apprentissage/espace-pages.service';
import { getNextStepForUser } from '@/server/apprentissage/getNextStep';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ContinuerRoutePage() {
    const user = await requirePaidEspaceAccess(espaceRoutes.continuer);
    const userId = await getLearnerUserIdByEmail(user.email);

    if (!userId) redirect(routeBuilders.authModal('login', '/espace'));

    const next = await getNextStepForUser(userId);
    redirect(next.href);

    return <ContinuerPage />;
}
