import 'server-only';
import { notFound, redirect } from 'next/navigation';

import { FormationDayPage } from '@/features/espace/formations';
import { getFormationDayData } from '@/server/apprentissage/espace-pages.service';
import { requireUser } from '@/server/auth/authz';

type Params = { programme: string; jour: string };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function FormationDayRoutePage({ params }: { params: Promise<Params> }) {
    const { programme, jour } = await params;
    const safeSlug = programme.toLowerCase();
    const user = await requireUser(`/espace/formations/${safeSlug}/jour/${jour}`);
    const data = await getFormationDayData({
        safeSlug,
        requestedDay: Number.parseInt(jour, 10),
        userEmail: user.email,
    });

    if (data.status === 'not_found') notFound();
    if (data.status === 'redirect') redirect(data.href);

    return <FormationDayPage {...data.props} />;
}
