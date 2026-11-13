import { Plus, SearchX } from 'lucide-react';

import { LinkButton } from '@/components/ui';

import { AdminStatePanel } from '../../shared';

export default function AdminProgramsEmptyState({ filtered = false }: { filtered?: boolean }) {
    return (
        <AdminStatePanel
            kind={filtered ? 'filtered-empty' : 'empty'}
            title={filtered ? 'Aucun résultat avec ces filtres' : 'Aucun programme pour le moment'}
            description={filtered ? 'Modifiez la recherche ou les filtres pour retrouver vos programmes.' : 'Créez votre premier programme pour commencer à structurer le catalogue.'}
            icon={SearchX}
            action={
                <LinkButton href="/administration/programmes/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                    Nouveau programme
                </LinkButton>
            }
        />
    );
}
