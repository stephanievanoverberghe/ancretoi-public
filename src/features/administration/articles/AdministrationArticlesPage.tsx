// src/features/administration/articles/AdministrationArticlesPage.tsx
import 'server-only';

import { Archive, CheckCircle2, CircleAlert, CircleDashed, Newspaper, Plus } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { requireAdmin } from '@/server/auth/authz';
import { getAdministrationArticlesData } from '@/server/administration/articles.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../shared';
import { AdminPostsGridClient, type AdminPostRow, type CategoryOption } from './components';

export async function AdministrationArticlesPage() {
    await requireAdmin();
    let data: Awaited<ReturnType<typeof getAdministrationArticlesData>>;
    try {
        data = await getAdministrationArticlesData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les articles" description="Les données n’ont pas pu être chargées. Réessayez dans quelques instants." icon={CircleAlert} />;
    }
    const { rows, categories, stats, archivedCount } = data;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Articles"
                description="Recherchez, filtrez et publiez les contenus du blog depuis une vue adaptée au mobile comme au bureau."
                breadcrumbs={[{ label: 'Administration', href: '/administration' }, { label: 'Articles' }]}
                actions={
                    <>
                        <LinkButton href="/administration/articles/archives" variant="secondary" leftIcon={<Archive className="h-4 w-4" />}>
                            Archives ({archivedCount})
                        </LinkButton>
                        <LinkButton href="/administration/articles/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                            Nouvel article
                        </LinkButton>
                    </>
                }
                stats={
                    <>
                        <AdminKpiCard label="Total" value={stats.total} icon={Newspaper} />
                        <AdminKpiCard label="Publiés" value={stats.published} icon={CheckCircle2} />
                        <AdminKpiCard label="Brouillons" value={stats.draft} icon={CircleDashed} />
                        <AdminKpiCard label="Archivés" value={stats.archived} icon={Archive} />
                    </>
                }
            />

            <AdminPostsGridClient rows={rows as AdminPostRow[]} categories={categories as CategoryOption[]} />
        </div>
    );
}
