import { SearchX } from 'lucide-react';

import { LinkButton } from '@/components/ui';
import { AdminStatePanel } from '@/features/administration/shared';

export default function AdminNotFound() {
    return (
        <div className="mx-auto grid min-h-[60vh] w-full max-w-[var(--container-max)] place-items-center py-6 sm:py-10">
            <div className="w-full">
                <AdminStatePanel
                    kind="empty"
                    title="Page introuvable"
                    description="Vérifiez l’adresse ou revenez au tableau de bord de l’administration."
                    icon={SearchX}
                    action={
                        <LinkButton href="/administration" variant="primary">
                            Tableau de bord
                        </LinkButton>
                    }
                />
            </div>
        </div>
    );
}
