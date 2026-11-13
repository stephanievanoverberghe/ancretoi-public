import { Plus, SearchX } from 'lucide-react';

import { LinkButton } from '@/components/ui';

import { AdminStatePanel } from '../../shared';

export default function AdminPostsEmptyState({ filtered = false }: { filtered?: boolean }) {
    return (
        <AdminStatePanel
            kind={filtered ? 'filtered-empty' : 'empty'}
            title={filtered ? 'Aucun résultat avec ces filtres' : 'Aucun article pour le moment'}
            description={filtered ? 'Modifiez la recherche ou les filtres pour retrouver vos articles.' : 'Rédigez votre premier article pour alimenter le blog.'}
            icon={SearchX}
            action={
                <LinkButton href="/administration/articles/nouveau" leftIcon={<Plus className="h-4 w-4" />}>
                    Nouvel article
                </LinkButton>
            }
        />
    );
}
