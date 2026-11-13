// src/features/administration/inspirations/AdministrationInspirationsPage.tsx
import 'server-only';

import { Archive, CheckCircle2, CircleAlert, CircleDashed, Lightbulb, Plus } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { requireAdmin } from '@/server/auth/authz';
import { getAdministrationInspirationsData } from '@/server/administration/inspirations.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../shared';
import { AdminInspirationsGridClient, type AdminInspirationRow } from './components';

export async function AdministrationInspirationsPage() {
    await requireAdmin();
    let data: Awaited<ReturnType<typeof getAdministrationInspirationsData>>;
    try {
        data = await getAdministrationInspirationsData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les inspirations" description="Les données n’ont pas pu être chargées. Réessayez dans quelques instants." icon={CircleAlert} />;
    }
    const { rows, stats } = data;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Inspirations"
                description="Centralisez les vidéos d’inspiration, leur préparation éditoriale et leur publication."
                breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Inspirations' }]}
                actions={
                    <>
                        <LinkButton href="/administration/inspirations/archives" variant="secondary" leftIcon={<Archive className="h-4 w-4" />}>
                            Archives ({stats.archived})
                        </LinkButton>
                        <LinkButton href="/administration/inspirations/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                            Nouvelle inspiration
                        </LinkButton>
                    </>
                }
                stats={
                    <>
                        <AdminKpiCard label="Total" value={stats.total} icon={Lightbulb} />
                        <AdminKpiCard label="Publiées" value={stats.published} icon={CheckCircle2} />
                        <AdminKpiCard label="Brouillons" value={stats.draft} icon={CircleDashed} />
                        <AdminKpiCard label="Archivées" value={stats.archived} icon={Archive} />
                    </>
                }
            />

            <AdminInspirationsGridClient rows={rows as AdminInspirationRow[]} />
        </div>
    );
}
