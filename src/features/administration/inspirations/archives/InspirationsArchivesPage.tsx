// src/features/administration/inspirations/archives/InspirationsArchivesPage.tsx
import 'server-only';

import { Archive, ArrowLeft, CircleAlert } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { requireAdmin } from '@/server/auth/authz';
import { getArchivedInspirationsData } from '@/server/administration/inspirations.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../../shared';
import { AdminInspirationsArchivedGrid } from './components';

export async function InspirationsArchivesPage() {
    await requireAdmin();
    let rows: Awaited<ReturnType<typeof getArchivedInspirationsData>>;
    try {
        rows = await getArchivedInspirationsData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les archives" description="Les inspirations archivées n’ont pas pu être chargées. Réessayez dans quelques instants." icon={CircleAlert} />;
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Archives des inspirations"
                description="Consultez les inspirations archivées et restaurez celles qui doivent redevenir actives."
                breadcrumbs={[
                    { label: 'Administration', href: '/administration' },
                    { label: 'Inspirations', href: '/administration/inspirations' },
                    { label: 'Archives' },
                ]}
                actions={
                    <LinkButton href="/administration/inspirations" variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                        Retour aux inspirations
                    </LinkButton>
                }
                stats={<AdminKpiCard label="Inspirations archivées" value={rows.length} icon={Archive} />}
            />

            <AdminInspirationsArchivedGrid rows={rows} />
        </div>
    );
}
