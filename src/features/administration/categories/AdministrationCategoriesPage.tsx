// src/features/administration/categories/AdministrationCategoriesPage.tsx
import 'server-only';

import { CheckCircle2, CircleAlert, Plus, Tags, Unlink } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { requireAdmin } from '@/server/auth/authz';
import { getAdministrationCategoriesData } from '@/server/administration/categories.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../shared';
import { AdminCategoriesGridClient, type AdminCategoryRow } from './components';

export async function AdministrationCategoriesPage() {
    await requireAdmin();
    let data: Awaited<ReturnType<typeof getAdministrationCategoriesData>>;
    try {
        data = await getAdministrationCategoriesData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les catégories" description="Les données n’ont pas pu être chargées. Réessayez dans quelques instants." icon={CircleAlert} />;
    }
    const { rows, stats } = data;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Catégories"
                description="Organisez la taxonomie du blog et repérez immédiatement les catégories encore inutilisées."
                breadcrumbs={[
                    { label: 'Administration', href: '/administration' },
                    { label: 'Articles', href: '/administration/articles' },
                    { label: 'Catégories' },
                ]}
                actions={
                    <>
                        <LinkButton href="/administration/articles" variant="secondary">
                            Retour aux articles
                        </LinkButton>
                        <LinkButton href="/administration/categories/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                            Nouvelle catégorie
                        </LinkButton>
                    </>
                }
                stats={
                    <>
                        <AdminKpiCard label="Total" value={stats.total} icon={Tags} />
                        <AdminKpiCard label="Utilisées" value={stats.used} icon={CheckCircle2} />
                        <AdminKpiCard label="Inutilisées" value={stats.unused} icon={Unlink} />
                    </>
                }
            />

            <AdminCategoriesGridClient rows={rows as AdminCategoryRow[]} />
        </div>
    );
}
