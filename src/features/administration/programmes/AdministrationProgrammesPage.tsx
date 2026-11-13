import 'server-only';

import { Boxes, CheckCircle2, CircleAlert, CircleDashed, ClipboardCheck, Plus } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { requireAdmin } from '@/server/auth/authz';
import { getAdministrationProgrammesData } from '@/server/administration/programmes.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../shared';
import { AdminProgramsGridClient, type AdminProgramRow } from './components';

export async function AdministrationProgrammesPage() {
    await requireAdmin();
    let data: Awaited<ReturnType<typeof getAdministrationProgrammesData>>;
    try {
        data = await getAdministrationProgrammesData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les programmes" description="Les données n’ont pas pu être chargées. Réessayez dans quelques instants." icon={CircleAlert} />;
    }
    const { rows, stats } = data;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Programmes"
                description="Gérez les parcours, leur publication et la préparation des contenus depuis une vue unique."
                breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Programmes' }]}
                actions={
                    <LinkButton href="/administration/programmes/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                        Nouveau programme
                    </LinkButton>
                }
                stats={
                    <>
                        <AdminKpiCard label="Total" value={stats.total} icon={Boxes} />
                        <AdminKpiCard label="Publiés" value={stats.published} icon={CheckCircle2} />
                        <AdminKpiCard label="Préparation" value={stats.preflight} icon={ClipboardCheck} />
                        <AdminKpiCard label="Brouillons" value={stats.draft} icon={CircleDashed} />
                    </>
                }
            />

            <AdminProgramsGridClient rows={rows as AdminProgramRow[]} />
        </div>
    );
}
