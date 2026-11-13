import 'server-only';
import { notFound } from 'next/navigation';

import { FormationOverviewPage } from '@/features/espace/formations';
import { getFormationOverviewData } from '@/server/apprentissage/espace-pages.service';
import { requireUser } from '@/server/auth/authz';

type RouteParams = { programme: string };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function FormationOverviewRoutePage({ params }: { params: Promise<RouteParams> }) {
    const { programme } = await params;
    const safeSlug = programme.toLowerCase();
    const user = await requireUser(`/espace/formations/${safeSlug}`);
    const data = await getFormationOverviewData({ safeSlug, user });

    if (!data) notFound();

    return <FormationOverviewPage {...data} />;
}
