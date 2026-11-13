import { StatusPanel } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes } from '@/config/routes';

export function PaiementPage() {
    return (
        <StatusPanel
            tone="info"
            eyebrow="Paiement sécurisé"
            title="Choisis d’abord ton programme"
            message="Le paiement sécurisé démarre depuis la page du programme choisi. Aucun paiement ne peut être lancé depuis un lien isolé."
            actions={
                <>
                    <LinkButton href={publicRoutes.programmes} className="w-full sm:w-fit">
                        Voir les programmes
                    </LinkButton>
                    <LinkButton
                        href={espaceRoutes.root}
                        variant="tertiary"
                        className="w-full sm:w-fit"
                    >
                        Ouvrir mon espace
                    </LinkButton>
                </>
            }
        />
    );
}
