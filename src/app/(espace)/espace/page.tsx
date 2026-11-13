import 'server-only';
import { redirect } from 'next/navigation';

import { routeBuilders } from '@/config/routes';
import { EspaceDashboardPage } from '@/features/espace/dashboard';
import { getEspaceDashboardData } from '@/server/apprentissage/espace-pages.service';
import { requireUser } from '@/server/auth/authz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function EspaceRoutePage() {
    const user = await requireUser('/espace');
    const data = await getEspaceDashboardData(user);

    if (!data) redirect(routeBuilders.authModal('login', '/espace'));

    return <EspaceDashboardPage displayName={data.displayName} rows={data.rows} />;
}
