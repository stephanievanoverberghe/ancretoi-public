import { espaceRoutes } from '@/config/routes';
import { Plan30JoursPage } from '@/features/espace/plan-30-jours';
import { getLearnerBilanDataForUserId } from '@/server/apprentissage/bilan.service';
import { requirePaidEspaceAccess } from '@/server/espace/access.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Plan30JoursRoutePage() {
    const user = await requirePaidEspaceAccess(espaceRoutes.plan30Jours);
    const bilan = await getLearnerBilanDataForUserId(user.learnerUserId);

    return (
        <Plan30JoursPage
            canAccessPlan={bilan?.canAccessPlan ?? false}
            reset7Progress={bilan?.reset7Progress ?? null}
        />
    );
}
