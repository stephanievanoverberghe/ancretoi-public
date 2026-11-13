import 'server-only';

import { Archive, ArrowLeft, CircleAlert } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { administrationRoutes } from '@/config/routes';
import { requireAdmin } from '@/server/auth/authz';
import { getArchivedArticlesData } from '@/server/administration/articles.service';

import { AdminKpiCard, AdminPageHeader, AdminStatePanel } from '../../shared';
import { AdminPostsArchivedGrid } from './components';

export async function ArticlesArchivesPage() {
    await requireAdmin();
    let rows: Awaited<ReturnType<typeof getArchivedArticlesData>>;
    try {
        rows = await getArchivedArticlesData();
    } catch {
        return <AdminStatePanel kind="error" title="Impossible de charger les archives" description="Les articles archivés n’ont pas pu être chargés. Réessayez dans quelques instants." icon={CircleAlert} />;
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <AdminPageHeader
                title="Archives des articles"
                description="Restaurez un article archivé ou supprimez-le définitivement après vérification."
                breadcrumbs={[
                    { label: 'Administration', href: '/administration' },
                    { label: 'Articles', href: administrationRoutes.articles },
                    { label: 'Archives' },
                ]}
                actions={
                    <LinkButton href={administrationRoutes.articles} variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                        Retour aux articles
                    </LinkButton>
                }
                stats={<AdminKpiCard label="Articles archivés" value={rows.length} icon={Archive} />}
            />

            <AdminPostsArchivedGrid rows={rows} />
        </div>
    );
}
