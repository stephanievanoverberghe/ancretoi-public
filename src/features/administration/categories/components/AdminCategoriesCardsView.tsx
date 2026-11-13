import { AdminCategoryCard } from './AdminCategoryCard';
import type { AdminCategoryRow } from './admin-categories.types';

type AdminCategoriesCardsViewProps = {
    rows: AdminCategoryRow[];
};

export function AdminCategoriesCardsView({ rows }: AdminCategoriesCardsViewProps) {
    return (
        <ul className="grid grid-cols-1 gap-5 @min-[40rem]/admin-collection:grid-cols-2 @min-[72rem]/admin-collection:grid-cols-3">
            {rows.map((row) => (
                <AdminCategoryCard key={row.id} row={row} />
            ))}
        </ul>
    );
}
