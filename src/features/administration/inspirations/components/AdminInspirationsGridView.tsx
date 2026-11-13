import { Plus, SearchX } from 'lucide-react';

import { LinkButton } from '@/components/ui';

import { AdminStatePanel } from '../../shared';
import { AdminInspirationCard } from './AdminInspirationCard';
import type { AdminInspirationRow } from './admin-inspirations.types';

type AdminInspirationsGridViewProps = {
    rows: AdminInspirationRow[];
    allRowsCount: number;
    selectedTag: string;
    onTagToggle: (tag: string) => void;
    onPreview: (slug: string) => void;
};

export function AdminInspirationsGridView({ rows, allRowsCount, selectedTag, onTagToggle, onPreview }: AdminInspirationsGridViewProps) {
    if (rows.length === 0) {
        return (
            <AdminStatePanel
                kind={allRowsCount > 0 ? 'filtered-empty' : 'empty'}
                title={allRowsCount > 0 ? 'Aucun résultat avec ces filtres' : 'Aucune inspiration pour le moment'}
                description={allRowsCount > 0 ? 'Modifiez la recherche ou les filtres pour retrouver vos inspirations.' : 'Préparez votre première inspiration pour enrichir la galerie.'}
                icon={SearchX}
                action={
                    <LinkButton href="/administration/inspirations/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                        Nouvelle inspiration
                    </LinkButton>
                }
            />
        );
    }

    return (
        <ul className="grid grid-cols-1 gap-5 @min-[40rem]/admin-collection:grid-cols-2 @min-[72rem]/admin-collection:grid-cols-3">
            {rows.map((row) => (
                <AdminInspirationCard key={row.id} row={row} selectedTag={selectedTag} onTagToggle={onTagToggle} onPreview={onPreview} />
            ))}
        </ul>
    );
}
