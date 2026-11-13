import { Plus, SearchX } from 'lucide-react';

import { LinkButton } from '@/components/ui';

import { AdminStatePanel } from '../../shared';
import { AdminCategoriesCardsView } from './AdminCategoriesCardsView';
import { AdminCategoriesTableView } from './AdminCategoriesTableView';
import type { AdminCategoryRow, CategoryViewMode } from './admin-categories.types';

type AdminCategoriesResultsProps = {
    rows: AdminCategoryRow[];
    view: CategoryViewMode;
    filtered?: boolean;
};

export function AdminCategoriesResults({ rows, view, filtered = false }: AdminCategoriesResultsProps) {
    if (rows.length === 0) {
        return (
            <AdminStatePanel
                kind={filtered ? 'filtered-empty' : 'empty'}
                title={filtered ? 'Aucun résultat avec ces filtres' : 'Aucune catégorie pour le moment'}
                description={filtered ? 'Modifiez la recherche ou les filtres pour retrouver vos catégories.' : 'Ajoutez votre première catégorie pour organiser le blog.'}
                icon={SearchX}
                action={
                    <LinkButton href="/administration/categories/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                        Nouvelle catégorie
                    </LinkButton>
                }
            />
        );
    }

    if (view === 'cards') return <AdminCategoriesCardsView rows={rows} />;

    return (
        <>
            <div className="@min-[72rem]/admin-collection:hidden">
                <AdminCategoriesCardsView rows={rows} />
            </div>
            <div className="hidden @min-[72rem]/admin-collection:block">
                <AdminCategoriesTableView rows={rows} />
            </div>
        </>
    );
}
